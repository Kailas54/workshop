const sessions = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a workshop session room
    socket.on('joinSession', async ({ sessionId, role, userId, name }) => {
      socket.join(sessionId);
      socket.sessionId = sessionId;
      socket.role = role;
      socket.userId = userId;
      socket.name = name;

      console.log(`[Socket] User ${name} (${role}) joined session ${sessionId}`);
      
      if (!sessions[sessionId]) {
        sessions[sessionId] = { gamesEnabled: false, assessmentMode: false, flowWorkflow: null };
      }

      // Notify the mentor/room about the new student
      if (role === 'student') {
        io.to(sessionId).emit('studentJoined', { userId, name, socketId: socket.id });
        socket.emit('mentor:toggleGames', { gamesEnabled: sessions[sessionId].gamesEnabled });
        socket.emit('mentor:toggleAssessment', { assessmentMode: sessions[sessionId].assessmentMode });
        // Replay saved flow workflow for late-joining students
        if (sessions[sessionId].flowWorkflow) {
          socket.emit('mentor:pushFlowWorkflow', sessions[sessionId].flowWorkflow);
        }
      } else if (role === 'mentor') {
        // If mentor joins, send them all currently connected students
        const sockets = await io.in(sessionId).fetchSockets();
        sockets.filter(s => s.role === 'student').forEach(s => {
          socket.emit('studentJoined', { userId: s.userId, name: s.name, socketId: s.id });
        });
      }
    });

    // Mentor broadcasting code to students
    socket.on('mentor:broadcast', ({ code }) => {
      if (socket.role === 'mentor') {
        socket.to(socket.sessionId).emit('mentor:broadcast', { code });
      }
    });

    // Mentor toggling games access
    socket.on('mentor:toggleGames', ({ gamesEnabled }) => {
      if (socket.role === 'mentor') {
        if (!sessions[socket.sessionId]) sessions[socket.sessionId] = {};
        sessions[socket.sessionId].gamesEnabled = gamesEnabled;
        io.to(socket.sessionId).emit('mentor:toggleGames', { gamesEnabled });
      }
    });

    // Mentor toggling assessment mode
    socket.on('mentor:toggleAssessment', ({ assessmentMode }) => {
      if (socket.role === 'mentor') {
        if (!sessions[socket.sessionId]) sessions[socket.sessionId] = {};
        sessions[socket.sessionId].assessmentMode = assessmentMode;
        io.to(socket.sessionId).emit('mentor:toggleAssessment', { assessmentMode });
      }
    });

    // Mentor pushing a checkpoint
    socket.on('mentor:pushCheckpoint', (checkpointData) => {
      if (socket.role === 'mentor') {
        io.to(socket.sessionId).emit('mentor:pushCheckpoint', checkpointData);
      }
    });

    // Student updating their status on a checkpoint
    socket.on('student:statusUpdate', ({ checkpointId, status, error }) => {
      if (socket.role === 'student') {
        io.to(socket.sessionId).emit('student:statusUpdate', {
          userId: socket.userId,
          name: socket.name,
          checkpointId,
          status, // 'passed', 'attempted_error', 'not_started'
          error,
        });
      }
    });

    // Student updating focus status
    socket.on('student:focusUpdate', ({ eventType, details }) => {
      if (socket.role === 'student') {
        io.to(socket.sessionId).emit('student:focusUpdate', {
          userId: socket.userId,
          eventType,
          details,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Student raising hand
    socket.on('student:raiseHand', ({ checkpointId, code, error }) => {
      if (socket.role === 'student') {
        io.to(socket.sessionId).emit('student:raiseHand', {
          userId: socket.userId,
          name: socket.name,
          checkpointId,
          code,
          error,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Mentor resolving hand
    socket.on('mentor:resolveHand', ({ userId }) => {
      if (socket.role === 'mentor') {
        io.to(socket.sessionId).emit('mentor:resolveHand', { userId });
      }
    });

    // Mentor replying to hand with edited code and message
    socket.on('mentor:replyHand', ({ userId, code, message }) => {
      if (socket.role === 'mentor') {
        io.to(socket.sessionId).emit('mentor:replyHand', { userId, code, message });
      }
    });

    // ─── Flow Lab Events ────────────────────────────────────────────────────

    // Mentor pushes a starter workflow (pre-built nodes + edges) to all students
    socket.on('mentor:pushFlowWorkflow', ({ nodes, edges, levelId }) => {
      if (socket.role === 'mentor') {
        const payload = { nodes, edges, levelId };
        if (!sessions[socket.sessionId]) sessions[socket.sessionId] = {};
        sessions[socket.sessionId].flowWorkflow = payload;
        io.to(socket.sessionId).emit('mentor:pushFlowWorkflow', payload);
        console.log(`[Flow Lab] Mentor pushed workflow for level ${levelId} to session ${socket.sessionId}`);
      }
    });

    // Student reports their Flow Lab run status (passed/failed)
    socket.on('student:flowStatus', ({ levelId, status, runOutput }) => {
      if (socket.role === 'student') {
        io.to(socket.sessionId).emit('student:flowStatus', {
          userId: socket.userId,
          name: socket.name,
          levelId,
          status, // 'passed' | 'failed' | 'running'
          runOutput,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      if (socket.sessionId && socket.role === 'student') {
        io.to(socket.sessionId).emit('studentLeft', { userId: socket.userId });
      }
    });
  });
};

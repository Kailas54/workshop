module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a workshop session room
    socket.on('joinSession', ({ sessionId, role, userId, name }) => {
      socket.join(sessionId);
      socket.sessionId = sessionId;
      socket.role = role;
      socket.userId = userId;
      socket.name = name;

      console.log(`[Socket] User ${name} (${role}) joined session ${sessionId}`);
      
      // Notify the mentor/room about the new student
      if (role === 'student') {
        io.to(sessionId).emit('studentJoined', { userId, name, socketId: socket.id });
      }
    });

    // Mentor broadcasting code to students
    socket.on('mentor:broadcast', ({ code }) => {
      if (socket.role === 'mentor') {
        socket.to(socket.sessionId).emit('mentor:broadcast', { code });
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

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      if (socket.sessionId && socket.role === 'student') {
        io.to(socket.sessionId).emit('studentLeft', { userId: socket.userId });
      }
    });
  });
};

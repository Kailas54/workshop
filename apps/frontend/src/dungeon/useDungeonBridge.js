import { useRef } from 'react';

/**
 * useDungeonBridge
 *
 * Returns:
 *  - commandQueue: a shared ref (array) that Phaser reads each frame
 *  - buildInjectGlobals(levelData): builds the injectGlobals object for
 *    usePyodide.runCode(code, injectGlobals)
 */
export function useDungeonBridge() {
  const commandQueue = useRef([]); // Phaser reads from this every frame

  /**
   * Build the Python global injections for the current level.
   * We pass levelData so gate answers etc. can be injected correctly.
   */
  const buildInjectGlobals = (levelData) => {
    const queue = commandQueue.current;

    return {
      // ── Level 1: Sequencing ──────────────────────────────
      move_forward: () => {
        queue.push({ type: 'move', steps: 1 });
      },
      turn_left: () => {
        queue.push({ type: 'turn', dir: 'left' });
      },
      turn_right: () => {
        queue.push({ type: 'turn', dir: 'right' });
      },

      // ── Level 2: Parameters ──────────────────────────────
      move: (steps) => {
        const n = typeof steps === 'number' ? Math.round(steps) : 1;
        queue.push({ type: 'move', steps: n });
      },

      // ── Level 3: Conditionals ────────────────────────────
      get_gate_code: () => {
        return levelData.gateCode || 0;
      },
      open_gate: (answer) => {
        queue.push({ type: 'open_gate', answer });
      },

      // ── Level 5: Capstone ────────────────────────────────
      get_room_info: () => {
        // Returns 'enemy' or 'clear' — for capstone level
        // In a real scenario this would check the next tile dynamically
        return levelData.gateCode ? 'enemy' : 'clear';
      },
      attack: () => {
        queue.push({ type: 'attack' });
      },
    };
  };

  const clearQueue = () => {
    commandQueue.current = [];
  };

  return { commandQueue, buildInjectGlobals, clearQueue };
}

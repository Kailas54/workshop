// ──────────────────────────────────────────────────────
// Code Dungeon — Level Definitions
// Each level is a plain data object. Tile IDs:
//   0 = floor, 1 = wall, 2 = exit door, 3 = enemy, 4 = torch
// ──────────────────────────────────────────────────────

export const TILE = {
  FLOOR: 0,
  WALL: 1,
  EXIT: 2,
  ENEMY: 3,
  TORCH: 4,
};

export const LEVELS = [
  {
    id: 1,
    concept: 'Level 1: Sequencing',
    instruction: `Your hero is trapped!\n\nUse these commands to reach the 🚪 door:\n\n• move_forward() — move one step ahead\n• turn_left()    — rotate 90° left\n• turn_right()   — rotate 90° right\n\nThe hero starts facing DOWN. Plan your steps carefully!`,
    starterCode: `# Guide the hero to the door!
move_forward()
move_forward()
turn_right()
move_forward()
move_forward()
`,
    startPos: { col: 1, row: 1, facing: 'down' },
    exitPos:  { col: 3, row: 3 },
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1],
      [1, 0, 0, 2, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  {
    id: 2,
    concept: 'Level 2: Functions & Parameters',
    instruction: `The corridors are longer now.\n\nNew commands:\n• move(steps) — move forward N steps at once\n• turn_left() / turn_right() — still available\n\nHint: move(3) is much shorter than three move_forward() calls!`,
    starterCode: `# Use move(steps) to travel further
move(3)
turn_right()
move(3)
turn_left()
move(2)
`,
    startPos: { col: 1, row: 1, facing: 'down' },
    exitPos:  { col: 5, row: 6 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: 3,
    concept: 'Level 3: Conditionals',
    instruction: `A Code Gate blocks your path!\n\nThe gate is locked with a secret number. Use this:\n• get_gate_code() — returns a number\n• open_gate(answer) — opens the gate if correct\n\nWrite an if/elif/else:\n• If code > 50: open_gate("big")\n• If code < 50: open_gate("small")\n• Else: open_gate("equal")`,
    starterCode: `# Solve the code gate!
code = get_gate_code()

if code > 50:
    open_gate("big")
elif code < 50:
    open_gate("small")
else:
    open_gate("equal")

move(2)
`,
    startPos: { col: 1, row: 3, facing: 'right' },
    exitPos:  { col: 5, row: 3 },
    gatePos:  { col: 3, row: 3 },
    gateCode: 73,
    gateAnswer: 'big',
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 3, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: 4,
    concept: 'Level 4: Loops',
    instruction: `A long corridor stretches ahead...\n\nYou could type move_forward() twelve times. Or you could use a loop!\n\n• for i in range(n): — repeat n times\n• while condition: — repeat while true\n\nA good programmer never copies the same line twice!`,
    starterCode: `# Don't repeat yourself — use a loop!
for i in range(12):
    move_forward()

turn_right()
for i in range(5):
    move_forward()
`,
    startPos: { col: 1, row: 1, facing: 'down' },
    exitPos:  { col: 5, row: 13 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: 5,
    concept: 'Capstone: The Boss Chamber',
    instruction: `The final challenge!\n\nCombine everything you know:\n• Functions: define reusable actions\n• Loops: navigate the maze efficiently\n• Conditionals: react to what you find\n\nAvailable commands:\n• move_forward(), turn_left(), turn_right(), move(n)\n• get_room_info() → returns 'clear' or 'enemy'\n• attack() → defeats enemy in front of you`,
    starterCode: `# Write your final solution!

def patrol():
    for i in range(4):
        info = get_room_info()
        if info == 'enemy':
            attack()
        else:
            move_forward()

patrol()
turn_right()
move(3)
`,
    startPos: { col: 1, row: 2, facing: 'down' },
    exitPos:  { col: 5, row: 4 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 3, 0, 0, 1],
      [1, 0, 1, 1, 1, 2, 1],
      [1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
  },
];

import React, { useEffect, useRef, useCallback } from 'react';
import { TILE } from './levels.js';

// ── Tilemap config ────────────────────────────────────────────────────────────
// Kenney Tiny Dungeon: 16x16px tiles, 1px gap, 12 cols × 11 rows
const SRC_TILE  = 16;
const SRC_GAP   = 1;
const SRC_COLS  = 12;
const DISPLAY   = 48; // scale up each tile to 48×48px

// ── Tile IDs → position in the tilemap sheet (col, row) ──────────────────────
// Identified by inspecting the tilemap.png preview:
const T = {
  FLOOR_DARK:    [0, 0],   // Dark stone floor
  FLOOR_LIGHT:   [1, 0],   // Lighter floor variant
  FLOOR_CRACKED: [2, 0],   // Cracked floor
  WALL_TOP:      [0, 1],   // Wall top face
  WALL_MID:      [1, 1],   // Wall mid
  WALL_SIDE:     [2, 1],   // Wall side shadow
  WALL_CORNER:   [3, 1],   // Wall corner
  WALL_FRONT:    [0, 2],   // Wall front
  STAIRS:        [6, 0],   // Stairs / exit
  CHEST:         [6, 1],   // Chest
  SKULL:         [7, 1],   // Skull/trap
  DOOR_OPEN:     [4, 2],   // Open door
  DOOR_CLOSED:   [5, 2],   // Closed door (gate)
  TORCH:         [3, 0],   // Torch on wall
  // Characters row 3-4
  HERO:          [0, 4],   // Human hero
  ORC:           [6, 4],   // Orc enemy
  SKELETON:      [7, 4],   // Skeleton enemy
  // Items
  COIN:          [3, 5],   // Gold coin
  KEY:           [4, 5],   // Key
  POTION:        [5, 5],   // Red potion
};

// Tile drawing helper: gets pixel source rect from (col, row) in tilemap
function srcRect(col, row) {
  return {
    sx: col * (SRC_TILE + SRC_GAP),
    sy: row * (SRC_TILE + SRC_GAP),
    sw: SRC_TILE,
    sh: SRC_TILE,
  };
}

// ── Map tile ID → which tile sprite to use ───────────────────────────────────
function getTileSprite(tileType, row, col) {
  switch (tileType) {
    case TILE.FLOOR: {
      const v = (row * 7 + col * 3) % 6;
      if (v === 0) return T.FLOOR_CRACKED;
      if (v === 1) return T.FLOOR_LIGHT;
      return T.FLOOR_DARK;
    }
    case TILE.WALL:    return T.WALL_TOP;
    case TILE.EXIT:    return T.STAIRS;
    case TILE.ENEMY:   return T.FLOOR_DARK; // enemy drawn separately on top
    case TILE.TORCH:   return T.FLOOR_DARK;
    default:           return T.FLOOR_DARK;
  }
}

// ── Canvas 2D Dungeon Renderer ─────────────────────────────────────────────────
export function DungeonCanvas({ levelData, heroState }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const animRef   = useRef(null);
  const tickRef   = useRef(0);

  // Hero smooth position (pixel-lerped)
  const heroPixel = useRef({
    x: heroState.col * DISPLAY,
    y: heroState.row * DISPLAY,
  });

  // Load tilemap image once
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/tiles/tilemap.png';
    img.onload = () => { imgRef.current = img; };
  }, []);

  // Draw a single tile from the tilemap
  const drawTile = useCallback((ctx, [tc, tr], dx, dy, scale = 1) => {
    const img = imgRef.current;
    if (!img) return;
    const { sx, sy, sw, sh } = srcRect(tc, tr);
    const size = DISPLAY * scale;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, size, size);
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { grid, gatePos, exitPos } = levelData;
    const rows = grid.length;
    const cols = grid[0].length;
    canvas.width  = cols * DISPLAY;
    canvas.height = rows * DISPLAY;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !imgRef.current) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      tickRef.current++;
      const tick = tickRef.current;

      // ── Smooth hero position lerp ──────────────────────────────
      const targetX = heroState.col * DISPLAY;
      const targetY = heroState.row * DISPLAY;
      heroPixel.current.x += (targetX - heroPixel.current.x) * 0.18;
      heroPixel.current.y += (targetY - heroPixel.current.y) * 0.18;

      // ── Clear ─────────────────────────────────────────────────
      ctx.fillStyle = '#12121a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Draw floor tiles ──────────────────────────────────────
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = grid[r][c];
          const dx = c * DISPLAY;
          const dy = r * DISPLAY;

          if (tile === TILE.WALL) {
            // Wall: dark background + wall top sprite + side shading
            ctx.fillStyle = '#0a0a14';
            ctx.fillRect(dx, dy, DISPLAY, DISPLAY);
            drawTile(ctx, T.WALL_TOP, dx, dy);
            // Darker overlay for depth
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(dx, dy + DISPLAY * 0.6, DISPLAY, DISPLAY * 0.4);
          } else {
            // Floor variant
            drawTile(ctx, getTileSprite(tile, r, c), dx, dy);

            if (tile === TILE.EXIT) {
              // Exit: stairs + pulsing glow
              const glow = 0.3 + Math.sin(tick * 0.07) * 0.2;
              ctx.fillStyle = `rgba(0,255,200,${glow})`;
              ctx.fillRect(dx, dy, DISPLAY, DISPLAY);
              drawTile(ctx, T.STAIRS, dx, dy);
              // Coin animation
              const coinOffset = Math.sin(tick * 0.1) * 4;
              drawTile(ctx, T.COIN, dx + DISPLAY * 0.1, dy - coinOffset);
              drawTile(ctx, T.COIN, dx + DISPLAY * 0.5, dy - coinOffset * 0.7);
            } else if (tile === TILE.ENEMY) {
              // Enemy: orc with floating bob
              const bob = Math.sin(tick * 0.12) * 3;
              // Red glow behind enemy
              ctx.fillStyle = 'rgba(220,50,70,0.15)';
              ctx.fillRect(dx, dy, DISPLAY, DISPLAY);
              drawTile(ctx, T.ORC, dx, dy + bob);
            } else if (tile === TILE.TORCH) {
              // Torch tile: floor + torch sprite + warm glow
              const torchGlow = 0.15 + Math.sin(tick * 0.15) * 0.08;
              ctx.fillStyle = `rgba(255,160,50,${torchGlow})`;
              ctx.fillRect(dx - DISPLAY * 0.3, dy - DISPLAY * 0.3, DISPLAY * 1.6, DISPLAY * 1.6);
              drawTile(ctx, T.TORCH, dx, dy);
            }

            // Gate overlay
            if (gatePos && c === gatePos.col && r === gatePos.row) {
              ctx.fillStyle = 'rgba(247,127,0,0.2)';
              ctx.fillRect(dx, dy, DISPLAY, DISPLAY);
              drawTile(ctx, T.DOOR_CLOSED, dx, dy);
            }
          }
        }
      }

      // ── Wall top faces (drawn after floor so they overlap correctly) ─
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === TILE.WALL) {
            const dx = c * DISPLAY;
            const dy = r * DISPLAY;
            // Left/right border highlight
            ctx.fillStyle = 'rgba(100,100,160,0.18)';
            ctx.fillRect(dx, dy, 2, DISPLAY);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(dx + DISPLAY - 2, dy, 2, DISPLAY);
          }
        }
      }

      // ── Shadow under hero ──────────────────────────────────────
      const hx = heroPixel.current.x;
      const hy = heroPixel.current.y;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(hx + DISPLAY / 2, hy + DISPLAY - 4, DISPLAY * 0.28, DISPLAY * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Hero sprite ────────────────────────────────────────────
      drawTile(ctx, T.HERO, hx, hy);

      // ── Hero glow ring ─────────────────────────────────────────
      ctx.strokeStyle = 'rgba(76,201,240,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hx + DISPLAY / 2, hy + DISPLAY - 6, DISPLAY * 0.3, DISPLAY * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [levelData, heroState, drawTile]);

  const cols = levelData.grid[0].length;
  const rows = levelData.grid.length;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#12121a',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: 'pixelated',  // crisp pixel art scaling
          maxWidth: '100%',
          maxHeight: '100%',
          border: '2px solid rgba(76,201,240,0.2)',
          borderRadius: '8px',
          boxShadow: '0 0 40px rgba(76,201,240,0.1)',
        }}
        width={cols * DISPLAY}
        height={rows * DISPLAY}
      />
    </div>
  );
}

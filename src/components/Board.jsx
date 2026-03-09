import { useMemo, useState, useEffect } from 'react';
import MahjongTile from './MahjongTile';
import { isFree } from '../game/rules';

const TILE_W = 52;
const TILE_H = 64;
const OFFSET = 7;   // 3D stack offset per layer (px)
const OVERLAP = 0.70; // adjacent tiles overlap by 30% — compact but tiles remain visible
const H_PADDING = 32; // total horizontal padding from .board-scroll (16px × 2)
const V_PADDING = 32; // total vertical padding from .board-scroll (16px × 2)
const UI_HEIGHT = 52; // approx height of the single header bar

export default function Board({ board, onSelect }) {
  const [winSize, setWinSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeTiles = useMemo(
    () => board.filter(t => !t.removed),
    [board]
  );

  // Compute board bounding box accounting for tile overlap
  const maxCol = Math.max(...activeTiles.map(t => t.col), 14);
  const maxRow = Math.max(...activeTiles.map(t => t.row), 22);
  const maxLayer = Math.max(...activeTiles.map(t => t.layer), 3);
  const boardW = (maxCol / 2) * TILE_W * OVERLAP + TILE_W + maxLayer * OFFSET;
  const boardH = (maxRow / 2) * TILE_H * OVERLAP + TILE_H + maxLayer * OFFSET;

  // Scale to fill available space in both axes (up or down as needed)
  const scaleW = (winSize.w - H_PADDING) / boardW;
  const scaleH = (winSize.h - UI_HEIGHT - V_PADDING) / boardH;
  const scale = Math.min(scaleW, scaleH);

  // Sort: lower layers first, then higher so top layers render on top
  const sorted = [...activeTiles].sort((a, b) =>
    a.layer !== b.layer ? a.layer - b.layer : a.row - b.row
  );

  return (
    // Outer wrapper takes the scaled dimensions so layout flows correctly
    <div style={{ width: boardW * scale, height: boardH * scale, margin: '0 auto' }}>
      <div
        className="board-container"
        style={{
          width: boardW,
          height: boardH,
          position: 'relative',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        {sorted.map(tile => {
          const free = isFree(tile, board);
          const left = (tile.col / 2) * TILE_W * OVERLAP + tile.layer * OFFSET;
          const top  = (tile.row / 2) * TILE_H * OVERLAP - tile.layer * OFFSET;

          return (
            <div
              key={tile.uid}
              style={{
                position: 'absolute',
                left,
                top,
                zIndex: tile.layer * 10000 + tile.row * 100 + tile.col,
                width: TILE_W,
                height: TILE_H,
              }}
            >
              <MahjongTile
                tile={tile}
                free={free}
                onClick={() => onSelect(tile.uid)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

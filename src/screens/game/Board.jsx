import { useMemo, useRef } from 'react';
import MahjongTile from './MahjongTile';
import { useElementSize } from '../../hooks/useElementSize';
import { getGraph, freeTiles } from '../../logic/rules';
import './Board.css';

const TILE_W = 52;
const TILE_H = 64;
const OFFSET = 7;     // 3D stack offset per layer (px)
const OVERLAP = 0.70; // adjacent tiles overlap by 30% — compact but tiles remain visible

export default function Board({ positions, faces, removed, selected, hint, dimBlocked, onSelect }) {
  const fitRef = useRef(null);
  const size = useElementSize(fitRef);
  const graph = getGraph(positions);

  // Measured over every position, removed or not, so the board never rescales mid-level
  const bounds = useMemo(() => {
    const maxCol = Math.max(...positions.map(p => p.col));
    const maxRow = Math.max(...positions.map(p => p.row));
    const maxLayer = Math.max(...positions.map(p => p.layer));
    return {
      maxLayer,
      width: (maxCol / 2) * TILE_W * OVERLAP + TILE_W + maxLayer * OFFSET,
      height: (maxRow / 2) * TILE_H * OVERLAP + TILE_H + maxLayer * OFFSET,
    };
  }, [positions]);

  const free = useMemo(() => freeTiles(removed, graph), [removed, graph]);

  const scale = size ? Math.min(size.width / bounds.width, size.height / bounds.height) : 0;

  return (
    <div ref={fitRef} className="board-fit">
      {scale > 0 && (
        // Outer wrapper takes the scaled dimensions so layout flows correctly
        <div style={{ width: bounds.width * scale, height: bounds.height * scale }}>
          <div
            className="board"
            style={{ width: bounds.width, height: bounds.height, transform: `scale(${scale})` }}
          >
            {positions.map((p, i) => removed[i] ? null : (
              <div
                key={i}
                className="tile-slot"
                style={{
                  // Higher layers shift up and right; the top layer sits flush with the top edge
                  left: (p.col / 2) * TILE_W * OVERLAP + p.layer * OFFSET,
                  top: (p.row / 2) * TILE_H * OVERLAP + (bounds.maxLayer - p.layer) * OFFSET,
                  zIndex: p.layer * 10000 + p.row * 100 + p.col,
                  width: TILE_W,
                  height: TILE_H,
                }}
              >
                <MahjongTile
                  index={i}
                  face={faces[i]}
                  free={free.has(i)}
                  selected={selected === i}
                  hinted={hint?.includes(i) ?? false}
                  dimBlocked={dimBlocked}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

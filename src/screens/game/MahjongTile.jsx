import { memo, useState } from 'react';
import { SUITS } from '../../logic/tiles';
import './MahjongTile.css';

// Emoji/symbol map for each tile type
const SYMBOLS = {
  [SUITS.CHARACTERS]: { 1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九' },
  [SUITS.BAMBOO]:     { 1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9' },
  [SUITS.CIRCLES]:    { 1:'①',2:'②',3:'③',4:'④',5:'⑤',6:'⑥',7:'⑦',8:'⑧',9:'⑨' },
  [SUITS.WINDS]:      { east:'東',south:'南',west:'西',north:'北' },
  [SUITS.DRAGONS]:    { red:'中',green:'發',white:'白' },
  [SUITS.FLOWERS]:    { plum:'梅',orchid:'蘭',chrysanthemum:'菊',bamboo:'竹' },
  [SUITS.SEASONS]:    { spring:'春',summer:'夏',autumn:'秋',winter:'冬' },
};

const SUIT_COLORS = {
  [SUITS.CHARACTERS]: '#c0392b',
  [SUITS.BAMBOO]:     '#27ae60',
  [SUITS.CIRCLES]:    '#2980b9',
  [SUITS.WINDS]:      '#2c3e50',
  [SUITS.DRAGONS]:    '#8e44ad',
  [SUITS.FLOWERS]:    '#e67e22',
  [SUITS.SEASONS]:    '#16a085',
};

// Spanish names for screen readers
const NAMES = {
  [SUITS.CHARACTERS]: v => `Carácter ${v}`,
  [SUITS.BAMBOO]:     v => `Bambú ${v}`,
  [SUITS.CIRCLES]:    v => `Círculo ${v}`,
  [SUITS.WINDS]:      v => `Viento ${{ east: 'este', south: 'sur', west: 'oeste', north: 'norte' }[v]}`,
  [SUITS.DRAGONS]:    v => `Dragón ${{ red: 'rojo', green: 'verde', white: 'blanco' }[v]}`,
  [SUITS.FLOWERS]:    v => `Flor, ${{ plum: 'ciruelo', orchid: 'orquídea', chrysanthemum: 'crisantemo', bamboo: 'bambú' }[v]}`,
  [SUITS.SEASONS]:    v => `Estación, ${{ spring: 'primavera', summer: 'verano', autumn: 'otoño', winter: 'invierno' }[v]}`,
};

function MahjongTile({ index, face, free, selected, hinted, dimBlocked, onSelect }) {
  const [shaking, setShaking] = useState(false);
  const { suit, value } = face;

  const symbol = SYMBOLS[suit]?.[value] ?? '?';
  const color = SUIT_COLORS[suit] ?? '#333';
  const name = NAMES[suit]?.(value) ?? `${suit} ${value}`;

  // Tapping a blocked tile shakes it instead of failing silently
  const handleClick = () => (free ? onSelect(index) : setShaking(true));

  return (
    <button
      type="button"
      className={[
        'mahjong-tile',
        free && 'free',
        dimBlocked && !free && 'dim',
        selected && 'selected',
        hinted && 'hinted',
        shaking && 'shake',
      ].filter(Boolean).join(' ')}
      onClick={handleClick}
      onAnimationEnd={e => e.animationName === 'tile-shake' && setShaking(false)}
      aria-label={free ? name : `${name}, bloqueada`}
      aria-pressed={selected}
      style={{ '--tile-color': color }}
    >
      <span className="tile-symbol" aria-hidden="true">{symbol}</span>
    </button>
  );
}

export default memo(MahjongTile);

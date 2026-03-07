import { SUITS } from '../game/tiles';

// Emoji/symbol map for each tile type
const SYMBOLS = {
  [SUITS.CHARACTERS]: { 1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'七',8:'八',9:'九' },
  [SUITS.BAMBOO]:     { 1:'🎋',2:'🎋',3:'🎋',4:'🎋',5:'🎋',6:'🎋',7:'🎋',8:'🎋',9:'🎋' },
  [SUITS.CIRCLES]:    { 1:'🔵',2:'🔵',3:'🔵',4:'🔵',5:'🔵',6:'🔵',7:'🔵',8:'🔵',9:'🔵' },
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

const NUMBER_LABELS = {
  [SUITS.BAMBOO]:  (v) => v,
  [SUITS.CIRCLES]: (v) => v,
};

export default function MahjongTile({ tile, free, onClick }) {
  const { suit, value, removed, selected } = tile;
  if (removed) return null;

  const symbol = SYMBOLS[suit]?.[value] ?? '?';
  const color = SUIT_COLORS[suit] ?? '#333';
  const isNumbered = suit === SUITS.BAMBOO || suit === SUITS.CIRCLES;

  return (
    <button
      className={[
        'mahjong-tile',
        free ? 'free' : 'blocked',
        selected ? 'selected' : '',
      ].join(' ')}
      onClick={free ? onClick : undefined}
      aria-label={`${suit} ${value}`}
      style={{ '--tile-color': color }}
    >
      <span className="tile-symbol">{symbol}</span>
      {isNumbered && <span className="tile-number">{value}</span>}
    </button>
  );
}

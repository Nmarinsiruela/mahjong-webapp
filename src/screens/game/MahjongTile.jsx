import { memo, useState } from 'react';
import { useI18n } from '../../i18n';
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

// Name for screen readers: numbered suits are functions of the value
function tileName(names, { suit, value }) {
  const entry = names[suit];
  return (typeof entry === 'function' ? entry(value) : entry?.[value]) ?? `${suit} ${value}`;
}

function MahjongTile({ index, face, free, selected, hinted, dimBlocked, onSelect }) {
  const { t } = useI18n();
  const [shaking, setShaking] = useState(false);
  const { suit, value } = face;

  const symbol = SYMBOLS[suit]?.[value] ?? '?';
  const color = SUIT_COLORS[suit] ?? '#333';
  const name = tileName(t.tiles, face);

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
      aria-label={free ? name : t.game.blocked(name)}
      aria-pressed={selected}
      style={{ '--tile-color': color }}
    >
      <span className="tile-symbol" aria-hidden="true">{symbol}</span>
    </button>
  );
}

export default memo(MahjongTile);

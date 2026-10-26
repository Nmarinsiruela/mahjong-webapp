// Stroke icons drawn on a 24px grid; they inherit the text colour.
function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const BackIcon = () => (
  <Icon><path d="M15 5l-7 7 7 7" /></Icon>
);

export const UndoIcon = () => (
  <Icon><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></Icon>
);

export const HintIcon = () => (
  <Icon><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" /></Icon>
);

export const ShuffleIcon = () => (
  <Icon><path d="M16 4h4v4M4 20L20 4M20 16v4h-4M15 15l5 5M4 4l5 5" /></Icon>
);

export const RestartIcon = () => (
  <Icon><path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4.5h4.5" /></Icon>
);

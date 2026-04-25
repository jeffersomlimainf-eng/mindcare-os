// Thin line icons — stroke 1.4, clean and quiet.
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
       style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

const IconCalendar = (p) => <Icon {...p}>
  <rect x="3" y="5" width="18" height="16" rx="2"/>
  <path d="M3 10h18M8 3v4M16 3v4"/>
</Icon>;

const IconChart = (p) => <Icon {...p}>
  <path d="M4 4v16h16"/>
  <path d="M8 14l3-3 3 3 4-5"/>
</Icon>;

const IconNote = (p) => <Icon {...p}>
  <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
  <path d="M15 3v5h5M9 13h7M9 17h5"/>
</Icon>;

const IconCoin = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="8"/>
  <path d="M14 9.5a2.5 2.5 0 0 0-5 0c0 1.4 1.1 2 2.5 2.5s2.5 1.1 2.5 2.5a2.5 2.5 0 0 1-5 0M12 6v2M12 16v2"/>
</Icon>;

const IconVideo = (p) => <Icon {...p}>
  <rect x="3" y="6" width="13" height="12" rx="2"/>
  <path d="M16 10l5-3v10l-5-3z"/>
</Icon>;

const IconShield = (p) => <Icon {...p}>
  <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/>
  <path d="M9 12l2 2 4-4"/>
</Icon>;

const IconDoc = (p) => <Icon {...p}>
  <path d="M7 3h8l5 5v13H7z"/>
  <path d="M15 3v5h5"/>
</Icon>;

const IconUsers = (p) => <Icon {...p}>
  <circle cx="9" cy="8" r="3.5"/>
  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
  <circle cx="17" cy="9" r="2.5"/>
  <path d="M15 14c3 0 6 2 6 5"/>
</Icon>;

const IconArrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const IconLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* A quiet "ψ"-inspired monogram — two verticals + a curve, not the real glyph */}
    <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M11 10v7a5 5 0 0 0 10 0v-7M16 17v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
  </svg>
);

const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8.5l3 3 7-7"/>
  </svg>
);

const IconQuote = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
    <path d="M10 8c-4 0-7 3-7 7v9h9v-9H6c0-3 2-5 4-5zM23 8c-4 0-7 3-7 7v9h9v-9h-6c0-3 2-5 4-5z"/>
  </svg>
);

const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10"/>
  </svg>
);

Object.assign(window, {
  Icon, IconCalendar, IconChart, IconNote, IconCoin, IconVideo, IconShield,
  IconDoc, IconUsers, IconArrow, IconLogo, IconCheck, IconQuote, IconPlus
});

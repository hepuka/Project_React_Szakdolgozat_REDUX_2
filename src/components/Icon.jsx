/* =========================================================
   IKONKÉSZLET
   =========================================================

   Egységes, vonalas ikonok az emojik helyett. Minden ikon
   ugyanabban a 24x24-es rácsban, azonos vonalvastagsággal
   készült, és a szövegszínt veszi fel (currentColor), ezért
   bárhol használható, ahol színt állítunk.

   Használat:  <Icon name="home" />
               <Icon name="trash" size={16} />
   ========================================================= */

const ICONS = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),

  users: (
    <>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.8" />
      <path d="M16 4.2a4 4 0 0 1 0 5.6" />
    </>
  ),

  userPlus: (
    <>
      <path d="M14 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="8" cy="7" r="3" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </>
  ),

  coffee: (
    <>
      <path d="M17 9h1a3 3 0 1 1 0 6h-1" />
      <path d="M4 9h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
      <line x1="8" y1="3" x2="8" y2="5" />
      <line x1="13" y1="3" x2="13" y2="5" />
    </>
  ),

  receipt: (
    <>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2Z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </>
  ),

  wallet: (
    <>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
      <line x1="6" y1="12.5" x2="6" y2="12.5" />
    </>
  ),

  chart: (
    <>
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="6" y="11" width="3" height="6" />
      <rect x="11" y="7" width="3" height="10" />
      <rect x="16" y="13" width="3" height="4" />
    </>
  ),

  chat: <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12Z" />,

  bell: (
    <>
      <path d="M4 19h16" />
      <path d="M5 19a7 7 0 0 1 14 0" />
      <path d="M12 8V5" />
      <circle cx="12" cy="4" r="1" />
    </>
  ),

  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),

  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </>
  ),

  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),

  edit: <path d="M4 20h4l10-10-4-4L4 16Z" />,

  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
    </>
  ),

  check: <path d="m5 13 4 4L19 7" />,

  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),

  chevronLeft: <path d="m14 6-6 6 6 6" />,

  chevronRight: <path d="m10 6 6 6-6 6" />,

  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,

  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),

  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),

  alert: (
    <>
      <path d="M12 4 2 20h20Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </>
  ),

  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </>
  ),

  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),

  phone: (
    <path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.5A2 2 0 0 1 3.4 2H6a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  ),

  mail: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="m2.5 6.5 9.5 7 9.5-7" />
    </>
  ),

  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),

  link: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),

  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </>
  ),

  message: (
    <>
      <path d="M21 12a8 8 0 0 1-8 8H8l-5 2 1.6-4.4A8 8 0 0 1 13 4a8 8 0 0 1 8 8Z" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </>
  ),

  user: (
    <>
      <path d="M19 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 18.5V20" />
      <circle cx="12" cy="7.5" r="3.5" />
    </>
  ),

  shield: (
    <>
      <path d="M12 2.5 20 5v6c0 5-3.4 9.1-8 10.5C7.4 20.1 4 16 4 11V5Z" />
      <path d="m9 11.8 2.2 2.2L15.5 9.7" />
    </>
  ),

  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 4.5-4.5 3 3L15 12l5 5" />
    </>
  ),

  fileText: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </>
  ),

  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m8 8 4-4 4 4" />
      <line x1="12" y1="4" x2="12" y2="15" />
    </>
  ),

  eye: (
    <>
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),

  eyeOff: (
    <>
      <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6.2 0 10 6 10 6a17.6 17.6 0 0 1-3.2 3.8" />
      <path d="M6.4 7.9A17.4 17.4 0 0 0 2 12s3.8 6 10 6a9.9 9.9 0 0 0 4-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),

  arrowLeft: (
    <>
      <line x1="20" y1="12" x2="4" y2="12" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
};

const Icon = ({ name, size = 20, strokeWidth = 1.8, className }) => {
  const paths = ICONS[name];

  if (!paths) {
    return null;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
};

export default Icon;

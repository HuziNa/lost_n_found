import React from "react";

const ICONS = {
  chart: (
    <>
      <rect x="4" y="11" width="3" height="7" rx="1" />
      <rect x="10.5" y="6" width="3" height="12" rx="1" />
      <rect x="17" y="9" width="3" height="9" rx="1" />
      <path d="M3 20h18" />
    </>
  ),
  inventory: (
    <>
      <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
      <path d="M4 7l4-4h8l4 4" />
      <path d="M9 12h6" />
    </>
  ),
  orders: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
    </>
  ),
  reviews: (
    <>
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  logout: (
    <>
      <path d="M4 4h7v16H4z" />
      <path d="M10 12h10" />
      <path d="M16 8l4 4-4 4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h2M8 12h2M12 8h2M12 12h2M16 8h2M16 12h2" />
    </>
  ),
  star: (
    <>
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5z" />
    </>
  ),
  store: (
    <>
      <path d="M4 8h16l-1.5-4h-13z" />
      <path d="M4 8v10h16V8" />
      <path d="M9 18v-6h6v6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 5h2l2.2 9h10.3l2.5-6H7.2" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  cake: (
    <>
      <path d="M4 18h16" />
      <path d="M7 18l2.5-9h5L17 18" />
      <path d="M9 9h6" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6l-12 12" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: (
    <>
      <path d="M5 12l4 4L19 7" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </>
  ),
  box: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16" />
      <path d="M10 6v4M14 6v4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-6-3.6-8-7.6C2.6 9.2 4.2 6 7.3 6c2 0 3.3 1.2 4.7 2.9C13.4 7.2 14.7 6 16.7 6c3.1 0 4.7 3.2 3.3 6.4-2 4-8 7.6-8 7.6z" />
    </>
  ),
  thumbUp: (
    <>
      <path d="M7 11v9" />
      <path d="M7 11h5l2.5-6 4.5 2-2 9H7" />
    </>
  ),
  thumbDown: (
    <>
      <path d="M17 13V4" />
      <path d="M17 13h-5l-2.5 6-4.5-2 2-9h10" />
    </>
  ),
  sprinkles: (
    <>
      <path d="M6 8l2 2M10 6l2 2M14 8l2 2M8 14l2 2M12 12l2 2" />
    </>
  ),
  fruit: (
    <>
      <circle cx="8" cy="12" r="3" />
      <circle cx="14" cy="9" r="2.5" />
      <circle cx="16" cy="15" r="3" />
    </>
  ),
  chocolate: (
    <>
      <rect x="6" y="7" width="12" height="10" rx="2" />
      <path d="M10 7v10M14 7v10M6 11h12" />
    </>
  ),
  glitter: (
    <>
      <path d="M12 4l1.5 3 3 .4-2.2 2.1.6 3.1L12 11l-2.9 1.6.6-3.1L7.5 7.4l3-.4z" />
      <path d="M5 18l1 .2.2 1 .2-1 1-.2-1-.2-.2-1-.2 1z" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="6.5" r="2" />
      <circle cx="12" cy="17.5" r="2" />
      <circle cx="6.5" cy="12" r="2" />
      <circle cx="17.5" cy="12" r="2" />
    </>
  ),
  pearl: (
    <>
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  candle: (
    <>
      <path d="M12 4c1.5 1.8 1.5 3.4 0 5-1.5-1.6-1.5-3.2 0-5z" />
      <rect x="9" y="9" width="6" height="10" rx="1" />
      <path d="M9 13h6" />
    </>
  ),
  sparkler: (
    <>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l3 3M14 14l3 3M17 7l-3 3M7 17l3-3" />
    </>
  ),
  ribbon: (
    <>
      <path d="M12 11c2-2 5-2 6.5 0-1.5 2-4.5 2-6.5 0z" />
      <path d="M12 11c-2-2-5-2-6.5 0 1.5 2 4.5 2 6.5 0z" />
      <path d="M11.2 12.5l-2.2 5M12.8 12.5l2.2 5" />
    </>
  ),
  number: (
    <>
      <path d="M8 7v10M16 7v10M6 10h12M6 14h12" />
    </>
  ),
  chevronLeft: (
    <>
      <path d="M15 6l-6 6 6 6" />
    </>
  ),
  chevronRight: (
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  cash: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 10h12M6 14h12" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="16" cy="12" r="1" />
    </>
  ),
  bank: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16M8 14h2M12 14h2" />
      <path d="M6 6l6-4 6 4" />
    </>
  ),
  spinner: (
    <>
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </>
  ),
};

export function Icon({ name, size = 18, className = "", title }) {
  const icon = ICONS[name];
  if (!icon) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {icon}
    </svg>
  );
}

import React from 'react';

interface AucaLogoProps {
  className?: string;
  size?: number;
}

/**
 * Adventist University of Central Africa (AUCA) Emblem SVG
 * Features the classic university shield, open book of knowledge,
 * Adventist flame & cross motif, and gold laurel ring.
 */
export const AucaLogo: React.FC<AucaLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="AUCA University Logo"
    >
      {/* Outer Gold & Navy Seal Ring */}
      <circle cx="60" cy="60" r="58" fill="#0B2545" stroke="#D97706" strokeWidth="4" />
      <circle cx="60" cy="60" r="50" fill="#134074" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Inner Shield */}
      <path
        d="M32 30H88V62C88 81 75 94 60 100C45 94 32 81 32 62V30Z"
        fill="#FFFFFF"
        stroke="#D97706"
        strokeWidth="2.5"
      />

      {/* Top Blue Header of Shield */}
      <path
        d="M33.5 31.5H86.5V46H33.5V31.5Z"
        fill="#0B2545"
      />

      {/* AUCA Text inside Shield Header */}
      <text
        x="60"
        y="42"
        textAnchor="middle"
        fill="#FBBF24"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight="800"
        fontSize="11"
        letterSpacing="1.5"
      >
        AUCA
      </text>

      {/* Adventist Flame & Cross Motif in Center */}
      <path
        d="M60 49C55 55 52 59 55 66C52 62 57 57 60 53C63 57 68 62 65 66C68 59 65 55 60 49Z"
        fill="#D97706"
      />
      <path
        d="M60 54V72M54 61H66"
        stroke="#0B2545"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Open Book / Bible at Base of Shield */}
      <path
        d="M43 73C48 71 55 72 60 75C65 72 72 71 77 73V85C72 83 65 84 60 87C55 84 48 83 43 85V73Z"
        fill="#FEF3C7"
        stroke="#0B2545"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M60 75V87" stroke="#0B2545" strokeWidth="1.8" />

      {/* Three Stars at Bottom */}
      <circle cx="50" cy="21" r="2" fill="#FBBF24" />
      <circle cx="60" cy="18" r="2.5" fill="#FBBF24" />
      <circle cx="70" cy="21" r="2" fill="#FBBF24" />
    </svg>
  );
};

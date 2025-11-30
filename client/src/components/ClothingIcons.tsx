interface IconProps {
  className?: string;
}

export function BlazerIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Blazer/Jacket */}
      <path d="M16 20 L24 16 L32 14 L40 16 L48 20 L52 56 L40 56 L38 40 L32 44 L26 40 L24 56 L12 56 Z" />
      {/* Lapels */}
      <path d="M24 16 L28 28 L32 32 L36 28 L40 16" />
      {/* Center line */}
      <path d="M32 32 L32 56" />
      {/* Buttons */}
      <circle cx="32" cy="38" r="1.5" fill="currentColor" />
      <circle cx="32" cy="46" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SuitIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Suit jacket */}
      <path d="M14 18 L24 14 L32 12 L40 14 L50 18 L54 58 L40 58 L38 42 L32 46 L26 42 L24 58 L10 58 Z" />
      {/* Lapels */}
      <path d="M24 14 L28 26 L32 30 L36 26 L40 14" />
      {/* Tie */}
      <path d="M32 30 L29 36 L32 58" />
      <path d="M32 30 L35 36 L32 58" />
      {/* Tie knot */}
      <path d="M29 30 L32 34 L35 30" />
      {/* Button */}
      <circle cx="26" cy="44" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function DressShirtIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Shirt body */}
      <path d="M18 20 L24 16 L28 14 L32 12 L36 14 L40 16 L46 20 L48 56 L16 56 Z" />
      {/* Collar */}
      <path d="M24 16 L28 22 L32 18 L36 22 L40 16" />
      {/* Placket */}
      <path d="M32 18 L32 56" />
      {/* Buttons */}
      <circle cx="32" cy="28" r="1.5" fill="currentColor" />
      <circle cx="32" cy="36" r="1.5" fill="currentColor" />
      <circle cx="32" cy="44" r="1.5" fill="currentColor" />
      <circle cx="32" cy="52" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function KnitIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Sweater body */}
      <path d="M16 24 L20 20 L32 16 L44 20 L48 24 L50 56 L14 56 Z" />
      {/* Crew neck */}
      <path d="M26 16 C26 20, 32 22, 32 22 C32 22, 38 20, 38 16" />
      {/* Ribbing lines at bottom */}
      <path d="M14 52 L50 52" />
      <path d="M14 54 L50 54" />
      {/* Texture lines */}
      <path d="M20 28 L44 28" strokeDasharray="2 2" />
      <path d="M18 36 L46 36" strokeDasharray="2 2" />
      <path d="M16 44 L48 44" strokeDasharray="2 2" />
    </svg>
  );
}

export function BlouseIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Blouse body - slightly fitted */}
      <path d="M18 22 L24 18 L32 14 L40 18 L46 22 L48 40 L46 56 L18 56 L16 40 Z" />
      {/* V-neck or rounded neck */}
      <path d="M24 18 C28 24, 32 26, 32 26 C32 26, 36 24, 40 18" />
      {/* Subtle drape lines */}
      <path d="M26 30 L28 50" opacity="0.5" />
      <path d="M38 30 L36 50" opacity="0.5" />
    </svg>
  );
}

export function JewelBlouseIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Elegant blouse body */}
      <path d="M18 22 L24 18 L32 14 L40 18 L46 22 L48 40 L46 56 L18 56 L16 40 Z" />
      {/* Jewel neckline */}
      <path d="M26 14 C26 18, 32 20, 32 20 C32 20, 38 18, 38 14" />
      {/* Decorative detail at neckline */}
      <circle cx="32" cy="20" r="2" />
      {/* Subtle fabric flow */}
      <path d="M24 28 C28 32, 32 30, 32 30" opacity="0.5" />
      <path d="M40 28 C36 32, 32 30, 32 30" opacity="0.5" />
    </svg>
  );
}

export function SheathDressIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fitted sheath dress */}
      <path d="M22 18 L26 14 L32 12 L38 14 L42 18 L44 36 L46 58 L18 58 L20 36 Z" />
      {/* Neckline */}
      <path d="M26 14 C28 18, 32 20, 32 20 C32 20, 36 18, 38 14" />
      {/* Waist definition */}
      <path d="M22 36 L42 36" opacity="0.5" />
      {/* Center seam */}
      <path d="M32 36 L32 58" opacity="0.3" />
    </svg>
  );
}

// Map clothing IDs to icons
export const ClothingIconMap: Record<string, React.FC<IconProps>> = {
  blazer: BlazerIcon,
  suit: SuitIcon,
  dress_shirt: DressShirtIcon,
  knit: KnitIcon,
  blouse: BlouseIcon,
  jewel_blouse: JewelBlouseIcon,
  sheath_dress: SheathDressIcon,
};

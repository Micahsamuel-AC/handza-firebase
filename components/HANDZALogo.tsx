import React from "react";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "wordmark";
  theme?: "light" | "dark";
  className?: string;
}

export default function HANDZALogo({ size = 40, variant = "full", theme = "light", className = "" }: LogoProps) {
  const navy  = theme === "dark" ? "#B5D4F4" : "#1B3A6B";
  const orange = theme === "dark" ? "#FF7A47" : "#E8541A";
  const textColor = theme === "dark" ? "#FFFFFF" : "#1B3A6B";

  const Icon = () => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="80" height="80" rx="18" fill={navy}/>
      {/* Left arm — employer navy */}
      <path d="M12 37C12 37 12 30 19 27C22 25 26 26 29 28L38 33C40 35 40 38 38 40L33 42" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M33 42L39 46C42 48 41 51 39 52L34 54" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M34 54L38 58C40 61 38 64 35 64L28 64" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Right arm — worker orange */}
      <path d="M68 37C68 37 68 30 61 27C58 25 54 26 51 28L42 33C40 35 40 38 42 40L47 42" stroke={orange} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M47 42L41 46C38 48 39 51 41 52L46 54" stroke={orange} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M46 54L42 58C40 61 42 64 45 64L52 64" stroke={orange} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Clasp — meeting point */}
      <ellipse cx="36" cy="45" rx="8" ry="9" fill="white" opacity="0.92"/>
      <ellipse cx="44" cy="45" rx="8" ry="9" fill={orange} opacity="0.88"/>
      <circle cx="40" cy="45" r="3.5" fill={navy}/>
      {/* Person dots */}
      <circle cx="20" cy="16" r="5" fill="white"/>
      <circle cx="60" cy="16" r="5" fill={orange}/>
    </svg>
  );

  if (variant === "icon") return <Icon />;

  if (variant === "wordmark") {
    return (
      <span className={`font-heading font-bold ${className}`} style={{ color: textColor, fontSize: size * 0.5 }}>
        HANDZA
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon />
      <div className="flex flex-col">
        <span className="font-heading font-bold leading-none" style={{ color: textColor, fontSize: size * 0.45 }}>
          HANDZA
        </span>
        {size >= 40 && (
          <span className="font-body leading-none mt-0.5" style={{ color: theme === "dark" ? "rgba(255,255,255,0.5)" : "#888780", fontSize: size * 0.18 }}>
            Connecting the right hands
          </span>
        )}
      </div>
    </div>
  );
}

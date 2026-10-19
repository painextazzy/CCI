"use client";

import { useEffect, useState } from "react";

export default function CompanyAvatar({
  src,
  name,
  className,
  initialsClassName,
}: {
  src?: string | null;
  name: string;
  className: string;
  initialsClassName: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className={`${className} overflow-hidden`}>
      {src && !hasImageError ? (
        <img
          src={src}
          alt={`Logo de ${name}`}
          className="h-full w-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span className={initialsClassName}>{initials}</span>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface VehicleImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export const VehicleImage: React.FC<VehicleImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClass = '',
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#14181F] text-slate-300 p-6 select-none ${aspectClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <Car className="w-10 h-10 text-[#C89D54] mb-2 opacity-80" />
        <span className="text-xs font-medium text-slate-400 text-center line-clamp-2 max-w-[220px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${aspectClass} ${className}`}
    />
  );
};

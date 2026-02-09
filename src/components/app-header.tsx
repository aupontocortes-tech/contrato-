"use client";

import Image from "next/image";

export function AppHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-200 relative shadow-sm">
      {/* Container compacto com logo menor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-3 md:py-4">
          {/* Logo menor e mais compacto */}
          <div className="relative w-full max-w-[280px] md:max-w-[320px]">
            <Image
              src="/natalia-logo-header.png"
              alt="NATÁLIA PERSONAL"
              width={400}
              height={120}
              className="w-full h-auto object-contain"
              priority
              unoptimized
              style={{ 
                maxHeight: "80px",
                objectFit: "contain"
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

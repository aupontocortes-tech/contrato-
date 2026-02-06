"use client";

import { ReactNode } from "react";

/** Logo no topo — integrada à folha, bordas suaves (sem quadrado em volta) */
function LogoNoTopo({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex justify-center pt-8 pb-6 ${compact ? "pb-4" : "pb-6"}`}
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <img
        src="/logo.png?v=9"
        alt="Natália Personal"
        className="w-full max-w-[240px] h-auto object-contain object-center"
      />
    </div>
  );
}

type DocumentoContratoProps = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

/**
 * Layout: logo em cima; contrato (título e corpo) embaixo. Sem detalhes nas bordas.
 */
export function DocumentoContrato({ children, className = "", compact }: DocumentoContratoProps) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-lg bg-white print:shadow-none " + className
      }
    >
      <div className={`relative font-serif text-black print:shadow-none ${compact ? "px-6 pb-8 md:px-10 md:pb-10" : "px-10 pb-12 md:px-16 md:pb-16"}`}>
        <LogoNoTopo compact={compact} />
        <div className="pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}

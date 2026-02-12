"use client";

import Image from "next/image";

export default function DashboardPage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "24px",
      minHeight: "60vh"
    }}>
      {/* Desenho/Logo no topo */}
      <div style={{ 
        marginBottom: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Image
          src="/logo.png"
          alt="Natália Personal"
          width={300}
          height={300}
          style={{
            width: "100%",
            maxWidth: "280px",
            height: "auto",
            objectFit: "contain"
          }}
          priority
          unoptimized
        />
      </div>

      {/* Frase Bem-vindo */}
      <h1 style={{ 
        fontSize: "28px", 
        fontWeight: 700, 
        color: "#111827",
        textAlign: "center",
        margin: 0
      }}>
        Bem-vindo!
      </h1>
    </div>
  );
}

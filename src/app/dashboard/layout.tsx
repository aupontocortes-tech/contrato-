"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { InstallPrompt } from "@/components/install-prompt";

const linkStyle = (active: boolean) => ({
  display: "block",
  width: "100%",
  padding: "8px 12px",
  textAlign: "left" as const,
  fontSize: "14px",
  fontWeight: 500,
  color: active ? "#1d4ed8" : "#374151",
  backgroundColor: active ? "#eff6ff" : "transparent",
  border: "none",
  borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  borderRadius: "4px",
});

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .dash-mobile { display: none !important; }
          .dash-desktop { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .dash-desktop { display: none !important; }
        }
      ` }} />
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        {/* Mobile Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
          className="dash-mobile"
        >
          <span style={{ fontWeight: 600, fontSize: "16px", color: "#1f2937" }}>Menu</span>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
            }}
            aria-label="Abrir menu"
          >
            <span style={{ fontSize: "18px" }}>☰</span>
          </button>
        </header>

        {menuOpen && (
          <div
            className="dash-mobile"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside
          className="dash-mobile"
          style={{
            display: menuOpen ? "block" : "none",
            position: "fixed",
            top: 0,
            left: 0,
            width: "260px",
            height: "100%",
            backgroundColor: "#fff",
            borderRight: "1px solid #e5e7eb",
            zIndex: 50,
            padding: "16px",
            boxShadow: "4px 0 12px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <strong style={{ fontSize: "12px", color: "#374151", textTransform: "uppercase" }}>Menu</strong>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              style={{ padding: "4px", border: "none", background: "none", cursor: "pointer", fontSize: "18px" }}
            >
              ✕
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard")}>
              Dashboard
            </Link>
            <Link href="/dashboard/alunos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/alunos")}>
              Alunos
            </Link>
            <Link href="/dashboard/planos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/planos")}>
              Planos
            </Link>
            <Link href="/dashboard/contratos" onClick={() => setMenuOpen(false)} style={linkStyle(pathname === "/dashboard/contratos")}>
              Contratos
            </Link>
          </nav>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className="dash-desktop"
          style={{
            display: "none",
            width: "224px",
            borderRight: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            flexDirection: "column",
            padding: "16px",
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Menu
            </h2>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            <Link href="/dashboard" style={linkStyle(pathname === "/dashboard")}>
              Dashboard
            </Link>
            <Link href="/dashboard/alunos" style={linkStyle(pathname === "/dashboard/alunos")}>
              Alunos
            </Link>
            <Link href="/dashboard/planos" style={linkStyle(pathname === "/dashboard/planos")}>
              Planos
            </Link>
            <Link href="/dashboard/contratos" style={linkStyle(pathname === "/dashboard/contratos")}>
              Contratos
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: "24px",
            overflow: "auto",
            backgroundColor: "#fff",
            minHeight: "100vh",
          }}
        >
          <div style={{ maxWidth: "1152px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
      <InstallPrompt />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/mobile-menu";
import { InstallPrompt } from "@/components/install-prompt";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Mobile Header com Menu */}
        <header className="lg:hidden flex items-center justify-between p-3 border-b bg-white sticky top-0 z-30 shadow-sm">
          <span className="font-semibold text-base text-gray-800">Menu</span>
          <MobileMenu />
        </header>

        {/* Desktop Sidebar - Menu lateral fixo */}
        <aside className="hidden lg:flex w-56 border-r bg-white flex-col shadow-sm">
          {/* Título Menu */}
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Menu</h2>
          </div>
          
          {/* Navegação */}
          <nav className="flex flex-col gap-0.5 p-2 flex-1">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                  isActive("/dashboard") && pathname === "/dashboard"
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/alunos">
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                  isActive("/dashboard/alunos")
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                Alunos
              </Button>
            </Link>
            <Link href="/dashboard/planos">
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                  isActive("/dashboard/planos")
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                Planos
              </Button>
            </Link>
            <Link href="/dashboard/contratos">
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                  isActive("/dashboard/contratos")
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                Contratos
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-white min-h-screen">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

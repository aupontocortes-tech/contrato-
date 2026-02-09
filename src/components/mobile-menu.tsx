"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden relative z-50"
        onClick={handleToggle}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleClose}
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r z-50 lg:hidden shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex flex-col gap-0.5 p-2 flex-1">
              <Link href="/dashboard" onClick={handleClose}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                    isActive("/dashboard") && pathname === "/dashboard"
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/alunos" onClick={handleClose}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                    isActive("/dashboard/alunos")
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Alunos
                </Button>
              </Link>
              <Link href="/dashboard/planos" onClick={handleClose}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                    isActive("/dashboard/planos")
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Planos
                </Button>
              </Link>
              <Link href="/dashboard/contratos" onClick={handleClose}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-medium text-sm h-9 px-3 ${
                    isActive("/dashboard/contratos")
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Contratos
                </Button>
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

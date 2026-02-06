import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col">
        <Link href="/dashboard" className="font-semibold text-lg mb-6">
          Contraton
        </Link>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard/alunos">
            <Button variant="ghost" className="w-full justify-start">Alunos</Button>
          </Link>
          <Link href="/dashboard/planos">
            <Button variant="ghost" className="w-full justify-start">Planos</Button>
          </Link>
          <Link href="/dashboard/contratos">
            <Button variant="ghost" className="w-full justify-start">Contratos</Button>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

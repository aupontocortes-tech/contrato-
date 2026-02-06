import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Gerencie alunos, planos e contratos. Use o menu ao lado para navegar.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard/alunos">
          <Button>Cadastrar aluno</Button>
        </Link>
        <Link href="/dashboard/contratos">
          <Button variant="outline">Novo contrato</Button>
        </Link>
      </div>
    </div>
  );
}

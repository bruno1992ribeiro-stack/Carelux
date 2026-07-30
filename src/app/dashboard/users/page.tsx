export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilizadores / Clientes</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Gestão de clientes e utilizadores da plataforma CareLux.
        </p>
      </div>

      {/* Exemplo de tabela simples */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-4">
          <p className="text-sm text-gray-500">Lista de utilizadores será exibida aqui.</p>
        </div>
      </div>
    </div>
  );
}
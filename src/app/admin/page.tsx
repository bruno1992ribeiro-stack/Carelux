import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      facilities: true,
      users: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Clientes CareLux
        </h1>

        <p className="text-gray-500">
          Empresas que utilizam a plataforma.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow">

        <table className="w-full">

          <thead className="border-b bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Cliente
              </th>

              <th className="p-4 text-left">
                Plano
              </th>

              <th className="p-4 text-left">
                Estado
              </th>

              <th className="p-4 text-left">
                Lares
              </th>

              <th className="p-4 text-left">
                Utilizadores
              </th>

            </tr>

          </thead>

          <tbody>

            {clients.map(client => (

              <tr
                key={client.id}
                className="border-b"
              >

                <td className="p-4 font-medium">
                  {client.name}
                </td>

                <td className="p-4">
                  {client.subscriptionPlan}
                </td>

                <td className="p-4">
                  {client.subscriptionStatus}
                </td>

                <td className="p-4">
                  {client.facilities.length}
                </td>

                <td className="p-4">
                  {client.users.length}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

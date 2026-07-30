import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/session";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function FacilityPage({
  params,
}: Props) {
  const { id } = await params;

  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const facility = await prisma.facility.findFirst({
    where: {
      id,
      clientId: client.id,
    },
  });

  if (!facility) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {facility.name}
      </h1>

      <p>{facility.city}</p>

      <p>{facility.phone}</p>
    </div>
  );
}
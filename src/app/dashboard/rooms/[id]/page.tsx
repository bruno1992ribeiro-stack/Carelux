import { redirect } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/dashboard/rooms/${id}/edit`);
}
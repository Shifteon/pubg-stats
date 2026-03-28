import AdminGameList from "@/components/admin/AdminGameList";

type Params = Promise<{ teamId: string }>;

export default async function AdminPage({ params }: { params: Params }) {
  const { teamId } = await params;

  return (
    <div className="container mx-auto p-4">
      <AdminGameList initialTeamId={teamId} />
    </div>
  );
}

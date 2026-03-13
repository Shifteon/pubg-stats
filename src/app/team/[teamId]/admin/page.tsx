import AdminGameList from "./components/AdminGameList";

type Params = Promise<{ teamId: string }>;

export default async function AdminPage({ params }: { params: Params }) {
  const { teamId } = await params;

  return (
    <div className="container mx-auto p-4">
      <AdminGameList teamId={teamId} />
    </div>
  );
}

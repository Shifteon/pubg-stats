import AdminForm from "./components/AdminForm";

type Params = Promise<{ teamId: string }>;

export default async function AdminPage({ params }: { params: Params }) {
  const { teamId } = await params;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Game</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enter match details and player statistics to record a new game.
        </p>
      </div>

      <AdminForm teamId={teamId} />
    </div>
  );
}

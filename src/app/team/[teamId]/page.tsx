import TeamView from "@/app/team/[teamId]/components/teamView";

type Params = Promise<{ teamId: string }>;

export default async function TeamPage({ params }: { params: Params }) {
  const { teamId } = await params;

  return <TeamView teamId={teamId} />;
}

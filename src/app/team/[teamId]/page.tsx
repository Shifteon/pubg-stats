import TeamView from "@/components/team/teamView";

type Params = Promise<{ teamName: string }>;

export default async function TeamPage({ params }: { params: Params }) {
  const { teamName } = await params;
  const decodedTeamName = decodeURIComponent(teamName);

  return <TeamView teamName={decodedTeamName} />;
}

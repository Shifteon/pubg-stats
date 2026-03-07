import TeamView from "@/app/team/[teamId]/components/teamView";

type Params = Promise<{ teamName: string }>;

export default async function TeamPage({ params }: { params: Params }) {
  const { teamName } = await params;
  const decodedTeamName = decodeURIComponent(teamName);

  return <TeamView teamName={decodedTeamName} />;
}

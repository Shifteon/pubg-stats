"use client";

import { Link, Button, Card, CardBody, CardHeader, Skeleton } from "@heroui/react";
import { Players, Teams } from "@/types";
import { capitalize } from "@/utils/stringUtils";
import { usePlayersList } from "@/hooks/usePlayer";
import { useTeamsList } from "@/hooks/useTeam";
import { useUser } from "@/contexts/UserContext";

export default function HomeComponent() {
  const { playersList, isLoading: playersLoading } = usePlayersList();
  const { teamsList, isLoading: teamsLoading } = useTeamsList();
  const { user, isLoading: userLoading } = useUser();

  const players = playersList || [];
  const teams = teamsList || [];

  const isLoading = playersLoading || teamsLoading || userLoading;

  if (!userLoading && !user) {
    return (
      <div className="mt-10 mx-4 lg:mx-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">PUBG Stats Tracker</h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto mb-8">
            Welcome to the PUBG Stats Tracker! Please log in or sign up to view detailed performance metrics, game summaries, and
            player comparisons.
          </p>
          <Button as={Link} href="/login" color="primary" size="lg" variant="shadow">
            Log in or Sign up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 mx-4 lg:mx-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">PUBG Stats Tracker</h1>
        <p className="text-xl text-default-500 max-w-2xl mx-auto">
          Welcome to the PUBG Stats Tracker! View detailed performance metrics, game summaries, and
          player comparisons across different team combinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12 items-stretch">
        <Card className="p-4 h-full flex flex-col">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start shrink-0">
            <h4 className="font-bold text-large">Teams</h4>
            <p className="text-tiny text-default-500">Analyze performance by group composition</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2 flex flex-col grow">
            <p className="mb-4 text-default-600">
              Explore how different team combinations perform together.
              View win rates, average kills, damage, and game-by-game breakdowns for any squad.
            </p>
            <div className="mt-auto pt-4">
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => (
                    <Button as={Link} href={`/team/${team.id}`} key={team.id} color="primary" variant="flat" size="sm">
                      {team.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 h-full flex flex-col">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start shrink-0">
            <h4 className="font-bold text-large">Players</h4>
            <p className="text-tiny text-default-500">Deep dive into individual statistics</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2 flex flex-col grow">
            <p className="mb-4 text-default-600">
              Check out individual player stats.
              Compare performance across different team compositions.
            </p>
            <div className="mt-auto pt-4">
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {players.map((player) => (
                    <Button as={Link} href={`/player/${player.id}`} key={player.id} color="secondary" variant="flat" size="sm">
                      {capitalize(player.name)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

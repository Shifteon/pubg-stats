"use client";

import { Tab, Tabs, Button, User, Skeleton } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Key } from '@react-types/shared';
import React from "react";
import GameSummary from "@/app/team/[teamId]/components/gameSummary/gameSummary";
import GamesInRange from "@/app/team/[teamId]/components/gamesInRange/GamesInRange";
import GraphsTab from "@/app/team/[teamId]/components/graphsTab/graphsTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTeamOverview } from "@/hooks/useTeam";
import { useUser } from "@/contexts/UserContext";
import NextLink from "next/link";
import { capitalize } from "@/utils/stringUtils";
import { AVATAR_SRC_MAP } from "@/constants";

export default function TeamView({ teamId }: { teamId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useUser();
  const { teamOverview, isLoading } = useTeamOverview(teamId);
  const isAdmin = user?.email === 'bpwyatt04@gmail.com' || user?.email === 'isaacl1698@gmail.com';

  const [selectedTab, setSelectedTab] = useState<Key>(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs', 'games-in-range'].includes(tabFromParams as string)) {
      return tabFromParams;
    }
    return 'summary' as Key;
  });

  const handleTabChange = (newTab: Key) => {
    setSelectedTab(newTab);
    handleUpdateParam('tab', newTab as string);
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleUpdateParam = (paramName: string, paramValue: string) => {
    router.push(pathname + '?' + createQueryString(paramName, paramValue));
  };

  useEffect(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs', 'games-in-range'].includes(tabFromParams as string) && tabFromParams !== selectedTab) {
      setSelectedTab(tabFromParams);
    }
  }, [searchParams]);

  return (
    <>
      <div className="mt-2 mr-2 ml-2 mb-10 xl:m-10 lg:m-5 md:m-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            {isLoading ? (
              <Skeleton className="h-10 w-64 rounded-lg mb-4 cursor-wait" />
            ) : (
              <h1 className="text-3xl font-bold mb-4">{teamOverview?.teamName || "Team Overview"}</h1>
            )}
            <div className="flex flex-wrap gap-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 rounded-full cursor-wait" />
                ))
                : teamOverview?.players?.map((player) => (
                  <NextLink key={player.id} href={`/player/${player.id}`} className="hover:opacity-80 transition-opacity">
                    <User
                      name={capitalize(player.name)}
                      description={player.designation}
                      avatarProps={{
                        name: capitalize(player.name),
                        src: AVATAR_SRC_MAP[player.name]?.src,
                      }}
                    />
                  </NextLink>
                ))}
            </div>
          </div>
          {isAdmin && (
            <Button
              as={NextLink}
              href={`/team/${teamId}/admin`}
              color="primary"
              variant="flat"
              className="font-semibold"
            >
              Team Admin
            </Button>
          )}
        </div>

        <Tabs
          className="mt-5"
          destroyInactiveTabPanel={true}
          color="primary"
          onSelectionChange={handleTabChange}
          selectedKey={selectedTab}
        >
          <Tab key="summary" title="Summary">
            <GameSummary teamId={teamId} />
          </Tab>
          <Tab key="games-in-range" title="Games in Range">
            <div className="mt-4">
              <GamesInRange teamId={teamId} />
            </div>
          </Tab>
          <Tab key="graphs" title="Graphs">
            <GraphsTab teamId={teamId} />
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

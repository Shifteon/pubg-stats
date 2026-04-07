"use client";

import { Tab, Tabs, Button, User, Skeleton } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Key } from '@react-types/shared';
import React from "react";

import GamesInRange from "@/app/team/[teamId]/components/gamesInRange/GamesInRange";
import GraphsTab from "@/app/team/[teamId]/components/graphsTab/graphsTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTeamOverview } from "@/hooks/useTeam";
import { useUser } from "@/contexts/UserContext";
import NextLink from "next/link";
import { capitalize } from "@/utils/stringUtils";
import { AVATAR_SRC_MAP } from "@/constants";

import { TeamDashboard } from "@/app/team/[teamId]/components/teamDashboard/TeamDashboard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function TeamView({ teamId }: { teamId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useUser();
  const { teamOverview, isLoading } = useTeamOverview(teamId);
  const isAdmin = user?.email === 'bpwyatt04@gmail.com' || user?.email === 'isaacl1698@gmail.com';

  const [selectedTab, setSelectedTab] = useState<Key>(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['dashboard', 'graphs', 'games-in-range'].includes(tabFromParams as string)) {
      return tabFromParams;
    }
    return 'dashboard' as Key;
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
    if (tabFromParams && ['dashboard', 'graphs', 'games-in-range'].includes(tabFromParams as string) && tabFromParams !== selectedTab) {
      setSelectedTab(tabFromParams);
    }
  }, [searchParams]);

  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <div className="mt-2 mr-2 ml-2 mb-10 xl:m-10 lg:m-5 md:m-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 w-full">
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
          isVertical={isLargeScreen}
        >
          <Tab key="dashboard" title="Dashboard" className="w-full">
            <div className="mt-4 w-full">
              {teamOverview && <TeamDashboard teamOverview={teamOverview} teamId={teamId} />}
            </div>
          </Tab>

          <Tab key="games-in-range" title="Games in Range" className="w-full">
            <div className="mt-4 w-full">
              <GamesInRange teamId={teamId} />
            </div>
          </Tab>
          <Tab key="graphs" title="Graphs" className="w-full">
            <div className="mt-4 w-full">
              <GraphsTab teamId={teamId} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

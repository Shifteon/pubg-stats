"use client";

import { TeamName } from "@/types";
import { useEffect, useState } from "react";
import PlayerStatsGrid, { StatValue } from "./playerStatsGrid";
import { apiService } from "@/services/apiService";
import { Spinner } from "@heroui/react";

export interface PersonalBestsProps {
  team: TeamName;
  start?: number;
  end?: number;
}

export default function PersonalBests({ team, start, end }: PersonalBestsProps) {
  const [playerHighestStats, setPlayerHighestStats] = useState<Record<string, Record<string, StatValue>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPersonalBests = async () => {
      setLoading(true);
      let url = `/api/team/${team}/personal-bests`;
      if (start !== undefined && end !== undefined) {
        url += `?start=${start}&end=${end}`;
      }

      const data = await apiService.fetchWithCache<Record<string, Record<string, StatValue>>>(url);

      if (isMounted && data) {
        setPlayerHighestStats(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchPersonalBests();

    return () => {
      isMounted = false;
    };
  }, [team, start, end]);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-lg">
          <Spinner />
        </div>
      )}
      <div className={loading ? 'opacity-50' : ''}>
        <PlayerStatsGrid playerStats={playerHighestStats} team={team} />
      </div>
    </div>
  );
}

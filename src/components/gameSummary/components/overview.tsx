"use client";

import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { apiService } from "@/services/apiService";

export interface OverviewProps {
  team: string;
  start?: number;
  end?: number;
}

export default function Overview({ team, start, end }: OverviewProps) {
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, winStreak: 0, longestWinStreak: 0 });
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      setLoading(true);
      let url = `/api/team/${team}/overview`;
      if (start !== undefined && end !== undefined) {
        url += `?start=${start}&end=${end}`;
      }

      interface OverviewData {
        wins: number;
        losses: number;
        winRate: number;
        winStreak: number;
        longestWinStreak: number;
        totalGames: number;
      }

      const data = await apiService.fetchWithCache<OverviewData>(url);

      if (isMounted && data) {
        setStats({
          wins: data.wins,
          losses: data.losses,
          winRate: data.winRate,
          winStreak: data.winStreak,
          longestWinStreak: data.longestWinStreak
        });
        setTotalGames(data.totalGames);
        setLoading(false);
      } else if (isMounted) {
        setLoading(false);
      }
    };

    fetchOverview();

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
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${loading ? 'opacity-50' : ''}`}>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Total Games</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{totalGames}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Wins / Losses</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{stats.wins} / {stats.losses}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Rate</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{stats.winRate.toFixed(2)}%</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{stats.winStreak}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Longest Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{stats.longestWinStreak}</CardBody></Card>
      </div>
    </div>
  );
}
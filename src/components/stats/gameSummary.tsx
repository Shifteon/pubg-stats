"use client";

import { IndividualName, TeamName } from "@/types";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import { TEAM_ALL, TEAM_NO_BEN, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_NO_TRENTON } from "@/constants";

export interface GameSummaryProps {
  team: TeamName;
}

const statKeys = ["kills", "assists", "damage", "rescues", "recalls"];

interface HighestStat {
  player: IndividualName;
  value: number;
  stat: string;
}

const playerMapping: Record<string, IndividualName[]> = {
  [TEAM_ALL]: ["isaac", "cody", "trenton", "ben"],
  [TEAM_NO_BEN]: ["isaac", "cody", "trenton"],
  [TEAM_NO_TRENTON]: ["isaac", "cody", "ben"],
  [TEAM_NO_CODY]: ["isaac", "trenton", "ben"],
  [TEAM_NO_ISAAC]: ["cody", "trenton", "ben"],
};

export default function GameSummary({ team }: GameSummaryProps) {
  const [allGameData, setAllGameData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const statClass = useMemo(() => new GameSummaryStat(), []);

  const loadStats = async () => {
    setLoading(true);
    setLoadingError(false);

    const stats = await statClass.getStats(team);
    if (!stats || !stats.data) {
      setLoadingError(true);
      setLoading(false);
      return;
    }
    setAllGameData(stats.data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [team, statClass]);

  const last10Games = useMemo(() => [...allGameData].slice(-10).reverse(), [allGameData]);

  const highestStats = useMemo(() => {
    if (allGameData.length === 0) {
      return [];
    }

    const players = playerMapping[team] || [];

    return statKeys.map(stat => {
      let highest: HighestStat = { player: "ben", value: -1, stat };

      allGameData.forEach(game => {
        players.forEach(player => {
          const playerStatKey = `${player}_${stat}`;
          const statValue = parseFloat(game[playerStatKey]);
          if (statValue > highest.value) {
            highest = { player, value: statValue, stat };
          }
        });
      });

      return highest;
    });
  }, [allGameData, team]);

  const columns = useMemo(() => {
    const players = playerMapping[team] || [];
    const playerColumns = players.flatMap(player => 
      statKeys.map(stat => ({
        key: `${player}_${stat}`,
        label: `${player.charAt(0).toUpperCase() + player.slice(1)} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`
      }))
    );
    const totalColumns = statKeys.map(stat => ({
      key: `total_${stat}`,
      label: `Total ${stat.charAt(0).toUpperCase() + stat.slice(1)}`
    }));

    return [
      { key: "win", label: "Win" },
      ...playerColumns,
      ...totalColumns
    ];
  }, [team]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full p-5 mt-2">
        <Spinner size="lg" label="Loading" labelColor="primary"></Spinner>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center w-full h-full p-5 mt-2">
        <h2 className="text-red-950 text-4xl text-shadow-md">Error loading stats</h2>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="w-full flex flex-col items-center mb-8">
        <h2 className="p-2 self-start text-2xl font-bold">Hall of Fame</h2>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 w-full">
          {highestStats.map(({ player, value, stat }) => (
            <Card key={stat}>
              <CardHeader className="justify-center">
                <h3 className="text-lg font-semibold capitalize">{stat}</h3>
              </CardHeader>
              <CardBody className="text-center text-3xl font-bold">{value}</CardBody>
              <CardFooter className="justify-center text-md capitalize text-gray-500">{player}</CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <h2 className="p-2 self-start text-2xl font-bold">Last 10 Games</h2>
      <Table aria-label="Game Summary Table">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={last10Games}>
          {(item) => (
            <TableRow key={item.total_kills + Math.random()}>
              {(columnKey) => {
                const value = item[columnKey as keyof typeof item];
                if (columnKey === 'win') {
                  return <TableCell>{value === 1 ? "🏆" : "❌"}</TableCell>;
                }
                return <TableCell>{value}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
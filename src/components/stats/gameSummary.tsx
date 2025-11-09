"use client";

import { IndividualName, TeamName } from "@/types";
import { Accordion, AccordionItem, Avatar, Card, CardBody, CardFooter, CardHeader, Pagination, Slider, Tab, Tabs } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import { AVATAR_SRC_MAP, TEAM_ALL, TEAM_NO_BEN, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_NO_TRENTON } from "@/constants";
import Overview from "./overview";
import PlayerStatsGrid from "./playerStatsGrid";

export interface GameSummaryProps {
  team: TeamName;
}

const statKeys = ["kills", "assists", "damage", "rescues", "recalls"];

interface HighestStat {
  player: IndividualName;
  value: number;
  stat: string;
}

interface PlayerGameStat {
  player: string;
  kills: number;
  assists: number;
  damage: number;
  rescues: number;
  recalls: number;
}


const playerMapping: Record<string, IndividualName[]> = {
  [TEAM_ALL]: ["isaac", "cody", "trenton", "ben"],
  [TEAM_NO_BEN]: ["isaac", "cody", "trenton"],
  [TEAM_NO_TRENTON]: ["isaac", "cody", "ben"],
  [TEAM_NO_CODY]: ["isaac", "trenton", "ben"],
  [TEAM_NO_ISAAC]: ["cody", "trenton", "ben"],
};

export default function GameSummary({ team }: GameSummaryProps) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [allGameData, setAllGameData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [numberOfGames, setNumberOfGames] = useState(10);
  const [gameByGamePage, setGameByGamePage] = useState(1);

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

  const lastXGames = useMemo(() => [...allGameData].slice(-numberOfGames), [allGameData, numberOfGames]);

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

  const playerHighestStats = useMemo(() => {
    if (allGameData.length === 0) {
      return {};
    }

    const players = playerMapping[team] || [];
    const playerBests: Record<string, Record<string, number>> = {};

    players.forEach(player => {
      playerBests[player] = {};
      statKeys.forEach(stat => {
        playerBests[player][stat] = 0;
      });
    });

    allGameData.forEach(game => {
      players.forEach(player => {
        statKeys.forEach(stat => {
          const playerStatKey = `${player}_${stat}`;
          const statValue = parseFloat(game[playerStatKey]);
          if (statValue > playerBests[player][stat]) {
            playerBests[player][stat] = statValue;
          }
        });
      });
    });

    return playerBests;
  }, [allGameData, team]);

  const last10GamesPlayerAvgs = useMemo(() => {
    if (lastXGames.length === 0) {
      return {};
    }

    const players = playerMapping[team] || [];
    const playerTotals: Record<string, Record<string, number>> = {};

    players.forEach(player => {
      playerTotals[player] = {};
      statKeys.forEach(stat => {
        playerTotals[player][stat] = 0;
      });
    });

    lastXGames.forEach(game => {
      players.forEach(player => {
        statKeys.forEach(stat => {
          const playerStatKey = `${player}_${stat}`;
          playerTotals[player][stat] += parseFloat(game[playerStatKey]) || 0;
        });
      });
    });

    Object.keys(playerTotals).forEach(player => {
      Object.keys(playerTotals[player]).forEach(stat => {
        playerTotals[player][stat] /= lastXGames.length;
      });
    });

    return playerTotals;
  }, [lastXGames, team]);

  const gameTablesData = useMemo(() => {
    if (lastXGames.length === 0) {
      return [];
    }

    const players = playerMapping[team] || [];

    return [...lastXGames].reverse().map(game => {
      const gamePlayerData: PlayerGameStat[] = players.map(player => {
        const playerData: any = { player: player.charAt(0).toUpperCase() + player.slice(1) };
        statKeys.forEach(stat => {
          playerData[stat] = game[`${player}_${stat}` as keyof typeof game] || 0;
        });
        return playerData as PlayerGameStat;
      });

      const totalRow: any = { player: 'Total' };
      statKeys.forEach(stat => {
        totalRow[stat] = game[`total_${stat}` as keyof typeof game] || 0;
      });

      return { win: game.win, gameIndex: game.gameIndex, data: [...gamePlayerData, totalRow as PlayerGameStat] };
    });
  }, [lastXGames, team]);

  const gameTableColumns = [
    { key: 'player', label: 'Player' }, ...statKeys.map(stat => ({ key: stat, label: stat.charAt(0).toUpperCase() + stat.slice(1) }))
  ];

  const gamesPerPage = 10;
  const totalGamePages = Math.ceil(gameTablesData.length / gamesPerPage);
  const paginatedGameTables = useMemo(() => gameTablesData.slice((gameByGamePage - 1) * gamesPerPage, gameByGamePage * gamesPerPage), [gameTablesData, gameByGamePage]);

  useEffect(() => {
    if (gameByGamePage > totalGamePages) {
      setGameByGamePage(totalGamePages || 1);
    }
  }, [totalGamePages, gameByGamePage]);

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
      <Accordion 
        selectionMode="multiple" 
        className="w-full mt-4" 
        defaultExpandedKeys="all"
        variant="bordered"
      >
        <AccordionItem key="overview" title="Overview">
          <Overview gameData={allGameData} />
        </AccordionItem>
        <AccordionItem key="last-10-games" title={`Last ${numberOfGames} Games`}>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Overview</h3>
            <Overview gameData={lastXGames} />
          </div>
          {allGameData.length > 10 && (
            <div className="w-full md:w-1/2 mb-4 px-4">
              <Slider
                label="Number of Games"
                value={numberOfGames}
                onChange={(value) => setNumberOfGames(value as number)}
                minValue={10}
                maxValue={allGameData.length + 10}
                step={10}
                color="secondary"
              />
            </div>
          )}
          <Tabs aria-label={`Last ${numberOfGames} Games Details`} color="secondary">
            <Tab key="game-by-game" title="Game by Game">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-8 mt-4">
                {paginatedGameTables.map((game, index) => (
                  <div key={index} className="w-full">
                    <h3 className="text-xl font-semibold mb-2">Game {game.gameIndex} - {game.win === 1 ? "🏆 Win" : "❌ Loss"}</h3>
                    <Table 
                      aria-label={`Game ${game.gameIndex} Summary`}
                      color="primary"
                    >
                      <TableHeader columns={gameTableColumns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                      </TableHeader>
                      <TableBody items={game.data}>
                        {(item) => (<TableRow key={item.player}>{(columnKey) => <TableCell>{item[columnKey as keyof typeof item]}</TableCell>}</TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
              {totalGamePages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    total={totalGamePages}
                    page={gameByGamePage}
                    onChange={setGameByGamePage}
                    color="secondary"
                  />
                </div>
              )}
            </Tab>
            <Tab key="player-avgs" title="Player Averages">
              <PlayerStatsGrid playerStats={last10GamesPlayerAvgs} valueFormatter={(v) => v.toFixed(2)} />
            </Tab>
          </Tabs>
        </AccordionItem>
        <AccordionItem key="hall-of-fame" title="Hall of Fame">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 w-full">
            {highestStats.map(({ player, value, stat }) => (
              <Card key={stat}>
                <CardHeader className="justify-center">
                  <h3 className="text-lg font-semibold capitalize">{stat}</h3>
                </CardHeader>
                <CardBody className="text-center text-3xl font-bold">{value}</CardBody>
                <CardFooter className="justify-center text-md capitalize text-gray-500">
                  <Avatar
                    src={AVATAR_SRC_MAP[player]}
                    size="sm"
                    name={player}
                    showFallback
                  />
                  <p className="ml-1">{player}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem key="personal-bests" title="Personal Bests">
          <PlayerStatsGrid playerStats={playerHighestStats} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}

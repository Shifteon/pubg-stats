import React from 'react';
import { Card, CardHeader, CardBody, Chip, Spinner, ScrollShadow } from '@heroui/react';
import { getPeriodTrends } from '../Dashboard.utils';
import { Game } from '@/types';
import PlayerRadarChart from '@/components/PlayerRadarChart';
import { usePlayer } from '@/hooks/usePlayer';

interface CurrentFormCardProps {
  periodGames: Game[];
  playerId: string;
  lifetime: {
    kills: number;
    damage: number;
    assists: number;
    rescues: number;
    recalls: number;
  };
  lifetimeWinRate?: number;
}

function StatRow({ title, value, delta, precision = 1, isPercent = false }: { title: string, value: string | number, delta: number, precision?: number, isPercent?: boolean }) {
  const safeDelta = Math.abs(delta) < 0.05 ? 0 : delta;
  return (
    <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left border-b border-divider pb-3 last:border-0 last:pb-0">
      <div>
        <h4 className="text-default-500 text-xs font-medium">{title}</h4>
        <div className="text-xl font-black leading-tight">{value}{isPercent ? '%' : ''}</div>
      </div>
      <div>
        <Chip
          color={safeDelta >= 0 ? "success" : "danger"}
          variant="flat"
          size="sm"
        >
          {safeDelta > 0 ? "+" : ""}{safeDelta.toFixed(precision)}{isPercent ? '%' : ''} vs Lifetime
        </Chip>
      </div>
    </div>
  );
}

export function CurrentFormCard({ periodGames, playerId, lifetime, lifetimeWinRate }: CurrentFormCardProps) {
  const trends = getPeriodTrends(periodGames, playerId);
  const killsDelta = trends.avgKills - lifetime.kills;
  const damageDelta = trends.avgDamage - lifetime.damage;

  const assistsDelta = trends.avgAssists - lifetime.assists;
  const rescuesDelta = trends.avgRescues - lifetime.rescues;
  const recallsDelta = trends.avgRecalls - lifetime.recalls;

  const { player, isLoading } = usePlayer(playerId);

  const winRateDelta = trends.winRate - (lifetimeWinRate ?? player?.winRate ?? 0);

  const radarData = {
    kills: trends.avgKills,
    damage: trends.avgDamage,
    assists: trends.avgAssists,
    rescues: trends.avgRescues,
    recalls: trends.avgRecalls,
    winRate: trends.winRate,
  };

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-lg pb-0">Current Form</CardHeader>
      <CardBody className="grid grid-cols-3 grid-rows-2 gap-4 justify-center">
        {periodGames.length === 0 ? (
          <div className="text-center text-default-400">No games played this period.</div>
        ) : (
          <>
            <ScrollShadow hideScrollBar className="row-span-2 col-span-1 row-start-1 col-start-1 flex flex-col gap-4 pb-6 md:pb-3 max-h-[350px]">
              <StatRow title="Avg Kills" value={trends.avgKills.toFixed(1)} delta={killsDelta} />
              <StatRow title="Avg Damage" value={trends.avgDamage.toFixed(0)} delta={damageDelta} precision={0} />
              <StatRow title="Avg Assists" value={trends.avgAssists.toFixed(1)} delta={assistsDelta} />
              <StatRow title="Avg Rescues" value={trends.avgRescues.toFixed(1)} delta={rescuesDelta} />
              <StatRow title="Avg Recalls" value={trends.avgRecalls.toFixed(1)} delta={recallsDelta} />
              <StatRow title="Win Rate" value={trends.winRate.toFixed(1)} delta={winRateDelta} isPercent />
            </ScrollShadow>
            <div className="row-span-2 col-span-2 row-start-1 col-start-2">
              {isLoading ?
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner label="Loading Radar..." />
                </div> :
                player &&
                <PlayerRadarChart
                  player={{ ...player, playerAverages: { ...player.playerAverages, ...radarData }, winRate: radarData.winRate }}
                  hideChips
                  fixedOverlay={{
                    name: "Lifetime",
                    color: "#a1a1aa", // Neutral gray for lifetime averages
                    data: {
                      kills: player.playerAverages.kills,
                      damage: player.playerAverages.damage,
                      winRate: player.winRate,
                      assists: player.playerAverages.assists,
                      rescues: player.playerAverages.rescues,
                      recalls: player.playerAverages.recalls,
                    }
                  }}
                />
              }
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

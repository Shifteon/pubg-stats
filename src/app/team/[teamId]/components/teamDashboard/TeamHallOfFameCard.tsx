import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Avatar, useDisclosure } from '@heroui/react';
import { Game, TeamOverview, TeamHallOfFame } from '@/types';
import { capitalize } from '@/utils/stringUtils';
import { AVATAR_SRC_MAP } from '@/constants';
import GameModal from '@/components/game/GameModal';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

// Icons
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LifeBuoyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
  </svg>
);

const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
  </svg>
);

function HallOfFameBlock({ statKey, label, icon, hallOfFame, players, compact = false, onGameClick }: {
  statKey: string;
  label: string;
  icon: React.ReactNode;
  hallOfFame: TeamHallOfFame;
  players: TeamOverview['players'];
  compact?: boolean;
  onGameClick?: (gameId: string) => void;
}) {
  const record = hallOfFame[statKey];
  
  if (!record || record.statPair.statValue === -1) {
    return (
      <div className="flex flex-col items-center justify-center bg-default-100/30 p-2 rounded-xl border border-default-200/50 opacity-40 min-h-[130px]">
        <div className="flex items-center text-[10px] text-default-400 font-semibold uppercase">{icon} <span className="ml-1">{label}</span></div>
        <span className="text-default-400 mt-2 text-xs">--</span>
      </div>
    );
  }
  
  const player = players.find(p => p.id === record.playerId);
  if (!player) return null;

  return (
    <div 
      className={`flex flex-col items-center bg-default-100/30 p-3 pt-4 rounded-xl border border-default-200/50 shadow-sm relative overflow-hidden transition-all hover:bg-default-200/50 cursor-pointer justify-between min-h-[140px] group`}
      onClick={() => onGameClick?.(record.gameId)}
    >
      <div className="flex flex-col items-center">
        <Avatar
          src={AVATAR_SRC_MAP[player.name]?.src}
          className={`bg-content2 shadow-sm z-10 ${!compact ? 'w-12 h-12' : 'w-10 h-10'} group-hover:scale-110 transition-transform duration-300`}
          name={player.name}
          fallback={<span className="text-default-500 font-bold">{capitalize(player.name).charAt(0)}</span>}
        />
        <span className="text-[10px] font-bold text-default-700 leading-tight z-10 mt-1">{capitalize(player.name)}</span>
      </div>
      
      <span className={`${!compact ? 'text-3xl' : 'text-2xl'} font-black my-1 text-primary z-10 group-hover:scale-105 transition-transform`}>
        {Math.round(record.statPair.statValue)}
      </span>
      
      <div className="flex items-center justify-center text-[9px] sm:text-[10px] text-default-500 font-semibold uppercase tracking-wider text-center w-full bg-default-200/40 py-1.5 px-1 rounded-md z-10 mt-auto group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
        <span className="truncate ml-1">{label}</span>
      </div>
    </div>
  );
}

export function TeamHallOfFameCard() {
  const { hallOfFame, teamOverview, periodGames } = useTeamDashboard();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (gameId: string) => {
    const game = periodGames.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      onOpen();
    }
  };

  if (periodGames.length === 0) {
    return (
      <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
         <CardHeader className="font-bold text-sm pb-2 text-primary px-4 pt-4">Hall of Fame</CardHeader>
         <CardBody className="flex items-center justify-center text-xs text-default-400">
            No games recorded.
         </CardBody>
      </Card>
    );
  }

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="font-bold text-sm pb-0 text-primary px-4 pt-4">
        Hall of Fame
      </CardHeader>
      <CardBody className="p-4 flex flex-col gap-3">
        {/* Top Row: Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <HallOfFameBlock statKey="kills" label="Most Kills" icon={<TargetIcon className="w-4 h-4 text-danger" />} hallOfFame={hallOfFame} players={teamOverview.players} onGameClick={handleGameClick} />
          <HallOfFameBlock statKey="damage" label="Highest Dmg" icon={<ZapIcon className="w-4 h-4 text-warning" />} hallOfFame={hallOfFame} players={teamOverview.players} onGameClick={handleGameClick} />
        </div>

        {/* Bottom Row: Secondary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <HallOfFameBlock statKey="assists" label="Assists" icon={<UsersIcon className="w-3.5 h-3.5 text-primary" />} hallOfFame={hallOfFame} players={teamOverview.players} compact onGameClick={handleGameClick} />
          <HallOfFameBlock statKey="rescues" label="Rescues" icon={<LifeBuoyIcon className="w-3.5 h-3.5 text-success" />} hallOfFame={hallOfFame} players={teamOverview.players} compact onGameClick={handleGameClick} />
          <HallOfFameBlock statKey="recalls" label="Recalls" icon={<RefreshCwIcon className="w-3.5 h-3.5 text-secondary" />} hallOfFame={hallOfFame} players={teamOverview.players} compact onGameClick={handleGameClick} />
        </div>
      </CardBody>
      <GameModal 
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        game={selectedGame}
      />
    </Card>
  );
}

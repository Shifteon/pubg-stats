import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getDynamicRole } from '../Dashboard.utils';
import { Game } from '@/types';

interface DynamicRoleCardProps {
  weekGames: Game[];
  playerId: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'The Slayer': 'Awarded for securing high kills with deadly efficiency.',
  'The Medic': 'Earned by frequently rescuing and recalling teammates.',
  'The Bruiser': 'Given for dealing massive amounts of damage to enemies.',
  'The Tactician': 'Achieved through teamwork and securing high assists.',
  'The Survivor': 'Awarded for consistently outlasting the competition.'
};

export function DynamicRoleCard({ weekGames, playerId }: DynamicRoleCardProps) {
  const roleData = weekGames.length > 0 ? getDynamicRole(weekGames, playerId) : null;

  return (
    <Card isBlurred className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-500/20 to-purple-500/20">
      <CardHeader className="font-bold text-sm pb-0">Your Role</CardHeader>
      <CardBody className="flex flex-col items-center justify-center gap-2 py-4">
        {!roleData ? (
          <div className="text-default-400">N/A</div>
        ) : (
          <>
            <div className="text-4xl text-center font-black uppercase italic tracking-wider">
              {roleData.role}
            </div>
            <div className="text-sm font-semibold text-primary">
              {roleData.statValue}
            </div>
            <div className="text-sm text-default-400 text-center max-w-[90%]">
              {ROLE_DESCRIPTIONS[roleData.role] || 'Adapting to any situation on the battleground.'}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

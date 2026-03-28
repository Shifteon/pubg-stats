import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getDynamicRole } from '../Dashboard.utils';
import { Game } from '@/types';

interface DynamicRoleCardProps {
  weekGames: Game[];
  playerId: string;
}

export function DynamicRoleCard({ weekGames, playerId }: DynamicRoleCardProps) {
  const role = weekGames.length > 0 ? getDynamicRole(weekGames, playerId) : null;

  return (
    <Card isBlurred className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-500/20 to-purple-500/20">
      <CardHeader className="font-bold text-sm pb-0">Your Role</CardHeader>
      <CardBody className="flex items-center justify-center">
        {!role ? (
          <div className="text-default-400">N/A</div>
        ) : (
          <div className="text-4xl font-black uppercase italic tracking-wider">
            {role}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

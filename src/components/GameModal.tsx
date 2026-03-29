"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react";
import { Game } from "@/types";
import GameTable from "./GameTable";
import { useMemo } from "react";

interface GameModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  game?: Game | null;
  isLoading?: boolean;
}

export default function GameModal({ isOpen, onOpenChange, game, isLoading }: GameModalProps) {
  const tableDataWithTotal = useMemo(() => {
    if (!game) return [];

    // Check if a Total row already exists
    const hasTotal = game.stats.some(s => s.playerId === 'total');
    if (hasTotal) return game.stats;

    const totalRow: Game["stats"][0] = {
      playerId: 'total',
      playerName: 'Total',
      kills: game.stats.reduce((acc, s) => acc + s.kills, 0),
      assists: game.stats.reduce((acc, s) => acc + s.assists, 0),
      damage: game.stats.reduce((acc, s) => acc + s.damage, 0),
      rescues: game.stats.reduce((acc, s) => acc + s.rescues, 0),
      recalls: game.stats.reduce((acc, s) => acc + s.recalls, 0),
    };

    return [...game.stats, totalRow];
  }, [game]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside" backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            {isLoading || !game ? (
              <ModalBody className="min-h-[300px] flex items-center justify-center">
                <Spinner size="lg" color="primary" label="Loading game details..." />
              </ModalBody>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Game {game.gameNumber} - {game.isWin ? "🏆 Win" : "❌ Loss"}
                </ModalHeader>
                <ModalBody>
                  <GameTable data={tableDataWithTotal} gameIndex={game.gameNumber} />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

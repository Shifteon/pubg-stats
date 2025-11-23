"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { GameSummaryData } from "@/types";
import GameTable from "./GameTable";

interface GameModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  game: GameSummaryData;
}

export default function GameModal({ isOpen, onOpenChange, game }: GameModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Game {game.gameIndex} - {game.win === 1 ? "🏆 Win" : "❌ Loss"}
            </ModalHeader>
            <ModalBody>
              <GameTable data={game.data} gameIndex={game.gameIndex} />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

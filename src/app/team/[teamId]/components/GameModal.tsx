"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react";
import { Game } from "@/types";
import GameTable from "./GameTable";

interface GameModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  game?: Game | null;
  isLoading?: boolean;
}

export default function GameModal({ isOpen, onOpenChange, game, isLoading }: GameModalProps) {
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
                  <GameTable data={game.stats} gameIndex={game.gameNumber} />
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

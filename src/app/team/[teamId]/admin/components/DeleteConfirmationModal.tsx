"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from "@heroui/react";
import { Game } from "@/types";
import { useState } from "react";
import { useSWRConfig } from "swr";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  game: Game | undefined;
}

export default function DeleteConfirmationModal({ isOpen, onOpenChange, game }: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();

  if (!game) return null;

  const handleDelete = async (onClose: () => void) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/game/${game.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete game");
      }

      // Invalidate the games list
      await mutate(`/api/team/${game.teamId}/new/games`);
      addToast({ title: "Game deleted successfully", color: "success" });
      onClose();
    } catch (error) {
      console.error("Error deleting game:", error);
      addToast({ title: "Failed to delete game", color: "danger" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-danger">Confirm Deletion</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete Game {game.gameNumber} ({game.isWin ? "Win" : "Loss"})?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone and will permanently remove all player stats associated with this game.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button color="danger" onPress={() => handleDelete(onClose)} isLoading={isDeleting}>
                Delete Game
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

"use client";

import { useTeamGames, useTeamOverview } from "@/hooks/useTeam";
import { Button, Spinner, useDisclosure, Skeleton } from "@heroui/react";
import AdminForm from "./AdminForm";
import GameByGame from "@/components/GameByGame";
import { useEffect, useState } from "react";
import { Game } from "@/types";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export interface AdminGameListProps {
  teamId: string;
}

export default function AdminGameList({ teamId }: AdminGameListProps) {
  const { teamGames, isLoading } = useTeamGames(teamId);
  const { teamOverview, isLoading: isOverviewLoading } = useTeamOverview(teamId);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange
  } = useDisclosure();

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | undefined>(undefined);
  const [gameToDelete, setGameToDelete] = useState<Game | undefined>(undefined);

  const handleAddClick = () => {
    setSelectedGame(undefined);
    setIsEditMode(false);
    onOpen();
  };

  const handleEditClick = (game: Game) => {
    setSelectedGame(game);
    setIsEditMode(true);
    onOpen();
  };

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game);
    onDeleteModalOpen();
  };

  // Filter for games that have playedAt
  const playedGames = teamGames?.filter(game => game.playedAt) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {isOverviewLoading ? (
            <Skeleton className="h-8 w-48 rounded-lg mb-2" />
          ) : (
            <h2 className="text-3xl font-bold">{teamOverview?.teamName}: Admin</h2>
          )}
          <p className="text-gray-500 text-sm mt-1">Add new games or edit existing ones.</p>
        </div>
        <Button color="primary" onPress={handleAddClick}>
          Add New Game
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner />
            <div>Loading games...</div>
          </div>
        ) : playedGames.length > 0 ? (
          <GameByGame gameData={playedGames} hideFilters={true} onEditGame={handleEditClick} onDeleteGame={handleDeleteClick} />
        ) : (
          <div className="text-center text-gray-500 py-8 border rounded-lg">
            No games recorded yet. Click &quot;Add New Game&quot; to get started.
          </div>
        )}
      </div>

      <AdminForm
        teamId={teamId}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isEdit={isEditMode}
        initialGame={selectedGame}
      />

      <DeleteConfirmationModal // Added DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalOpenChange}
        game={gameToDelete}
      />
    </div>
  );
}

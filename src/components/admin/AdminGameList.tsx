"use client";

import { useTeamGames, useTeamOverview, useTeamsList } from "@/hooks/useTeam";
import { Button, Spinner, useDisclosure, Skeleton, Select, SelectItem } from "@heroui/react";
import AdminForm from "./AdminForm";
import GameByGame from "@/components/GameByGame";
import { useEffect, useState } from "react";
import { Game } from "@/types";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export interface AdminGameListProps {
  initialTeamId?: string;
}

export default function AdminGameList({ initialTeamId }: AdminGameListProps) {
  const { teamsList, isLoading: isTeamsLoading } = useTeamsList();
  const [activeTeamId, setActiveTeamId] = useState<string | undefined>(initialTeamId);

  // Default to the first team if not provided and teams are loaded
  useEffect(() => {
    if (!activeTeamId && teamsList && teamsList.length > 0) {
      setActiveTeamId(teamsList[0].id);
    }
  }, [teamsList, activeTeamId]);

  const { teamGames, isLoading } = useTeamGames(activeTeamId || "");
  const { teamOverview, isLoading: isOverviewLoading } = useTeamOverview(activeTeamId || "");
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
            <h2 className="text-3xl font-bold">{teamOverview?.teamName || "Global"}: Admin</h2>
          )}
          <p className="text-gray-500 text-sm mt-1">Add new games or edit existing ones.</p>
        </div>
        <div className="flex flex-row items-center gap-4 w-full md:w-auto">
          {teamsList && (
            <Select
              label="Select Team"
              className="w-48"
              selectedKeys={activeTeamId ? [activeTeamId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) setActiveTeamId(selected);
              }}
              size="sm"
            >
              {teamsList.map((team) => (
                <SelectItem key={team.id} textValue={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </Select>
          )}
          <Button color="primary" onPress={handleAddClick} isDisabled={!activeTeamId || isOverviewLoading}>
            Add New Game
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {isLoading || isTeamsLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner />
            <div>Loading games...</div>
          </div>
        ) : playedGames.length > 0 ? (
          <GameByGame gameData={playedGames} hideFilters={true} onEditGame={handleEditClick} onDeleteGame={handleDeleteClick} />
        ) : (
          <div className="text-center text-gray-500 py-8 border rounded-lg">
            {activeTeamId ? 'No games recorded yet. Click "Add New Game" to get started.' : 'Select a team first.'}
          </div>
        )}
      </div>

      {activeTeamId && (
        <AdminForm
          teamId={activeTeamId}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isEdit={isEditMode}
          initialGame={selectedGame}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalOpenChange}
        game={gameToDelete}
      />
    </div>
  );
}

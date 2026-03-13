"use client";

import { useTeamOverview, useTeamGames, useTeamGame } from "@/hooks/useTeam";
import {
  Form,
  Input,
  Button,
  DatePicker,
  RadioGroup,
  Radio,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Alert,
  DateValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner
} from "@heroui/react";
import { getLocalTimeZone, parseAbsolute, ZonedDateTime } from "@internationalized/date";
import { useState, useEffect } from "react";
import { CreateGamePayload } from "@/app/api/team/[teamId]/new/game/route";
import { Game } from "@/types";

export interface AdminFormProps {
  teamId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isEdit?: boolean;
  initialGame?: Game;
}

export default function AdminForm({ teamId, isOpen, onOpenChange, isEdit, initialGame }: AdminFormProps) {
  const { teamOverview, isLoading, isError } = useTeamOverview(teamId);
  const { teamGames, mutate: mutateGames } = useTeamGames(teamId);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "danger", text: string } | null>(null);
  const [gameId, setGameId] = useState<string | null>(initialGame?.id ?? null);

  const { game, mutate: mutateGame } = useTeamGame(teamId, gameId);

  const [date, setDate] = useState<DateValue>(
    initialGame?.playedAt
      ? parseAbsolute(new Date(initialGame.playedAt).toISOString(), getLocalTimeZone())
      : parseAbsolute(new Date().toISOString(), getLocalTimeZone())
  );
  const [isWin, setIsWin] = useState(initialGame ? initialGame.isWin : true);

  useEffect(() => {
    if (initialGame) {
      setDate(parseAbsolute(new Date(initialGame.playedAt!).toISOString(), getLocalTimeZone()));
      setIsWin(initialGame.isWin);
    } else {
      // Reset for "Add New Game"
      setDate(parseAbsolute(new Date().toISOString(), getLocalTimeZone()));
      setIsWin(true);
    }
  }, [initialGame]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!teamOverview) return;

    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const formData = new FormData(e.currentTarget);

    // Build stats array from formData
    const stats: CreateGamePayload["stats"] = [];
    teamOverview.players.forEach(player => {
      stats.push({
        playerId: player.id,
        kills: Number(formData.get(`player-${player.id}-kills`)),
        assists: Number(formData.get(`player-${player.id}-assists`)),
        damage: Number(formData.get(`player-${player.id}-damage`)),
        rescues: Number(formData.get(`player-${player.id}-rescues`)),
        recalls: Number(formData.get(`player-${player.id}-recalls`)),
      });
    });

    const payload: CreateGamePayload = {
      isWin,
      matchType: teamOverview.players.length > 2 ? "squad" : "duo",
      playedAt: date.toDate(getLocalTimeZone()),
      stats
    };

    const endpoint = isEdit && initialGame
      ? `/api/game/${initialGame.id}`
      : `/api/team/${teamId}/new/game`;

    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitMessage({ type: "danger", text: result.error || "Failed to save game" });
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage({ type: "success", text: `Game ${isEdit ? 'updated' : 'added'} successfully!` });
    setIsSubmitting(false);

    if (isEdit && initialGame) {
      setGameId(initialGame.id);
      mutateGame();
      mutateGames(); // Revalidate the games list in case any stats changed
    } else {
      setGameId(result.id);
      mutateGames(); // Re-fetch the games list from the server
    }

    // Refresh the team cache and close modal
    onOpenChange(false);
    setSubmitMessage(null);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isEdit ? "Edit Game" : "Add New Game"}
            </ModalHeader>
            <ModalBody>
              {isLoading &&
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  <div>Loading team data...</div>
                </div>
              }
              {
                isError && <div>Error loading team data.</div>
              }
              {
                !isLoading && !isError && !teamOverview && <div>No team data available.</div>
              }
              {!isLoading && !isError && teamOverview &&
                <Form key={initialGame?.id || 'new'} id="admin-game-form" onSubmit={onSubmit} className="w-full flex flex-col gap-6" validationBehavior="native">
                  {/* Game Details Card */}
                  <Card className="w-full">
                    <CardHeader className="flex gap-3">
                      <div className="flex flex-col">
                        <p className="text-md font-bold">Game Details</p>
                        <p className="text-small text-default-500">Overall match information</p>
                      </div>
                    </CardHeader>
                    <CardBody className="flex flex-col md:flex-row gap-4">
                      <RadioGroup
                        label="Game Result"
                        orientation="horizontal"
                        value={isWin ? "win" : "loss"}
                        onValueChange={(val) => setIsWin(val === "win")}
                        isRequired
                      >
                        <div className="flex flex-row gap-4">
                          <Radio value="win" color="success">Win</Radio>
                          <Radio value="loss" color="danger">Loss</Radio>
                        </div>
                      </RadioGroup>

                      <DatePicker
                        label="Played At"
                        hideTimeZone
                        showMonthAndYearPickers
                        value={date}
                        onChange={(val) => setDate(val as DateValue)}
                        granularity="minute"
                        className="max-w-sm"
                        isRequired
                      />
                    </CardBody>
                  </Card>

                  {/* Player Stats Section */}
                  <Card className="w-full">
                    <CardHeader className="flex gap-3">
                      <div className="flex flex-col">
                        <p className="text-md font-bold">Player Statistics</p>
                        <p className="text-small text-default-500">Individual match performance</p>
                      </div>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-6">
                      {teamOverview.players.map((player, index) => (
                        <div key={player.id} className="flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-32 font-semibold flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                              <span>{player.name}</span>
                            </div>

                            <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 md:flex md:flex-row gap-4">
                              <Input
                                type="number"
                                label="Kills"
                                name={`player-${player.id}-kills`}
                                defaultValue={initialGame?.stats.find(s => s.playerId === player.id)?.kills?.toString() || "0"}
                                min="0"
                                size="sm"
                                isRequired
                              />
                              <Input
                                type="number"
                                label="Assists"
                                name={`player-${player.id}-assists`}
                                defaultValue={initialGame?.stats.find(s => s.playerId === player.id)?.assists?.toString() || "0"}
                                min="0"
                                size="sm"
                                isRequired
                              />
                              <Input
                                type="number"
                                label="Damage"
                                name={`player-${player.id}-damage`}
                                defaultValue={initialGame?.stats.find(s => s.playerId === player.id)?.damage?.toString() || "0"}
                                min="0"
                                step="0.1"
                                size="sm"
                                isRequired
                              />
                              <Input
                                type="number"
                                label="Rescues"
                                name={`player-${player.id}-rescues`}
                                defaultValue={initialGame?.stats.find(s => s.playerId === player.id)?.rescues?.toString() || "0"}
                                min="0"
                                size="sm"
                                isRequired
                              />
                              <Input
                                type="number"
                                label="Recalls"
                                name={`player-${player.id}-recalls`}
                                defaultValue={initialGame?.stats.find(s => s.playerId === player.id)?.recalls?.toString() || "0"}
                                min="0"
                                size="sm"
                                isRequired
                              />
                            </div>
                          </div>
                          {index < teamOverview.players.length - 1 && <Divider className="mt-2" />}
                        </div>
                      ))}
                    </CardBody>
                  </Card>

                  {submitMessage && (
                    <Alert
                      color={submitMessage.type}
                      title={submitMessage.type === "success" ? "Success" : "Error"}
                      description={submitMessage.text}
                      onClose={() => setSubmitMessage(null)}
                    />
                  )}

                </Form>
              }
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                form="admin-game-form"
                isLoading={isSubmitting}
              >
                {isEdit ? "Update Game Record" : "Save Game Record"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

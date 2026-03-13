"use client";

import { useTeamOverview } from "@/hooks/useTeam";
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
  DateValue
} from "@heroui/react";
import { getLocalTimeZone, parseAbsolute, ZonedDateTime } from "@internationalized/date";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateGamePayload } from "@/app/api/team/[teamId]/new/game/route";

export default function AdminForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { teamOverview, isLoading, isError } = useTeamOverview(teamId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "danger", text: string } | null>(null);

  const [date, setDate] = useState<DateValue>(parseAbsolute(new Date().toISOString(), getLocalTimeZone()));
  const [isWin, setIsWin] = useState(true);

  if (isLoading) return <div>Loading team data...</div>;
  if (isError) return <div>Error loading team data.</div>;
  if (!teamOverview) return <div>No team data available.</div>;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      matchType: "squad",
      playedAt: date.toDate(getLocalTimeZone()),
      stats
    };

    const response = await fetch(`/api/team/${teamId}/new/game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      setSubmitMessage({ type: "danger", text: result.error || "Failed to submit game" });
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage({ type: "success", text: "Game added successfully!" });
    setIsSubmitting(false);

    // Refresh the team cache since a game was added
    router.refresh();
  };

  return (
    <Form onSubmit={onSubmit} className="w-full flex flex-col gap-6" validationBehavior="native">
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
                    defaultValue="0"
                    min="0"
                    size="sm"
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Assists"
                    name={`player-${player.id}-assists`}
                    defaultValue="0"
                    min="0"
                    size="sm"
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Damage"
                    name={`player-${player.id}-damage`}
                    defaultValue="0"
                    min="0"
                    step="0.1"
                    size="sm"
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Rescues"
                    name={`player-${player.id}-rescues`}
                    defaultValue="0"
                    min="0"
                    size="sm"
                    isRequired
                  />
                  <Input
                    type="number"
                    label="Recalls"
                    name={`player-${player.id}-recalls`}
                    defaultValue="0"
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

      <div className="flex justify-end mt-4 mb-10 w-full">
        <Button
          color="primary"
          type="submit"
          isLoading={isSubmitting}
          size="lg"
          className="w-full md:w-auto"
        >
          Save Game Record
        </Button>
      </div>
    </Form>
  );
}

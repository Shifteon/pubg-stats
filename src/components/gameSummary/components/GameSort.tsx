"use client";

import { Select, SelectItem, RadioGroup, Radio, Button } from "@heroui/react";
import { useState, useEffect } from "react";

export interface SortConfig {
  player: string;
  stat: string;
  direction: "asc" | "desc";
}

interface GameSortProps {
  players: string[];
  stats: string[];
  sortConfig: SortConfig | null;
  onSortChange: (config: SortConfig | null) => void;
}

export default function GameSort({
  players,
  stats,
  sortConfig,
  onSortChange,
}: GameSortProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedStat, setSelectedStat] = useState<string>("");
  const [selectedDirection, setSelectedDirection] = useState<"asc" | "desc">("desc");

  // Sync local state with props if sortConfig changes externally (or on mount)
  useEffect(() => {
    if (sortConfig) {
      setSelectedPlayer(sortConfig.player);
      setSelectedStat(sortConfig.stat);
      setSelectedDirection(sortConfig.direction);
    } else {
      // Optional: reset local state if sort is cleared externally
      // setSelectedPlayer("");
      // setSelectedStat("");
      // setSelectedDirection("desc");
    }
  }, [sortConfig]);

  const handleApplySort = () => {
    if (!selectedPlayer || !selectedStat) return;
    onSortChange({
      player: selectedPlayer,
      stat: selectedStat,
      direction: selectedDirection,
    });
  };

  const handleClearSort = () => {
    setSelectedPlayer("");
    setSelectedStat("");
    setSelectedDirection("desc");
    onSortChange(null);
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-6 p-4 border-t border-default-200">
      <h4 className="text-small font-bold text-default-500 uppercase">Sort Games</h4>
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <Select
          label="Player"
          placeholder="Select player"
          selectedKeys={selectedPlayer ? [selectedPlayer] : []}
          onChange={(e) => {
            setSelectedPlayer(e.target.value);
            // Auto-apply if both fields are selected? Or wait for button?
            // Let's wait for button or explicit action to avoid jumping UI
          }}
          className="md:w-1/4"
          size="sm"
        >
          {players.map((player) => (
            <SelectItem key={player}>
              {player}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Stat"
          placeholder="Select stat"
          selectedKeys={selectedStat ? [selectedStat] : []}
          onChange={(e) => setSelectedStat(e.target.value)}
          className="md:w-1/4"
          size="sm"
        >
          {stats.map((stat) => (
            <SelectItem key={stat}>
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </SelectItem>
          ))}
        </Select>

        <div className="w-full gap-2 md:w-1/4">
          <RadioGroup
            label="Direction"
            orientation="horizontal"
            value={selectedDirection}
            onValueChange={(val) => setSelectedDirection(val as "asc" | "desc")}
            size="sm"
          >
            <Radio value="desc">Desc</Radio>
            <Radio value="asc">Asc</Radio>
          </RadioGroup>
        </div>

        <div className="flex gap-2">
          <Button
            color="primary"
            onPress={handleApplySort}
            isDisabled={!selectedPlayer || !selectedStat}
          >
            Apply Sort
          </Button>
          {sortConfig && (
            <Button color="danger" variant="flat" onPress={handleClearSort}>
              Clear
            </Button>
          )}
        </div>
      </div>
      {sortConfig && (
        <div className="text-small text-default-500">
          Currently sorting by: <span className="font-semibold text-primary">{sortConfig.player} {sortConfig.stat} ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})</span>
        </div>
      )}
    </div>
  );
}

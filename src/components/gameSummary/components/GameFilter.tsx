"use client";

import { Button, Chip, Input, Select, SelectItem, RadioGroup, Radio } from "@heroui/react";
import { useState } from "react";

export interface Filter {
  player: string;
  stat: string;
  operator: string;
  value: number;
}

interface GameFilterProps {
  players: string[];
  stats: string[];
  onAddFilter: (filter: Filter) => void;
  activeFilters: Filter[];
  onRemoveFilter: (index: number) => void;
  filterResult: string;
  onFilterResultChange: (value: string) => void;
}

const operators = [
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
  { label: "=", value: "=" },
];

export default function GameFilter({
  players,
  stats,
  onAddFilter,
  activeFilters,
  onRemoveFilter,
  filterResult,
  onFilterResultChange,
}: GameFilterProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedStat, setSelectedStat] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>(">=");
  const [filterValue, setFilterValue] = useState<string>("0");

  const handleAddFilter = () => {
    if (!selectedPlayer || !selectedStat || !selectedOperator || filterValue === "") {
      return;
    }

    onAddFilter({
      player: selectedPlayer,
      stat: selectedStat,
      operator: selectedOperator,
      value: Number(filterValue),
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-6 p-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <Select
          label="Player"
          placeholder="Select player"
          selectedKeys={selectedPlayer ? [selectedPlayer] : []}
          onChange={(e) => setSelectedPlayer(e.target.value)}
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

        <Select
          label="Operator"
          placeholder="Select operator"
          selectedKeys={selectedOperator ? [selectedOperator] : []}
          onChange={(e) => setSelectedOperator(e.target.value)}
          className="md:w-1/4"
          size="sm"
        >
          {operators.map((op) => (
            <SelectItem key={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label="Value"
          placeholder="0"
          value={filterValue}
          onValueChange={setFilterValue}
          className="md:w-1/4"
          size="sm"
        />

        <Button color="primary" onPress={handleAddFilter}>
          Add Filter
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <RadioGroup
          label="Filter by Result"
          orientation="horizontal"
          value={filterResult}
          onValueChange={onFilterResultChange}
        >
          <Radio value="all">All</Radio>
          <Radio value="win">Win</Radio>
          <Radio value="loss">Loss</Radio>
        </RadioGroup>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              onClose={() => onRemoveFilter(index)}
              variant="flat"
              color="secondary"
            >
              {filter.player} {filter.stat} {filter.operator} {filter.value}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

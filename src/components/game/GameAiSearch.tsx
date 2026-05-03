"use client";

import { useState } from "react";
import { Input, Button, Card, CardBody } from "@heroui/react";
import { Filter } from "./GameFilter";
import { SortConfig } from "./GameSort";
import { useUser } from "@/contexts/UserContext";

interface GameAiSearchProps {
  onSearchComplete: (filters: Filter[], sortConfig: SortConfig | null, resultFilter: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function GameAiSearch({ onSearchComplete, isLoading, setIsLoading }: GameAiSearchProps) {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/game-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();
      onSearchComplete(data.filters || [], data.sortConfig || null, data.resultFilter || "all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setError(null);
    onSearchComplete([], null, "all");
  };

  return (
    <Card className="w-full mb-6 bg-primary/5 border border-primary/20 shadow-sm">
      <CardBody className="p-4 flex flex-col gap-2">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to filter or sort games... (e.g. 'Show me games where I had over 500 damage')"
            variant="faded"
            radius="lg"
            className="flex-1"
            classNames={{
              inputWrapper: "bg-default-100",
            }}
            isDisabled={isLoading}
            startContent={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-default-400">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <div className="flex gap-2">
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              isDisabled={!query.trim()}
              className="md:w-32 font-medium"
            >
              Search
            </Button>
            {(query || error) && (
              <Button
                color="danger"
                variant="flat"
                onPress={handleClear}
                isDisabled={isLoading}
                isIconOnly
                aria-label="Clear Search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        </form>
        {error && (
          <p className="text-danger text-sm px-1">{error}</p>
        )}
      </CardBody>
    </Card>
  );
}

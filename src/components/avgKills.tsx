"use client";

import { AverageKillsArray, TeamName } from "@/types";
import { useEffect, useState } from "react";
import StatLineChart from "./charts/statLineChart";

export interface AvgKillsProps {
  team: TeamName
}

export default function AvgKills(props: AvgKillsProps) {
  const [stats, setStats] = useState([] as AverageKillsArray);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // fetch stats from api
  const fetchStats = async () => {
    try {
      const results = await fetch(`/api/avgKills?team=${props.team}`);
      if (!results.ok) {
        setLoadingError(true);
      }

      const json = await results.json();
      console.log("average kills json: ", json);
      setStats(json.averageKillsArray as AverageKillsArray);
    } catch (error) {
      setLoadingError(true);
    } finally {
      setLoading(false);
    }
  };

  // fetch stats from api on load
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [props.team]);

  return (
    <div style={{ marginTop: 5 }}>
      <h2>Average Kills</h2>
      {loading ? (
        // When loading is TRUE
        <p>⏳ Loading...</p>
      ) : (
        // When loading is FALSE
        <StatLineChart data={stats} />
      )}
    </div>
  );
}
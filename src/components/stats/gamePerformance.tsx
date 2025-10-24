"use client";

import { FrontendStatArray, TeamName, StatName } from "@/types";
import { useEffect, useState } from "react";
import StatLineChart from "../charts/statLineChart";
import { STAT_DISPLAY_NAME_MAP } from "@/constants";

export interface AvgKillsProps {
  team: TeamName;
  stat: StatName;
}

export default function GamePerformanceStat(props: AvgKillsProps) {
  const [stats, setStats] = useState([] as FrontendStatArray);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // fetch stats from api
  const fetchStats = async () => {
    try {
      const results = await fetch(`/api/stats?team=${props.team}&stat=${props.stat}`);
      if (!results.ok) {
        setLoadingError(true);
      }

      const json = await results.json();
      setStats(json.frontendStatArray as FrontendStatArray);
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
      <h2>{STAT_DISPLAY_NAME_MAP[props.stat]}</h2>
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
"use client";

import { AverageKillsArray, TeamName } from "@/types";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from "react";

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

  return (
    <div>
      <h3>Average Kills</h3>
      <Card>
        <Skeleton isLoaded={!loading}>
          <CardBody>
            <LineChart
              style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
              responsive
              data={stats}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis interval={20} />
              <YAxis width="auto" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dot={false} dataKey="isaac_kills" stroke="#023E8A" strokeWidth={2} />
              <Line type="monotone" dot={false} dataKey="cody_kills" stroke="#E27249" strokeWidth={2} />
              <Line type="monotone" dot={false} dataKey="ben_kills" stroke="#D71515" strokeWidth={2} />
              <Line type="monotone" dot={false} dataKey="trenton_kills" stroke="#276221" strokeWidth={2} />
              <Line type="monotone" dot={false} dataKey="team_kills" stroke="#6C3BAA" strokeWidth={2} />
            </LineChart>
          </CardBody>
        </Skeleton>
      </Card>
    </div>
  );
}
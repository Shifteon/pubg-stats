"use client";

import { Link, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function HomeComponent() {
  return (
    <div className="mt-10 mx-4 lg:mx-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">PUBG Stats Tracker</h1>
        <p className="text-xl text-default-500 max-w-2xl mx-auto">
          Welcome to the PUBG Stats Tracker! View detailed performance metrics, game summaries, and
          player comparisons across different team combinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Teams</h4>
            <p className="text-tiny text-default-500">Analyze performance by group composition</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="mb-4 text-default-600">
              Explore how different team combinations perform together.
              View win rates, average kills, damage, and game-by-game breakdowns for any squad.
            </p>
            <div className="mt-auto pt-4">
              <Button as={Link} href="/team/All" color="primary" variant="flat" className="w-full sm:w-auto">
                View All Teams
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Players</h4>
            <p className="text-tiny text-default-500">Deep dive into individual statistics</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="mb-4 text-default-600">
              Check out individual player stats, weapons usage, and personal bests.
              Compare performance across different team compositions.
            </p>
            <div className="mt-auto pt-4">
              <Button as={Link} href="/player/e031ca37-9759-4503-ac8b-4a7cf5ea0a05" color="primary" variant="flat" className="w-full sm:w-auto">
                View Players
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

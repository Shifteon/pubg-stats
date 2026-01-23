"use client";

import HomeComponent from "@/components/home/home";
import LoadingSpinner from "@/components/loadingSpinner";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeComponent></HomeComponent>
    </Suspense>
  );
}

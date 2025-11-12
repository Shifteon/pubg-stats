"use client";

import { Button } from "@heroui/react";
import React from "react";

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    aria-hidden="true"
    focusable="false"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.5 9a9 9 0 0114.8-4.4L23 10M1 14l4.7 4.4A9 9 0 0020.5 15"></path>
  </svg>
);

export default function CacheRefreshButton() {
  const handleRefresh = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("cache_")) {
        localStorage.removeItem(key);
      }
    }
    window.location.reload();
  };

  return (
    <Button isIconOnly variant="flat" onPress={handleRefresh}>
      <RefreshIcon className="w-5 h-5" />
    </Button>
  );
}
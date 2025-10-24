'use client';

import { HeroUIProvider } from "@heroui/react";
import React from 'react';

/**
 * Providers wrapper component for the Next.js App Router.
 * This client component wraps the application with the HeroUIProvider,
 * enabling theme, context, and proper styling/functionality for all HeroUI components.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // The HeroUIProvider wraps your entire application.
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}

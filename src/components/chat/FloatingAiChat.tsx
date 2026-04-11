"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import AiChat from "./AiChat";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingAiChat() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Only render if a user is logged in
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[350px] h-[500px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] shadow-2xl rounded-large overflow-hidden"
          >
            <AiChat />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        isIconOnly
        color="primary"
        radius="full"
        size="lg"
        className="shadow-lg shadow-primary/40 p-0 overflow-hidden"
        style={{ width: "56px", height: "56px" }}
        onPress={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
            </motion.svg>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}

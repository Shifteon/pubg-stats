"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { Button, Input, ScrollShadow, Card, CardBody, CardHeader, CardFooter, Avatar } from "@heroui/react";
import { useUser } from "@/contexts/UserContext";
import { PubgAgentUIMessage } from "@/lib/agents/pubgAgent";

// Simple Markdown renderer substitute (if no robust react-markdown is installed).
// We'll just display plain text but handle line-breaks.
const formatMessage = (content: string) => {
  return content.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));
};

export default function AiChat() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat<PubgAgentUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            userId: user?.id,
            userEmail: user?.email,
          },
        }
      );
      setInput("");
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-background/60 backdrop-blur-md shadow-2xl border border-default-200">
      <CardHeader className="flex gap-3 justify-between items-center border-b border-default-200 pb-3">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<span className="text-xl">🤖</span>}
            classNames={{ base: "bg-primary/20", icon: "text-primary" }}
            size="sm"
          />
          <div className="flex flex-col">
            <p className="text-md font-semibold text-foreground">PUBG Stats AI</p>
            <p className="text-xs text-default-500">Ask about your games or team performance</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 overflow-hidden flex-1 relative">
        <ScrollShadow ref={scrollRef} className="h-full w-full p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-default-400 mt-10 text-sm">
              <p>Hey there! I can help you analyze your PUBG stats.</p>
              <p className="mt-2 opacity-70">Try asking: &quot;Who is the biggest kill stealer on my team?&quot;</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-default-100 text-foreground rounded-tl-sm"
                  }`}
              >
                {m.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <span key={index}>{formatMessage(part.text)}</span>;
                  }

                  if (part.type === 'reasoning') {
                    return (
                      <div key={index} className="mb-3 p-2 rounded-lg bg-default-200/50 border-l-4 border-primary/30 text-xs text-default-600 font-mono whitespace-pre-wrap">
                        <div className="flex items-center gap-1 mb-1 opacity-70 font-bold uppercase tracking-wider text-[10px]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                          Thought Process
                        </div>
                        {part.text}
                      </div>
                    );
                  }

                  if (isToolUIPart(part) && part.state !== 'output-available') {
                    return (
                      <div key={index} className="mt-2 flex flex-col gap-1 text-xs opacity-60">
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Retrieving data...
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          {(status === "submitted" || status === "streaming") && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex justify-start">
              <div className="bg-default-100 text-foreground rounded-2xl rounded-tl-sm px-4 py-2 text-sm max-w-[85%]">
                <span className="flex space-x-1 items-center h-5">
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
                </span>
              </div>
            </div>
          )}
        </ScrollShadow>
      </CardBody>

      <CardFooter className="pt-3 border-t border-default-200 p-4">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            variant="faded"
            radius="full"
            className="flex-1"
            classNames={{
              inputWrapper: "bg-default-100",
            }}
            isDisabled={status !== "ready"}
          />
          <Button
            isIconOnly
            color="primary"
            radius="full"
            type="submit"
            isLoading={status === "submitted" || status === "streaming"}
            isDisabled={!input.trim() || status !== "ready"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

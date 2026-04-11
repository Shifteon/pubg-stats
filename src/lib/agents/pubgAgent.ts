import { ToolLoopAgent, InferAgentUIMessage } from 'ai';
import { getChatTools } from '../tools/chatTools';

export function createPubgAgent(baseUrl: string, instructions: string, headers?: Record<string, string>) {
  return new ToolLoopAgent({
    model: 'google/gemini-2.5-flash',
    instructions,
    tools: getChatTools(baseUrl, headers),
  });
}

// Strictly for basic type definition, no headers needed here
export type PubgAgentUIMessage = InferAgentUIMessage<ReturnType<typeof createPubgAgent>>;

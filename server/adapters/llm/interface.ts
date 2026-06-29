/**
 * LLM provider adapter interface.
 *
 * The default implementation in `server/_core/llm.ts` calls any
 * OpenAI-compatible chat completions endpoint (configured via
 * LLM_API_BASE_URL + LLM_API_KEY env vars).
 *
 * To plug in a different provider:
 *   - OpenAI:       LLM_API_BASE_URL=https://api.openai.com  LLM_API_KEY=sk-…
 *   - Anthropic:    Use an OpenAI-compat proxy (e.g. LiteLLM) or implement ILLMAdapter.
 *   - Local Ollama: LLM_API_BASE_URL=http://localhost:11434   LLM_API_KEY=ollama
 *
 * If you need non-OpenAI-compatible providers, implement ILLMAdapter and
 * replace the invokeLLM export in `server/_core/llm.ts`.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool" | "function";
  content: string | Array<{ type: string; text?: string; [k: string]: unknown }>;
  name?: string;
  tool_call_id?: string;
}

export interface LLMTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface LLMInvokeParams {
  messages: LLMMessage[];
  tools?: LLMTool[];
  toolChoice?: "none" | "auto" | "required" | { name: string };
  maxTokens?: number;
  responseFormat?: { type: "text" | "json_object" | "json_schema"; json_schema?: unknown };
}

export interface LLMInvokeResult {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string | null;
  }>;
}

export interface ILLMAdapter {
  invoke(params: LLMInvokeParams): Promise<LLMInvokeResult>;
}

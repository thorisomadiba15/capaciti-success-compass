import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PROMPTS = {
  email:
    "You are a professional communication assistant for CAPACITI students in a 1-week AI training program. Write a clear, polite, professional email. Start with 'Subject: ...' then the email body. No markdown.",
  notes:
    "You summarize meeting notes for CAPACITI students. Output plain text with these sections: SUMMARY (2-3 sentences), KEY POINTS (bullets with '- '), ACTION ITEMS (bullets with '- ', include owner/deadline if mentioned). No markdown symbols other than '- '.",
  tasks:
    "You are a study planner for CAPACITI students in a 1-week AI training program. Create a realistic, organised day-by-day plan with time blocks, priorities (High/Medium/Low) and deadlines. Plain text, use '- ' bullets and day headings in CAPS. No other markdown.",
} as const;

export const runAi = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ tool: z.enum(["email", "notes", "tasks"]), input: z.string().min(3).max(8000) }).parse,
  )
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: PROMPTS[data.tool],
        input: data.input,
      });
      let text = "";
      for (const item of (res as { output?: unknown[] }).output ?? []) {
        const content = (item as { content?: { type?: string; text?: string }[] }).content;
        for (const c of content ?? []) if (c.type === "output_text" && c.text) text += c.text;
      }
      return { text: text.trim() || "No response generated.", error: null as string | null };
    } catch (e) {
      if (e instanceof GatewayError) {
        const msg =
          e.code === "rate_limited"
            ? "Too many requests — please wait a moment and try again."
            : e.httpStatus === 402
              ? "AI credits are exhausted. Please top up to continue."
              : "The AI service is unavailable right now. Please try again.";
        return { text: "", error: msg };
      }
      throw e;
    }
  });

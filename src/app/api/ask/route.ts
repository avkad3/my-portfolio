import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/knowledge";

/**
 * ASK ADITYA endpoint.
 *
 * - Default: answers locally from the portfolio knowledge base (retrieval + grounded composer).
 * - If ASSISTANT_API_URL is set, the question is forwarded to the FastAPI service in
 *   /assistant-api (which can add LLM generation). Keys live only on that server.
 *   Any upstream failure falls back to the local answer.
 */
export async function POST(req: Request) {
  let question = "";
  try {
    const body = await req.json();
    question = typeof body?.question === "string" ? body.question.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });
  if (question.length > 300) return NextResponse.json({ error: "Question is too long" }, { status: 413 });

  const upstream = process.env.ASSISTANT_API_URL;
  if (upstream) {
    try {
      const res = await fetch(`${upstream.replace(/\/$/, "")}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(12_000),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ answer: data.answer, sources: data.sources ?? [], mode: data.mode ?? "fastapi" });
      }
    } catch {
      // fall through to local
    }
  }

  const { answer, sources } = answerQuestion(question);
  return NextResponse.json({ answer, sources, mode: "local retrieval" });
}

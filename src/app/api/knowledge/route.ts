import { NextResponse } from "next/server";
import { buildDocs } from "@/lib/knowledge";

/** Public portfolio knowledge base (same documents ASK ADITYA retrieves from). Consumed by /assistant-api. */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ docs: buildDocs() });
}

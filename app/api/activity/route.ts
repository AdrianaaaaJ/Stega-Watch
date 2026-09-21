import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ActivityType = "visit" | "encode" | "scan";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash is not configured.");
  return new Redis({ url, token });
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function key(type: ActivityType) {
  return `stega:activity:${monthKey()}:${type}`;
}

export async function GET() {
  try {
    const redis = getRedis();
    const [visits, encodes, scans] = await Promise.all([
      redis.get<number>(key("visit")),
      redis.get<number>(key("encode")),
      redis.get<number>(key("scan")),
    ]);

    return NextResponse.json(
      { month: monthKey(), visits: visits ?? 0, encodes: encodes ?? 0, scans: scans ?? 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Activity data is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedis();
    const { type } = (await request.json()) as { type?: ActivityType };
    if (type !== "visit" && type !== "encode" && type !== "scan") {
      return NextResponse.json({ error: "Invalid activity type." }, { status: 400 });
    }

    const total = await redis.incr(key(type));
    return NextResponse.json({ total });
  } catch {
    return NextResponse.json({ error: "Activity could not be recorded." }, { status: 503 });
  }
}

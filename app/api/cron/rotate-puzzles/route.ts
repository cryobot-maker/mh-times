import { NextRequest, NextResponse } from "next/server";
import { getTodayString } from "@/lib/gameUtils";
import {
  getRotatedPuzzleForDate,
  PUZZLE_GAME_SLUGS,
} from "@/lib/puzzleService";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const authorized =
    cronSecret &&
    (secret === cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      request.headers.get("authorization") === `Bearer ${cronSecret}`);

  if (!cronSecret || !authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Could not create Supabase client" },
      { status: 503 }
    );
  }

  const today = getTodayString();
  const errors: string[] = [];

  for (const game of PUZZLE_GAME_SLUGS) {
    const puzzle_data = getRotatedPuzzleForDate(game, today);
    const { error } = await supabase.from("daily_puzzles").upsert(
      {
        game,
        puzzle_date: today,
        puzzle_data,
      },
      { onConflict: "game,puzzle_date" }
    );

    if (error) {
      errors.push(`${game}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        puzzlesUpdated: PUZZLE_GAME_SLUGS.length - errors.length,
        errors,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    puzzlesUpdated: PUZZLE_GAME_SLUGS.length,
    puzzle_date: today,
  });
}

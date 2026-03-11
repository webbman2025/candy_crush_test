import { NextResponse } from "next/server";

type UserInfo = {
  userId: string;
  score: number;
  level: number;
};

const parsePositiveInt = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "player-1";
  const score = parsePositiveInt(searchParams.get("score")) ?? Math.floor(Math.random() * 5001);
  const level = parsePositiveInt(searchParams.get("level")) ?? 1;

  const userInfo: UserInfo = {
    userId,
    score,
    level,
  };

  return NextResponse.json(userInfo);
}

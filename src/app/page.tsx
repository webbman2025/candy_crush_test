"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Game from "@/components/pages/game/Game";
import { gameConfig } from "@/config/gameConfig";

type UserInfo = {
  userId: string;
  score: number;
  level: number;
};

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [audioOn, setAudioOn] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [continuousCheckinCount, setContinuousCheckinCount] = useState(0);
  const [specialItemPoint, setSpecialItemPoint] = useState(0);
  const [tempSpecialItemPoint, setTempSpecialItemPoint] = useState(0);
  const [checkInToday, setCheckInToday] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Mock fetch function
  const fetchUserInfoScore = async () => {
    try {
      // Call the mock API route you’ll create in src/app/api/GamifyCandyCrushUserInfo/route.ts
      const response = await axios.get("/api/GamifyCandyCrushUserInfo");
      setUserInfo(response.data);
      setBestScore(response.data.score ?? 0);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfoScore();
  }, []);

  if (searchParams.get("page") === "game") {
    return (
      <div>
        <h1>Candy Crush Game</h1>
        {userInfo ? (
          <p>
            Welcome {userInfo.userId}, your score is {userInfo.score} and you’re on level{" "}
            {userInfo.level}.
          </p>
        ) : (
          <p>Loading user info...</p>
        )}
        <Game
          boardWidth={gameConfig.board.width}
          boardHeight={gameConfig.board.height}
          currentLevel={userInfo?.level ?? 1}
          timeLimit={gameConfig.time.limit}
          timeBonusPerMatch={gameConfig.time.bonusPerMatch}
          gamePointBaseMinimumScore={gameConfig.scoring.gamePointBaseMinimumScore}
          gamePointBase={gameConfig.scoring.gamePointBase}
          gamePointHighest={gameConfig.scoring.gamePointHighest}
          bestScore={bestScore}
          continuousCheckinCount={continuousCheckinCount}
          specialItemPoint={specialItemPoint}
          tempSpecialItemPoint={tempSpecialItemPoint}
          checkInToday={checkInToday}
          items={gameConfig.assets.items}
          pointsPerItem={gameConfig.scoring.pointsPerItem}
          bonusPointsPerExtraMatch={gameConfig.scoring.bonusPointsPerExtraMatch}
          comboMultipliers={gameConfig.combo.multipliers}
          comboPopupImages={gameConfig.assets.comboPopups}
          audioOn={audioOn}
          setAudioOn={setAudioOn}
          setBestScore={setBestScore}
          onBackToMenu={() => router.push("/")}
          fetchUserInfoScore={fetchUserInfoScore}
          setSpecialItemPoint={setSpecialItemPoint}
          setContinuousCheckinCount={setContinuousCheckinCount}
          setCheckInToday={setCheckInToday}
          setTempSpecialItemPoint={setTempSpecialItemPoint}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Landing Screen</h1>
      <p>Use ?page=game in the URL to play.</p>
    </div>
  );
}

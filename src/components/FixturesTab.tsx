import { useState, useEffect, useContext } from "react";
import type { FixtureRow } from "../utils/parse";
import { useStrengthCalculations } from "../hooks/useStrengthCalculations";
import type { StrengthType } from "../hooks/useStrengthCalculations";
import { StrengthControls } from "./StrengthControls";
import { GameweekControls } from "./GameweekControls";
import { FixturesTable } from "./FixturesTable";
import { Context } from "../context/Context.tsx";
import type { ContextType } from "../context/Context.tsx";
import "../styles/FixturesTab.css";

function FixturesTab({
  rows,
  homeAdvantage,
  startingGameweek,
  totalGameweeks,
}: {
  rows: FixtureRow[];
  homeAdvantage: number;
  startingGameweek: number;
  totalGameweeks: number;
}) {
  const context = useContext(Context) as ContextType;
  const { startGameweek, endGameweek, setStartGameweek, setEndGameweek } =
    context;

  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [gameweekCount, setGameweekCount] = useState(0);
  const [strengthType, setStrengthType] = useState<StrengthType>("combined");
  const [avgRange, setAvgRange] = useState(1);
  const [avgRangeInput, setAvgRangeInput] = useState<string | undefined>(
    undefined
  );

  // Use the custom hook for all strength calculations
  const { strengths, minStrength, maxStrength, medianStrength, error } =
    useStrengthCalculations(rows, homeAdvantage, strengthType, avgRange);

  // Simple effect just to set the fixture rows and gameweek count
  useEffect(() => {
    console.log("rows: ", rows);
    console.log("length: ", rows.length);
    setFixtureRows(rows);
    setGameweekCount(rows.length > 0 ? rows[0].fixtures.length : 0);
  }, [rows]);

  return (
    <>
      {error && <div className="error-message">Error: {error}</div>}

      <StrengthControls
        strengthType={strengthType}
        onStrengthTypeChange={setStrengthType}
      />

      <GameweekControls
        avgRange={avgRange}
        avgRangeInput={avgRangeInput}
        gameweekCount={gameweekCount}
        onAvgRangeChange={setAvgRange}
        onAvgRangeInputChange={setAvgRangeInput}
        totalGameweeks={totalGameweeks}
        startGameweek={startGameweek ?? startingGameweek}
        endGameweek={endGameweek ?? startingGameweek + gameweekCount - 1}
        onStartGameweekChange={setStartGameweek}
        onEndGameweekChange={setEndGameweek}
      />

      {!error && fixtureRows.length > 0 && (
        <FixturesTable
          fixtureRows={fixtureRows}
          gameweekCount={gameweekCount}
          avgRange={avgRange}
          strengths={strengths}
          homeAdvantage={homeAdvantage}
          minStrength={minStrength}
          maxStrength={maxStrength}
          medianStrength={medianStrength}
          startingGameweek={startingGameweek}
        />
      )}

      {!error && fixtureRows.length === 0 && <div>Loading fixtures...</div>}
    </>
  );
}

export default FixturesTab;

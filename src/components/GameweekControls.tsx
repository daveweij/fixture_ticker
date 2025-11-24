import { useState } from "react";

interface GameweekControlsProps {
  avgRange: number;
  avgRangeInput: string | undefined;
  gameweekCount: number;
  onAvgRangeChange: (range: number) => void;
  onAvgRangeInputChange: (input: string) => void;
  totalGameweeks: number;
  startGameweek: number;
  endGameweek: number;
  onStartGameweekChange: (gw: number) => void;
  onEndGameweekChange: (gw: number) => void;
}

export function GameweekControls({
  avgRange,
  avgRangeInput,
  gameweekCount,
  onAvgRangeChange,
  onAvgRangeInputChange,
  totalGameweeks,
  startGameweek,
  endGameweek,
  onStartGameweekChange,
  onEndGameweekChange,
}: GameweekControlsProps) {
  const [startGWInput, setStartGWInput] = useState<string | undefined>(
    undefined
  );
  const [endGWInput, setEndGWInput] = useState<string | undefined>(undefined);

  return (
    <div className="fixtures-controls">
      <div className="avg-range-group">
        <label htmlFor="avgRange" className="avg-range-label">
          Averaging range:
        </label>
        <input
          id="avgRange"
          type="number"
          min={1}
          max={gameweekCount}
          value={avgRangeInput ?? avgRange}
          className="avg-range-input"
          onBlur={(e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > gameweekCount) val = gameweekCount;
            onAvgRangeChange(val);
            onAvgRangeInputChange(val.toString());
          }}
          onChange={(e) => {
            onAvgRangeInputChange(e.target.value);
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= gameweekCount) {
              onAvgRangeChange(val);
            }
          }}
        />
      </div>
      <div className="gameweek-range-group">
        <label htmlFor="startGameweek" className="gameweek-range-label">
          Start GW:
        </label>
        <input
          id="startGameweek"
          type="number"
          min={1}
          max={totalGameweeks}
          value={startGWInput ?? startGameweek + 1}
          className="gameweek-range-input"
          onBlur={(e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > totalGameweeks) val = totalGameweeks;
            const newStart = val - 1;
            if (newStart > endGameweek) {
              onStartGameweekChange(endGameweek);
              setStartGWInput((endGameweek + 1).toString());
            } else {
              onStartGameweekChange(newStart);
              setStartGWInput(val.toString());
            }
          }}
          onChange={(e) => {
            setStartGWInput(e.target.value);
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= totalGameweeks) {
              const newStart = val - 1;
              if (newStart <= endGameweek) {
                onStartGameweekChange(newStart);
              }
            }
          }}
        />
        <label htmlFor="endGameweek" className="gameweek-range-label">
          End GW:
        </label>
        <input
          id="endGameweek"
          type="number"
          min={1}
          max={totalGameweeks}
          value={endGWInput ?? endGameweek + 1}
          className="gameweek-range-input"
          onBlur={(e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > totalGameweeks) val = totalGameweeks;
            const newEnd = val - 1;
            if (newEnd < startGameweek) {
              onEndGameweekChange(startGameweek);
              setEndGWInput((startGameweek + 1).toString());
            } else {
              onEndGameweekChange(newEnd);
              setEndGWInput(val.toString());
            }
          }}
          onChange={(e) => {
            setEndGWInput(e.target.value);
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= totalGameweeks) {
              const newEnd = val - 1;
              if (newEnd >= startGameweek) {
                onEndGameweekChange(newEnd);
              }
            }
          }}
        />
      </div>
    </div>
  );
}

import { useContext, useState, useEffect } from "react";
import type { FixtureRow } from './Parse.tsx';
import { Context } from './context/Context.tsx';
import type { ContextType } from './context/Context.tsx';
import './FixturesTab.css';

function getColor(value: number, min: number, max: number, median: number): string {
  // Diverging colormap: green (easy) -> white (average) -> red (hard)
  if (value <= median) {
    // Green to white
    // percent: 0 (green) to 0.5 (white)
    // const p = percent / 0.5;
    // const r = Math.round(255 * p);
    // const b = Math.round(100 * (1 - p) + 255 * p); // from 100 to 255
    // return `rgb(${r},255,${b})`;
    const p = (value - min) / (median - min);
    const r = Math.round(255 * p);
    const b = Math.round(100 * (1 - p) + 255 * p);
    return `rgb(${r},255,${b})`;
  } else {
    // White to red
    // percent: 0.5 (white) to 1 (red)
    const p = (value - median) / (max - median);
    const g = Math.round(255 * (1 - p));
    const b = Math.round(255 * (1 - p) + 100 * p); // from 255 to 100
    return `rgb(255,${g},${b})`;
  }
}

function FixturesTab({ rows, homeAdvantage }: { rows: FixtureRow[]; homeAdvantage: number }) {
  const context = useContext(Context) as ContextType;
  const { teamStrengths, editedStrengths } = context;

  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [gameweekCount, setGameweekCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [strengths, setStrengths] = useState<Record<string, number>>({});
  const [minStrength, setMinStrength] = useState(0);
  const [maxStrength, setMaxStrength] = useState(0);
  const [medianStrength, setMedianStrength] = useState(0);
  const [strengthType, setStrengthType] = useState<'attack' | 'defense' | 'combined'>('combined');
  const [avgRange, setAvgRange] = useState(1);
  const [avgRangeInput, setAvgRangeInput] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      console.log('rows: ', rows);
      console.log('length: ', rows.length);
      setFixtureRows(rows);
      setGameweekCount(rows.length > 0 ? rows[0].fixtures.length : 0);
      const strengthsMap: Record<string, number> = {};

      // If user has edited strengths, use those for calculations
      const strengthsToUse = teamStrengths.map((s: typeof teamStrengths[number]) => {
        const edit = editedStrengths[s.team];
        return edit ? { ...s, ...edit } : s;
      });

      console.log('Using strengths:', strengthsToUse);
      // For color range: if avgRange > 1, calculate all possible averages for all teams
      let colorValues: number[] = [];
      if (avgRange > 1 && rows.length > 0) {
        for (const row of rows) {
          for (let i = 0; i < row.fixtures.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = i; j < Math.min(i + avgRange, row.fixtures.length); j++) {
              const opp = row.fixtures[j].trim();
              const oppKey = opp.toUpperCase();
              let value: number | null = null;
              const teamObj = strengthsToUse.find((t: typeof strengthsToUse[number]) => t.team.toUpperCase() === oppKey);
              if (teamObj) {
                if (strengthType === 'attack') value = teamObj.attack;
                else if (strengthType === 'defense') value = -1 * teamObj.defense;
                else value = teamObj.attack - teamObj.defense;
                if (opp === oppKey && value !== undefined) {
                  value -= homeAdvantage;
                }
                if (value !== undefined) {
                  sum += value;
                  count++;
                }
              }
            }
            if (count > 0) colorValues.push(sum / count);
          }
        }
      } else {
        // Default: use single fixture values
        const strengthArray: Array<[string, number]> = strengthsToUse.map((s: typeof strengthsToUse[number]) => {
          if (strengthType === 'attack') return [s.team, s.attack];
          if (strengthType === 'defense') return [s.team, -1 * s.defense];
          // average
          return [s.team, s.attack - s.defense];
        });
        const awayValues = strengthArray.map(([, strength]) => strength);
        const homeValues = strengthArray.map(([, strength]) => strength - homeAdvantage);
        colorValues = [...awayValues, ...homeValues];
      }
      colorValues.sort((a, b) => a - b);

      strengthsToUse.forEach((s: typeof strengthsToUse[number]) => {
        let value: number;
        if (strengthType === 'attack') value = s.attack;
        else if (strengthType === 'defense') value = -1 * s.defense;
        else value = s.attack - s.defense;
        strengthsMap[s.team.toUpperCase()] = value;
      });

      const percentile = (arr: number[], p: number) => {
        if (!arr.length) return 0;
        const idx = (arr.length - 1) * p;
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        if (upper === lower) return arr[lower];
        return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
      };

      setMinStrength(percentile(colorValues, 0.05));
      setMaxStrength(percentile(colorValues, 0.95));
      setMedianStrength(percentile(colorValues, 0.5));
      setStrengths(strengthsMap);
      // Do NOT call setTeamStrengths here, as it causes a loop
    } catch (err) {
      setError((err instanceof Error ? err.message : String(err)));
    }
  }, [avgRange, strengthType, teamStrengths, editedStrengths, rows, homeAdvantage]);

  return (
    <>
      {error && <div className="error-message">Error: {error}</div>}
      <div className="fixtures-controls">
        <label className="control-label">
          <input
            type="radio"
            name="strengthType"
            value="combined"
            checked={strengthType === 'combined'}
            onChange={() => setStrengthType('combined')}
          />
          Combined (Attack - Defense)
        </label>
        <label className="control-label">
          <input
            type="radio"
            name="strengthType"
            value="attack"
            checked={strengthType === 'attack'}
            onChange={() => setStrengthType('attack')}
          />
          Defense
        </label>
        <label className="control-label">
          <input
            type="radio"
            name="strengthType"
            value="defense"
            checked={strengthType === 'defense'}
            onChange={() => setStrengthType('defense')}
          />
          Attack
        </label>
        <div className="avg-range-group">
          <label htmlFor="avgRange" className="avg-range-label">Averaging range:</label>
          <input
            id="avgRange"
            type="number"
            min={1}
            max={gameweekCount}
            value={avgRangeInput ?? avgRange}
            className="avg-range-input"
            onBlur={e => {
              let val = parseInt(e.target.value);
              if (isNaN(val) || val < 1) val = 1;
              if (val > gameweekCount) val = gameweekCount;
              setAvgRange(val);
              setAvgRangeInput(val.toString());
            }}
            onChange={e => {
              setAvgRangeInput(e.target.value);
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= gameweekCount) {
                setAvgRange(val);
              }
            }}
          />
        </div>
      </div>
      {!error && fixtureRows.length > 0 && (
        <table className="fixtures-table">
          <thead>
            <tr>
              <th className="fixtures-th">Team</th>
              {Array.from({length: gameweekCount}, (_, i) => (
                <th key={i} className="fixtures-th-number">{i+1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fixtureRows.map(row => (
              <tr key={row.team}>
                <td className="fixtures-td-team">{row.team}</td>
                {row.fixtures.map((fixture, i) => {
                  // Average over next avgRange matches
                  let avgValue = null;
                  let count = 0;
                  let sum = 0;
                  for (let j = i; j < Math.min(i + avgRange, row.fixtures.length); j++) {
                    const opp = row.fixtures[j].trim();
                    const oppKey = opp.toUpperCase();
                    let value = strengths[oppKey];
                    if (opp === oppKey && value !== undefined) {
                      value -= homeAdvantage;
                    }
                    if (value !== undefined) {
                      sum += value;
                      count++;
                    }
                  }
                  if (count > 0) avgValue = sum / count;
                  const color = (avgValue !== null)
                    ? getColor(avgValue, minStrength, maxStrength, medianStrength)
                    : '#fff';
                  return (
                    <td key={i} className="fixtures-td" style={{ background: color }}>{fixture}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!error && fixtureRows.length === 0 && <div>Loading fixtures...</div>}
    </>
  );
}

export default FixturesTab;

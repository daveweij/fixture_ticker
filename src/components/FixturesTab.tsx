import { useContext, useState, useEffect } from "react";
import type { FixtureRow } from '../utils/parse';
import { Context } from '../context/Context.tsx';
import type { ContextType } from '../context/Context.tsx';
import { percentile } from '../utils/colorUtils';
import { StrengthControls } from './StrengthControls';
import { FixturesTable } from './FixturesTable';
import '../styles/FixturesTab.css';

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
      
      <StrengthControls
        strengthType={strengthType}
        onStrengthTypeChange={setStrengthType}
        avgRange={avgRange}
        avgRangeInput={avgRangeInput}
        gameweekCount={gameweekCount}
        onAvgRangeChange={setAvgRange}
        onAvgRangeInputChange={setAvgRangeInput}
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
        />
      )}
      
      {!error && fixtureRows.length === 0 && <div>Loading fixtures...</div>}
    </>
  );
}

export default FixturesTab;

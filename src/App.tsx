import { useEffect, useState } from 'react';
import './App.css';
import fixturesCSV from './assets/fixtures_by_team.csv?raw';
import strengthsCSV from './assets/team_strengths.csv?raw';


type FixtureRow = {
  team: string;
  fixtures: string[];
};
type TeamStrength = {
  team: string;
  attack: number;
  defense: number;
};


function parseFixturesCSV(csv: string): FixtureRow[] {
  const lines = csv.trim().split(/\r?\n/);
  return lines.map(line => {
    const cells = line.split(',');
      return {
        team: cells[0],
        fixtures: cells.slice(1),
      };
    });
  }

function parseStrengthsCSV(csv: string): { strengths: TeamStrength[]; homeAdvantage: number } {
  const lines = csv.trim().split(/\r?\n/);
  let homeAdvantage = 0;
  const strengths: TeamStrength[] = [];
  lines.slice(1).forEach(line => {
    if (!line) return;
    const cells = line.split(',');
    if (cells[0] === 'home_advantage') {
      homeAdvantage = parseFloat(cells[1]);
    } else {
      strengths.push({
        team: cells[0],
        attack: Math.round(parseFloat(cells[1]) * 100) / 100,
        defense: Math.round(parseFloat(cells[2]) * 100) / 100,
      });
    }
  });
  return { strengths, homeAdvantage };
}


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

function App() {
  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [gameweekCount, setGameweekCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [strengths, setStrengths] = useState<Record<string, number>>({});
  const [minStrength, setMinStrength] = useState(0);
  const [maxStrength, setMaxStrength] = useState(0);
  const [medianStrength, setMedianStrength] = useState(0);
  const [strengthType, setStrengthType] = useState<'attack' | 'defense' | 'combined'>('combined');
  const [homeAdvantage, setHomeAdvantage] = useState(0);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'strengths'>('fixtures');
  const [teamStrengths, setTeamStrengths] = useState<TeamStrength[]>([]);
  const [editedStrengths, setEditedStrengths] = useState<Record<string, {attack: number; defense: number}>>({});
  const [inputValues, setInputValues] = useState<Record<string, {attack?: string; defense?: string}>>({});
  const [avgRange, setAvgRange] = useState(1);
  const [avgRangeInput, setAvgRangeInput] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const fixturesText = fixturesCSV;
      const strengthsText = strengthsCSV;
      const rows = parseFixturesCSV(fixturesText);
      setFixtureRows(rows);
      setGameweekCount(rows.length > 0 ? rows[0].fixtures.length : 0);
      const strengthsMap: Record<string, number> = {};
      const { strengths: strengthsArr, homeAdvantage } = parseStrengthsCSV(strengthsText);

      // If user has edited strengths, use those for calculations
      const strengthsToUse = strengthsArr.map(s => {
        const edit = editedStrengths[s.team];
        return edit ? { ...s, ...edit } : s;
      });

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
              let value = null;
              const teamObj = strengthsToUse.find(t => t.team.toUpperCase() === oppKey);
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
        const strengthArray: Array<[string, number]> = strengthsToUse.map(s => {
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

      // strengthsMap for fixture lookup
      strengthsToUse.forEach(s => {
        let value;
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
      setHomeAdvantage(homeAdvantage);
      setTeamStrengths(strengthsToUse);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }, [strengthType, editedStrengths, avgRange]);

  return (
    <div className="App">
      {error && <div className="error-message">Error: {error}</div>}
      
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button 
          onClick={() => setActiveTab('fixtures')}
          className={activeTab === 'fixtures' ? 'tab-btn active' : 'tab-btn'}
        >
          Fixtures
        </button>
        <button 
          onClick={() => setActiveTab('strengths')}
          className={activeTab === 'strengths' ? 'tab-btn active' : 'tab-btn'}
        >
          Team Strengths
        </button>
      </div>

      {activeTab === 'fixtures' && (
        <>
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
            <table style={{borderCollapse: 'collapse', width: '100%'}}>
              <thead>
                <tr>
                  <th style={{border: '1px solid #ccc', padding: '4px', textAlign: 'left'}}>Team</th>
                  {Array.from({length: gameweekCount}, (_, i) => (
                    <th key={i} style={{border: '1px solid #ccc', padding: '4px'}}>{i+1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fixtureRows.map(row => (
                  <tr key={row.team}>
                    <td style={{border: '1px solid #ccc', padding: '4px', fontWeight: 'bold', textAlign: 'left'}}>{row.team}</td>
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
                        <td key={i} style={{border: '1px solid #ccc', padding: '4px', background: color}}>{fixture}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!error && fixtureRows.length === 0 && <div>Loading fixtures...</div>}
        </>
      )}

      {activeTab === 'strengths' && (
        <>
          <h2>Team Attack and Defense Strengths</h2>
          {teamStrengths.length > 0 && (
            <table className="strengths-table">
              <thead>
                <tr className="strengths-header-row">
                  <th className="strengths-header">Team</th>
                  <th className="strengths-header">Attack</th>
                  <th className="strengths-header">Defense</th>
                  <th className="strengths-header">Difference</th>
                </tr>
              </thead>
              <tbody>
                {teamStrengths
                  .sort((a, b) => (b.attack - b.defense) - (a.attack - a.defense))
                  .map(team => (
                    <tr key={team.team} className="strengths-row">
                      <td className="strengths-team">{team.team}</td>
                      <td className="strengths-cell">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          value={inputValues[team.team]?.attack ?? (editedStrengths[team.team]?.attack ?? team.attack)}
                          className="strengths-input attack"
                          onFocus={e => e.target.classList.add('focus')}
                          onBlur={e => e.target.classList.remove('focus')}
                          onChange={e => {
                            setInputValues(prev => ({
                              ...prev,
                              [team.team]: {
                                attack: e.target.value,
                                defense: prev[team.team]?.defense ?? undefined
                              }
                            }));
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setEditedStrengths(prev => ({
                                ...prev,
                                [team.team]: {
                                  attack: Math.round(val * 100) / 100,
                                  defense: prev[team.team]?.defense ?? team.defense
                                }
                              }));
                            }
                          }}
                        />
                      </td>
                      <td className="strengths-cell">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          value={inputValues[team.team]?.defense ?? (editedStrengths[team.team]?.defense ?? team.defense)}
                          className="strengths-input defense"
                          onFocus={e => e.target.classList.add('focus')}
                          onBlur={e => e.target.classList.remove('focus')}
                          onChange={e => {
                            setInputValues(prev => ({
                              ...prev,
                              [team.team]: {
                                attack: prev[team.team]?.attack ?? undefined,
                                defense: e.target.value
                              }
                            }));
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setEditedStrengths(prev => ({
                                ...prev,
                                [team.team]: {
                                  attack: prev[team.team]?.attack ?? team.attack,
                                  defense: Math.round(val * 100) / 100
                                }
                              }));
                            }
                          }}
                        />
                      </td>
                      <td className="strengths-diff">
                        {(
                          (editedStrengths[team.team]?.attack ?? team.attack)
                          - (editedStrengths[team.team]?.defense ?? team.defense)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;

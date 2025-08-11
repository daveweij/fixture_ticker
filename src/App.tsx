import { useEffect, useState } from 'react';
import './App.css';


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
        attack: parseFloat(cells[1]),
        defense: parseFloat(cells[2]),
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
  const [strengthType, setStrengthType] = useState<'attack' | 'defense' | 'average'>('attack');
  const [homeAdvantage, setHomeAdvantage] = useState(0);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'strengths'>('fixtures');
  const [teamStrengths, setTeamStrengths] = useState<TeamStrength[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('src/assets/fixtures_by_team.csv').then(res => {
        if (!res.ok) throw new Error('Failed to load fixtures CSV');
        return res.text();
      }),
      fetch('src/assets/team_strengths.csv').then(res => {
        if (!res.ok) throw new Error('Failed to load strengths CSV');
        return res.text();
      })
    ])
    .then(([fixturesText, strengthsText]) => {
      const rows = parseFixturesCSV(fixturesText);
      setFixtureRows(rows);
      setGameweekCount(rows.length > 0 ? rows[0].fixtures.length : 0);
      const strengthsMap: Record<string, number> = {};
      const { strengths: strengthsArr, homeAdvantage } = parseStrengthsCSV(strengthsText);

      const strengthArray: Array<[string, number]> = strengthsArr.map(s => {
        if (strengthType === 'attack') return [s.team, s.attack];
        if (strengthType === 'defense') return [s.team, -1 * s.defense];
        // average
        return [s.team, s.attack - s.defense];
      });
      const awayValues = strengthArray.map(([, strength]) => strength);
      // add strengths minus home advantage to the array
      const homeValues = strengthArray.map(([, strength]) => strength - homeAdvantage);
      const allValues = [...awayValues, ...homeValues].sort((a, b) => a - b);
    

      strengthArray.forEach(([team, strength]) => {
        strengthsMap[team.toUpperCase()] = strength;
      });

      const percentile = (arr: number[], p: number) => {
        const idx = (arr.length - 1) * p;
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        if (upper === lower) return arr[lower];
        return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
      };

      setMinStrength(percentile(allValues, 0.05));
      setMaxStrength(percentile(allValues, 0.95));
      setMedianStrength(percentile(allValues, 0.5));
      setStrengths(strengthsMap);
      setHomeAdvantage(homeAdvantage);
      setTeamStrengths(strengthsArr);
    })
    .catch(err => setError(err.message));
  }, [strengthType]);

  return (
    <div className="App">
      <h1>Fixture Ticker</h1>
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      
      {/* Tab Navigation */}
      <div style={{marginBottom: '1em', display: 'flex', gap: '1em', alignItems: 'center'}}>
        <button 
          onClick={() => setActiveTab('fixtures')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            background: activeTab === 'fixtures' ? '#007acc' : '#fff',
            color: activeTab === 'fixtures' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          Fixtures
        </button>
        <button 
          onClick={() => setActiveTab('strengths')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            background: activeTab === 'strengths' ? '#007acc' : '#fff',
            color: activeTab === 'strengths' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          Team Strengths
        </button>
      </div>

      {activeTab === 'fixtures' && (
        <>
          <div style={{marginBottom: '1em', display: 'flex', gap: '1.5em', alignItems: 'center'}}>
            <label style={{marginLeft: '1em'}}>
              <input
                type="radio"
                name="strengthType"
                value="average"
                checked={strengthType === 'average'}
                onChange={() => setStrengthType('average')}
              />
              Average (Attack - Defense)
            </label>
            <label>
              <input
                type="radio"
                name="strengthType"
                value="Defense"
                checked={strengthType === 'attack'}
                onChange={() => setStrengthType('attack')}
              />
              Attack
            </label>
            <label style={{marginLeft: '1em'}}>
              <input
                type="radio"
                name="strengthType"
                value="Attack"
                checked={strengthType === 'defense'}
                onChange={() => setStrengthType('defense')}
              />
              Defense
            </label>
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
                      const opp = fixture.trim();
                      const oppKey = opp.toUpperCase();
                      let value;
                      value = strengths[oppKey];
                      if (opp === oppKey && value !== undefined) {
                        value -= homeAdvantage;
                      }
                      const color = (value !== undefined)
                        ? getColor(value, minStrength, maxStrength, medianStrength)
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
            <table style={{borderCollapse: 'collapse', width: '100%', maxWidth: '600px'}}>
              <thead>
                <tr>
                  <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'left'}}>Team</th>
                  <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>Attack</th>
                  <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>Defense</th>
                  <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>Difference</th>
                </tr>
              </thead>
              <tbody>
                {teamStrengths
                  .sort((a, b) => (b.attack - b.defense) - (a.attack - a.defense))
                  .map(team => (
                    <tr key={team.team}>
                      <td style={{border: '1px solid #ccc', padding: '8px', fontWeight: 'bold'}}>{team.team}</td>
                      <td style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>{team.attack.toFixed(2)}</td>
                      <td style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>{team.defense.toFixed(2)}</td>
                      <td style={{border: '1px solid #ccc', padding: '8px', textAlign: 'center'}}>{(team.attack - team.defense).toFixed(2)}</td>
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

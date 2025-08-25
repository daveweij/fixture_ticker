import { useEffect, useState, useContext, use } from 'react';
import { Context } from './Context.tsx';
import { parseFixturesCSV, parseStrengthsCSV } from './Parse.tsx';
import type { FixtureRow } from './Parse.tsx';
import './App.css';
import StrengthTab from './StrengthTab.tsx';
import FixturesTab from './FixturesTab.tsx';
import fixturesCSV from './assets/fixtures_by_team.csv?raw';
import strengthsCSV from './assets/team_strengths.csv?raw';


function App() {
  // const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [homeAdvantage, setHomeAdvantage] = useState(0);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'strengths'>('fixtures');
  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [homeAdvantage, setHomeAdvantage] = useState(0);
  const { teamStrengths, setTeamStrengths, editedStrengths, setEditedStrengths } = useContext(Context);

  // You should still use useEffect with an empty dependency array to run this only once on mount.
  useEffect(() => {
    try {
      const fixturesText = fixturesCSV;
      const strengthsText = strengthsCSV;
      const fixtureRows = parseFixturesCSV(fixturesText);
      setFixtureRows(fixtureRows);

      const { strengths, homeAdvantage } = parseStrengthsCSV(strengthsText);
      setHomeAdvantage(homeAdvantage);
      setTeamStrengths(strengths);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  
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
        <FixturesTab rows={fixtureRows} homeAdvantage={homeAdvantage} />
      )}

      {activeTab === 'strengths' && (
        <StrengthTab />
      )}
    </div>
  );
}

export default App;

import { useState } from 'react';
import { useDataLoader } from './hooks/useDataLoader';
import './styles/App.css';
import StrengthTab from './components/StrengthTab.tsx';
import FixturesTab from './components/FixturesTab.tsx';


function App() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'strengths'>('fixtures');
  
  // Use the data loading hook
  const { fixtureRows, homeAdvantage, error, isLoading } = useDataLoader();
  
  if (isLoading) {
    return (
      <div className="App">
        <div>Loading data...</div>
      </div>
    );
  }

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

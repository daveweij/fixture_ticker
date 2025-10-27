import { useContext, useState, useRef } from "react";
import { Context } from '../context/Context.tsx';
import type { ContextType, TeamStrength } from '../context/Context.tsx';
import { exportStrengthsToCSV, downloadStrengthsFile, readStrengthsFile } from '../utils/strengthsIO';
import { parseStrengthsCSV } from '../utils/parse';


function StrengthTab() {
  const context = useContext(Context) as ContextType;
  const { teamStrengths, editedStrengths, setEditedStrengths, homeAdvantage, setHomeAdvantage } = context;
  const [inputValues, setInputValues] = useState<Record<string, { attack?: string; defense?: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const csvContent = exportStrengthsToCSV(teamStrengths, editedStrengths, homeAdvantage);
    await downloadStrengthsFile(csvContent);
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await readStrengthsFile(file);
        const { strengths, homeAdvantage: loadedHomeAdvantage } = parseStrengthsCSV(content);
        
        // Convert strengths array to editedStrengths record format
        const loadedStrengths: Record<string, { attack: number; defense: number }> = {};
        strengths.forEach(team => {
          loadedStrengths[team.team] = { attack: team.attack, defense: team.defense };
        });
        
        setEditedStrengths(loadedStrengths);
        setHomeAdvantage(loadedHomeAdvantage);
        setInputValues({}); // Clear input values to show loaded data
      } catch (error) {
        console.error('Failed to load strengths file:', error);
        alert('Failed to load strengths file. Please check the file format.');
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <h2>Team Attack and Defense Strengths</h2>
      <div className="strengths-controls">
        <button onClick={handleSave} className="btn-save">
          Save Strengths
        </button>
        <button onClick={handleLoadClick} className="btn-load">
          Load Strengths
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".fixture_strengths"
          onChange={handleLoad}
          style={{ display: 'none' }}
        />
      </div>
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
            {(teamStrengths as TeamStrength[])
              .sort((a: TeamStrength, b: TeamStrength) => (b.attack - b.defense) - (a.attack - a.defense))
              .map((team: TeamStrength) => (
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
                        setInputValues((prev: Record<string, { attack?: string; defense?: string }>) => ({
                          ...prev,
                          [team.team]: {
                            attack: e.target.value,
                            defense: prev[team.team]?.defense ?? undefined
                          }
                        }));
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setEditedStrengths((prev: Record<string, { attack: number; defense: number }>) => ({
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
                        setInputValues((prev: Record<string, { attack?: string; defense?: string }>) => ({
                          ...prev,
                          [team.team]: {
                            attack: prev[team.team]?.attack ?? undefined,
                            defense: e.target.value
                          }
                        }));
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setEditedStrengths((prev: Record<string, { attack: number; defense: number }>) => ({
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
  );
}

export default StrengthTab;

import { useContext, useState } from "react";
import { Context } from './context/Context.tsx';
import type { ContextType, TeamStrength } from './context/Context.tsx';


// const StrengthTab: React.FC<FixturesTabProps> = () => (
function StrengthTab() {
  const context = useContext(Context) as ContextType;
  const { teamStrengths, editedStrengths, setEditedStrengths } = context;
  const [inputValues, setInputValues] = useState<Record<string, {attack?: string; defense?: string}>>({});

  return (
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
                      setInputValues((prev: Record<string, {attack?: string; defense?: string}>) => ({
                        ...prev,
                        [team.team]: {
                          attack: e.target.value,
                          defense: prev[team.team]?.defense ?? undefined
                        }
                      }));
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setEditedStrengths((prev: Record<string, {attack: number; defense: number}>) => ({
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
                      setInputValues((prev: Record<string, {attack?: string; defense?: string}>) => ({
                        ...prev,
                        [team.team]: {
                          attack: prev[team.team]?.attack ?? undefined,
                          defense: e.target.value
                        }
                      }));
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setEditedStrengths((prev: Record<string, {attack: number; defense: number}>) => ({
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

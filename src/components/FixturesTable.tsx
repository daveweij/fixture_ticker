import type { FixtureRow } from '../utils/parse';
import { getColor } from '../utils/colorUtils';

interface FixturesTableProps {
  fixtureRows: FixtureRow[];
  gameweekCount: number;
  avgRange: number;
  strengths: Record<string, number>;
  homeAdvantage: number;
  minStrength: number;
  maxStrength: number;
  medianStrength: number;
}

export function FixturesTable({
  fixtureRows,
  gameweekCount,
  avgRange,
  strengths,
  homeAdvantage,
  minStrength,
  maxStrength,
  medianStrength
}: FixturesTableProps) {
  return (
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
  );
}
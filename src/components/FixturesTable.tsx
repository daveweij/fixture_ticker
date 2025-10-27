import { useState, useMemo, useCallback } from 'react';
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

type SortConfig = {
  gameweek: number | null;
  direction: 'asc' | 'desc';
};

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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ gameweek: null, direction: 'asc' });

  // Function to calculate FDR for a team at a specific gameweek
  const calculateFDR = useCallback((row: FixtureRow, gameweek: number): number | null => {
    let sum = 0;
    let count = 0;

    for (let j = gameweek; j < Math.min(gameweek + avgRange, row.fixtures.length); j++) {
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

    return count > 0 ? sum / count : null;
  }, [avgRange, strengths, homeAdvantage]);

  // Sort the fixture rows based on current sort configuration
  const sortedRows = useMemo(() => {
    if (sortConfig.gameweek === null) {
      return fixtureRows;
    }

    const sorted = [...fixtureRows].sort((a, b) => {
      const fdrA = calculateFDR(a, sortConfig.gameweek!);
      const fdrB = calculateFDR(b, sortConfig.gameweek!);

      // Handle null values (put them at the end)
      if (fdrA === null && fdrB === null) return 0;
      if (fdrA === null) return 1;
      if (fdrB === null) return -1;

      const comparison = fdrA - fdrB;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [fixtureRows, sortConfig, calculateFDR]);

  const handleSort = (gameweek: number) => {
    setSortConfig(prev => {
      if (prev.gameweek === gameweek) {
        // Toggle direction if clicking the same column
        return { gameweek, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        // Default to ascending when clicking a new column
        return { gameweek, direction: 'asc' };
      }
    });
  };

  return (
    <table className="fixtures-table">
      <thead>
        <tr>
          <th className="fixtures-th">Team</th>
          {Array.from({ length: gameweekCount }, (_, i) => (
            <th
              key={i}
              className="fixtures-th-number"
              onClick={() => handleSort(i)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title={`Sort by gameweek ${i + 1} FDR`}
            >
              {i + 1}
              {sortConfig.gameweek === i && (
                <span style={{ marginLeft: '4px' }}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map(row => (
          <tr key={row.team}>
            <td className="fixtures-td-team">{row.team}</td>
            {row.fixtures.map((fixture, i) => {
              // Average over next avgRange matches
              const avgValue = calculateFDR(row, i);
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
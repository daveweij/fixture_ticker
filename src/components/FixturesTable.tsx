import { useState, useMemo, useCallback } from "react";
import type { FixtureRow } from "../utils/parse";
import { getColor } from "../utils/colorUtils";

interface FixturesTableProps {
  fixtureRows: FixtureRow[];
  gameweekCount: number;
  avgRange: number;
  strengths: Record<string, number>;
  homeAdvantage: number;
  minStrength: number;
  maxStrength: number;
  medianStrength: number;
  startingGameweek: number;
}

type SortConfig = {
  gameweek: number | "avg" | null;
  direction: "asc" | "desc";
};

export function FixturesTable({
  fixtureRows,
  gameweekCount,
  avgRange,
  strengths,
  homeAdvantage,
  minStrength,
  maxStrength,
  medianStrength,
  startingGameweek,
}: FixturesTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    gameweek: null,
    direction: "asc",
  });

  const getFixtureStrength = useCallback(
    (row: FixtureRow, index: number): number | null => {
      if (index < 0 || index >= row.fixtures.length) {
        return null;
      }

      const opp = row.fixtures[index].trim();
      if (!opp) {
        return null;
      }

      const oppKey = opp.toUpperCase();
      let value = strengths[oppKey];

      if (value === undefined) {
        return null;
      }

      if (opp === oppKey) {
        value = value - homeAdvantage;
      }

      return value;
    },
    [strengths, homeAdvantage]
  );

  // Function to calculate FDR for a team at a specific gameweek
  const calculateFDR = useCallback(
    (row: FixtureRow, gameweek: number): number | null => {
      let sum = 0;
      let count = 0;

      for (
        let j = gameweek;
        j < Math.min(gameweek + avgRange, row.fixtures.length);
        j++
      ) {
        const value = getFixtureStrength(row, j);

        if (value !== null) {
          sum += value;
          count++;
        }
      }

      return count > 0 ? sum / count : null;
    },
    [avgRange, getFixtureStrength]
  );

  const calculateAvgFDR = useCallback(
    (row: FixtureRow): number | null => {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < row.fixtures.length; i++) {
        const value = getFixtureStrength(row, i);
        if (value !== null) {
          sum += value;
          count++;
        }
      }

      return count > 0 ? sum / count : null;
    },
    [getFixtureStrength]
  );

  // Sort the fixture rows based on current sort configuration
  const sortedRows = useMemo(() => {
    if (sortConfig.gameweek === null) {
      return fixtureRows;
    }

    const sorted = [...fixtureRows].sort((a, b) => {
      let fdrA: number | null;
      let fdrB: number | null;

      if (sortConfig.gameweek === "avg") {
        fdrA = calculateAvgFDR(a);
        fdrB = calculateAvgFDR(b);
      } else {
        const gwIndex = sortConfig.gameweek as number;
        fdrA = calculateFDR(a, gwIndex);
        fdrB = calculateFDR(b, gwIndex);
      }

      // Handle null values (put them at the end)
      if (fdrA === null && fdrB === null) return 0;
      if (fdrA === null) return 1;
      if (fdrB === null) return -1;

      const comparison = fdrA - fdrB;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [fixtureRows, sortConfig, calculateFDR, calculateAvgFDR]);

  const handleSort = (gameweek: number | "avg") => {
    setSortConfig((prev) => {
      if (prev.gameweek === gameweek) {
        // Toggle direction if clicking the same column
        return {
          gameweek,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Default to ascending when clicking a new column
        return { gameweek, direction: "asc" };
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
              style={{ cursor: "pointer", userSelect: "none" }}
              title={`Sort by gameweek ${startingGameweek + i + 1} FDR`}
            >
              {startingGameweek + i + 1}
              {sortConfig.gameweek === i && (
                <span style={{ marginLeft: "4px" }}>
                  {sortConfig.direction === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>
          ))}
          <th
            className="fixtures-th-number"
            onClick={() => handleSort("avg")}
            style={{ cursor: "pointer", userSelect: "none" }}
            title="Sort by average FDR across visible gameweeks"
          >
            Avg FDR
            {sortConfig.gameweek === "avg" && (
              <span style={{ marginLeft: "4px" }}>
                {sortConfig.direction === "asc" ? "▲" : "▼"}
              </span>
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => {
          const avgFDR = calculateAvgFDR(row);
          const avgColor =
            avgFDR !== null
              ? getColor(avgFDR, minStrength, maxStrength, medianStrength)
              : "#fff";

          return (
            <tr key={row.team}>
              <td className="fixtures-td-team">{row.team}</td>
              {row.fixtures.map((fixture, i) => {
                // Average over next avgRange matches
                const avgValue = calculateFDR(row, i);
                const color =
                  avgValue !== null
                    ? getColor(
                        avgValue,
                        minStrength,
                        maxStrength,
                        medianStrength
                      )
                    : "#fff";
                return (
                  <td
                    key={i}
                    className="fixtures-td"
                    style={{ background: color }}
                  >
                    {fixture}
                  </td>
                );
              })}
              <td
                className="fixtures-td"
                style={{ background: avgColor, fontWeight: "bold" }}
              >
                {avgFDR !== null ? avgFDR.toFixed(2) : "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import { useState, useEffect, useContext } from "react";
import { Context } from "../context/Context.tsx";
import type { ContextType } from "../context/Context.tsx";
import {
  parseFixturesCSV,
  parseStrengthsCSV,
  parseGameweekDatesCSV,
  getStartingGameweek,
} from "../utils/parse";
import type { FixtureRow } from "../utils/parse";
import fixturesCSV from "../assets/fixtures_by_team.csv?raw";
import strengthsCSV from "../assets/team_strengths.csv?raw";
import gameweekDatesCSV from "../assets/gameweek_dates.csv?raw";

interface DataLoadingResult {
  fixtureRows: FixtureRow[];
  homeAdvantage: number;
  error: string | null;
  isLoading: boolean;
  startingGameweek: number;
  totalGameweeks: number;
  defaultStartGameweek: number;
  defaultEndGameweek: number;
}

/**
 * Custom hook to handle loading and parsing of CSV data
 */
export function useDataLoader(): DataLoadingResult {
  const context = useContext(Context) as ContextType;
  const {
    setTeamStrengths,
    setHomeAdvantage,
    homeAdvantage,
    startGameweek: manualStartGW,
    endGameweek: manualEndGW,
    setStartGameweek,
    setEndGameweek,
  } = context;

  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingGameweek, setStartingGameweek] = useState(0);
  const [totalGameweeks, setTotalGameweeks] = useState(0);
  const [defaultStartGameweek, setDefaultStartGameweek] = useState(0);
  const [defaultEndGameweek, setDefaultEndGameweek] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse gameweek dates CSV
        const gameweekDatesText = gameweekDatesCSV;
        const gameweekDates = parseGameweekDatesCSV(gameweekDatesText);
        const startGW = getStartingGameweek(gameweekDates);

        // Parse fixtures CSV
        const fixturesText = fixturesCSV;
        const parsedFixtureRows = parseFixturesCSV(fixturesText);
        const totalGW =
          parsedFixtureRows.length > 0
            ? parsedFixtureRows[0].fixtures.length
            : 0;
        setTotalGameweeks(totalGW);

        // Set defaults if not already set in context
        const defaultStart = startGW;
        const defaultEnd = totalGW - 1;
        setDefaultStartGameweek(defaultStart);
        setDefaultEndGameweek(defaultEnd);

        if (manualStartGW === null) {
          setStartGameweek(defaultStart);
        }
        if (manualEndGW === null) {
          setEndGameweek(defaultEnd);
        }

        // Use manual values if set, otherwise use defaults
        const actualStartGW =
          manualStartGW !== null ? manualStartGW : defaultStart;
        const actualEndGW = manualEndGW !== null ? manualEndGW : defaultEnd;

        // Filter fixtures to only show the selected range
        const filteredFixtureRows = parsedFixtureRows.map((row) => ({
          team: row.team,
          fixtures: row.fixtures.slice(actualStartGW, actualEndGW + 1),
        }));

        setFixtureRows(filteredFixtureRows);
        setStartingGameweek(actualStartGW);

        // Parse strengths CSV
        const strengthsText = strengthsCSV;
        const { strengths, homeAdvantage: parsedHomeAdvantage } =
          parseStrengthsCSV(strengthsText);
        setHomeAdvantage(parsedHomeAdvantage);
        setTeamStrengths(strengths);

        setIsLoading(false);
      } catch (e) {
        setError((e as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    setTeamStrengths,
    setHomeAdvantage,
    manualStartGW,
    manualEndGW,
    setStartGameweek,
    setEndGameweek,
  ]);

  return {
    fixtureRows,
    homeAdvantage,
    error,
    isLoading,
    startingGameweek,
    totalGameweeks,
    defaultStartGameweek,
    defaultEndGameweek,
  };
}

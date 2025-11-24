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
}

/**
 * Custom hook to handle loading and parsing of CSV data
 */
export function useDataLoader(): DataLoadingResult {
  const context = useContext(Context) as ContextType;
  const { setTeamStrengths, setHomeAdvantage } = context;

  const [fixtureRows, setFixtureRows] = useState<FixtureRow[]>([]);
  const [homeAdvantageLocal, setHomeAdvantageLocal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingGameweek, setStartingGameweek] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse gameweek dates CSV
        const gameweekDatesText = gameweekDatesCSV;
        const gameweekDates = parseGameweekDatesCSV(gameweekDatesText);
        const startGW = getStartingGameweek(gameweekDates);
        setStartingGameweek(startGW);

        // Parse fixtures CSV
        const fixturesText = fixturesCSV;
        const parsedFixtureRows = parseFixturesCSV(fixturesText);

        // Filter fixtures to only show from the starting gameweek onwards
        const filteredFixtureRows = parsedFixtureRows.map((row) => ({
          team: row.team,
          fixtures: row.fixtures.slice(startGW),
        }));

        setFixtureRows(filteredFixtureRows);

        // Parse strengths CSV
        const strengthsText = strengthsCSV;
        const { strengths, homeAdvantage: parsedHomeAdvantage } =
          parseStrengthsCSV(strengthsText);
        setHomeAdvantageLocal(parsedHomeAdvantage);
        setHomeAdvantage(parsedHomeAdvantage);
        setTeamStrengths(strengths);

        setIsLoading(false);
      } catch (e) {
        setError((e as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setTeamStrengths, setHomeAdvantage]);

  return {
    fixtureRows,
    homeAdvantage: homeAdvantageLocal,
    error,
    isLoading,
    startingGameweek,
  };
}

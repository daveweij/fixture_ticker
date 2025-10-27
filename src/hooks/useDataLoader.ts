import { useState, useEffect, useContext } from 'react';
import { Context } from '../context/Context.tsx';
import type { ContextType } from '../context/Context.tsx';
import { parseFixturesCSV, parseStrengthsCSV } from '../utils/parse';
import type { FixtureRow } from '../utils/parse';
import fixturesCSV from '../assets/fixtures_by_team.csv?raw';
import strengthsCSV from '../assets/team_strengths.csv?raw';

interface DataLoadingResult {
  fixtureRows: FixtureRow[];
  homeAdvantage: number;
  error: string | null;
  isLoading: boolean;
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse fixtures CSV
        const fixturesText = fixturesCSV;
        const parsedFixtureRows = parseFixturesCSV(fixturesText);
        setFixtureRows(parsedFixtureRows);

        // Parse strengths CSV
        const strengthsText = strengthsCSV;
        const { strengths, homeAdvantage: parsedHomeAdvantage } = parseStrengthsCSV(strengthsText);
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
    isLoading
  };
}
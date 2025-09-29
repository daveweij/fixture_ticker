import { useState, useEffect, useContext } from 'react';
import { Context } from '../context/Context.tsx';
import type { ContextType, TeamStrength } from '../context/Context.tsx';
import type { FixtureRow } from '../utils/parse';
import { percentile } from '../utils/colorUtils';

export type StrengthType = 'attack' | 'defense' | 'combined';

/**
 * Calculate strength value based on type
 */
function getStrengthValue(team: TeamStrength, strengthType: StrengthType): number {
  if (strengthType === 'attack') return team.attack;
  if (strengthType === 'defense') return -1 * team.defense;
  return team.attack - team.defense;
}

interface StrengthCalculationResult {
  strengths: Record<string, number>;
  minStrength: number;
  maxStrength: number;
  medianStrength: number;
  error: string | null;
}

/**
 * Custom hook to handle all strength calculations for fixtures
 */
export function useStrengthCalculations(
  rows: FixtureRow[],
  homeAdvantage: number,
  strengthType: StrengthType,
  avgRange: number
): StrengthCalculationResult {
  const context = useContext(Context) as ContextType;
  const { teamStrengths, editedStrengths } = context;

  const [result, setResult] = useState<StrengthCalculationResult>({
    strengths: {},
    minStrength: 0,
    maxStrength: 0,
    medianStrength: 0,
    error: null
  });

  useEffect(() => {
    try {
      if (!rows.length || !teamStrengths.length) {
        setResult(prev => ({ ...prev, error: null }));
        return;
      }

      const strengthsMap: Record<string, number> = {};

      // Merge original strengths with user edits
      const strengthsToUse = teamStrengths.map((s: typeof teamStrengths[number]) => {
        const edit = editedStrengths[s.team];
        return edit ? { ...s, ...edit } : s;
      });

      // Calculate color values for range determination
      let colorValues: number[] = [];
      
      if (avgRange > 1 && rows.length > 0) {
        // Calculate averaged values for color range
        colorValues = calculateAveragedColorValues(
          rows, 
          strengthsToUse, 
          avgRange, 
          strengthType, 
          homeAdvantage
        );
      } else {
        // Use single fixture values for color range
        colorValues = calculateSingleFixtureColorValues(
          strengthsToUse, 
          strengthType, 
          homeAdvantage
        );
      }

      colorValues.sort((a, b) => a - b);

      // Build strengths map for fixture calculations
      strengthsToUse.forEach((s: typeof strengthsToUse[number]) => {
        const value = getStrengthValue(s, strengthType);
        strengthsMap[s.team.toUpperCase()] = value;
      });

      // Set all calculated values at once
      setResult({
        strengths: strengthsMap,
        minStrength: percentile(colorValues, 0.05),
        maxStrength: percentile(colorValues, 0.95),
        medianStrength: percentile(colorValues, 0.5),
        error: null
      });
    } catch (err) {
      setResult(prev => ({
        ...prev,
        error: (err instanceof Error ? err.message : String(err))
      }));
    }
  }, [avgRange, strengthType, teamStrengths, editedStrengths, rows, homeAdvantage]);

  return result;
}

/**
 * Calculate color values when using averaging over multiple fixtures
 */
function calculateAveragedColorValues(
  rows: FixtureRow[],
  strengthsToUse: TeamStrength[],
  avgRange: number,
  strengthType: StrengthType,
  homeAdvantage: number
): number[] {
  const colorValues: number[] = [];

  for (const row of rows) {
    for (let i = 0; i < row.fixtures.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = i; j < Math.min(i + avgRange, row.fixtures.length); j++) {
        const opp = row.fixtures[j].trim();
        const oppKey = opp.toUpperCase();
        let value: number | null = null;
        
        const teamObj = strengthsToUse.find((t: TeamStrength) => 
          t.team.toUpperCase() === oppKey
        );
        
        if (teamObj) {
          value = getStrengthValue(teamObj, strengthType);
          
          const is_home_game = (opp !== oppKey);
          if (is_home_game && value !== null) {
            value -= homeAdvantage;
          }
          
          if (value !== null) {
            sum += value;
            count++;
          }
        }
      }
      
      if (count > 0) colorValues.push(sum / count);
    }
  }

  return colorValues;
}

/**
 * Calculate color values for single fixture display
 */
function calculateSingleFixtureColorValues(
  strengthsToUse: TeamStrength[],
  strengthType: StrengthType,
  homeAdvantage: number
): number[] {
  const strengthArray: Array<[string, number]> = strengthsToUse.map((s: TeamStrength) => {
    return [s.team, getStrengthValue(s, strengthType)];
  });
  
  const awayValues = strengthArray.map(([, strength]) => strength);
  const homeValues = strengthArray.map(([, strength]) => strength - homeAdvantage);
  
  return [...awayValues, ...homeValues];
}
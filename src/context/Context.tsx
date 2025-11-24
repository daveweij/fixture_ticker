import { createContext, useState } from "react";
import type { ReactNode } from "react";

export type TeamStrength = {
  team: string;
  attack: number;
  defense: number;
};

export type ContextType = {
  teamStrengths: TeamStrength[];
  setTeamStrengths: React.Dispatch<React.SetStateAction<TeamStrength[]>>;
  editedStrengths: Record<string, { attack: number; defense: number }>;
  setEditedStrengths: React.Dispatch<
    React.SetStateAction<Record<string, { attack: number; defense: number }>>
  >;
  homeAdvantage: number;
  setHomeAdvantage: React.Dispatch<React.SetStateAction<number>>;
  startGameweek: number | null;
  setStartGameweek: React.Dispatch<React.SetStateAction<number | null>>;
  endGameweek: number | null;
  setEndGameweek: React.Dispatch<React.SetStateAction<number | null>>;
};

export const Context = createContext<ContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ProviderProps) => {
  const [teamStrengths, setTeamStrengths] = useState<TeamStrength[]>([]);
  const [editedStrengths, setEditedStrengths] = useState<
    Record<string, { attack: number; defense: number }>
  >({});
  const [homeAdvantage, setHomeAdvantage] = useState(0);
  const [startGameweek, setStartGameweek] = useState<number | null>(null);
  const [endGameweek, setEndGameweek] = useState<number | null>(null);

  return (
    <Context.Provider
      value={{
        teamStrengths,
        setTeamStrengths,
        editedStrengths,
        setEditedStrengths,
        homeAdvantage,
        setHomeAdvantage,
        startGameweek,
        setStartGameweek,
        endGameweek,
        setEndGameweek,
      }}
    >
      {children}
    </Context.Provider>
  );
};

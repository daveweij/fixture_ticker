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
  setEditedStrengths: React.Dispatch<React.SetStateAction<Record<string, { attack: number; defense: number }>>>;
};

export const Context = createContext<ContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ProviderProps) => {
  const [teamStrengths, setTeamStrengths] = useState<TeamStrength[]>([]);
  const [editedStrengths, setEditedStrengths] = useState<Record<string, { attack: number; defense: number }>>({});

  return (
    <Context.Provider value={{ teamStrengths, setTeamStrengths, editedStrengths, setEditedStrengths }}>
      {children}
    </Context.Provider>
  );
};
import React, { useState } from "react";

export const Context = React.createContext();
type TeamStrength = {
  team: string;
  attack: number;
  defense: number;
};
export const ContextProvider = ({ children }) => {
    const [teamStrengths, setTeamStrengths] = useState<TeamStrength[]>([]);
    const [editedStrengths, setEditedStrengths] = useState<Record<string, {attack: number; defense: number}>>({});

	return (
		<Context.Provider value={{ teamStrengths, setTeamStrengths, editedStrengths, setEditedStrengths }}>
			{children}
		</Context.Provider>
	);
};
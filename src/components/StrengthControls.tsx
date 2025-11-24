interface StrengthControlsProps {
  strengthType: "attack" | "defense" | "combined";
  onStrengthTypeChange: (type: "attack" | "defense" | "combined") => void;
}

export function StrengthControls({
  strengthType,
  onStrengthTypeChange,
}: StrengthControlsProps) {
  return (
    <div className="fixtures-controls">
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="combined"
          checked={strengthType === "combined"}
          onChange={() => onStrengthTypeChange("combined")}
        />
        Combined (Attack - Defense)
      </label>
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="attack"
          checked={strengthType === "attack"}
          onChange={() => onStrengthTypeChange("attack")}
        />
        Defense
      </label>
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="defense"
          checked={strengthType === "defense"}
          onChange={() => onStrengthTypeChange("defense")}
        />
        Attack
      </label>
    </div>
  );
}

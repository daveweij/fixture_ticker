interface StrengthControlsProps {
  strengthType: 'attack' | 'defense' | 'combined';
  onStrengthTypeChange: (type: 'attack' | 'defense' | 'combined') => void;
  avgRange: number;
  avgRangeInput: string | undefined;
  gameweekCount: number;
  onAvgRangeChange: (range: number) => void;
  onAvgRangeInputChange: (input: string) => void;
}

export function StrengthControls({
  strengthType,
  onStrengthTypeChange,
  avgRange,
  avgRangeInput,
  gameweekCount,
  onAvgRangeChange,
  onAvgRangeInputChange
}: StrengthControlsProps) {
  return (
    <div className="fixtures-controls">
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="combined"
          checked={strengthType === 'combined'}
          onChange={() => onStrengthTypeChange('combined')}
        />
        Combined (Attack - Defense)
      </label>
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="attack"
          checked={strengthType === 'attack'}
          onChange={() => onStrengthTypeChange('attack')}
        />
        Defense
      </label>
      <label className="control-label">
        <input
          type="radio"
          name="strengthType"
          value="defense"
          checked={strengthType === 'defense'}
          onChange={() => onStrengthTypeChange('defense')}
        />
        Attack
      </label>
      <div className="avg-range-group">
        <label htmlFor="avgRange" className="avg-range-label">Averaging range:</label>
        <input
          id="avgRange"
          type="number"
          min={1}
          max={gameweekCount}
          value={avgRangeInput ?? avgRange}
          className="avg-range-input"
          onBlur={e => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > gameweekCount) val = gameweekCount;
            onAvgRangeChange(val);
            onAvgRangeInputChange(val.toString());
          }}
          onChange={e => {
            onAvgRangeInputChange(e.target.value);
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= gameweekCount) {
              onAvgRangeChange(val);
            }
          }}
        />
      </div>
    </div>
  );
}
import StrengthInput from "./StrengthInput";

interface HomeAdvantageControlsProps {
  value: number;
  onChange: (value: number) => void;
}

function HomeAdvantageControls({
  value,
  onChange,
}: HomeAdvantageControlsProps) {
  return (
    <>
      <div className="home-advantage-section">
        <label className="home-advantage-label" htmlFor="home-advantage-input">
          Home Advantage
        </label>
        <StrengthInput
          className="strengths-input home-advantage"
          displayValue={value}
          min={0}
          max={10}
          id="home-advantage-input"
          onChange={(event) => {
            const parsed = parseInt(event.target.value, 10);
            if (Number.isNaN(parsed)) {
              return;
            }

            const clamped = Math.max(0, Math.min(10, parsed));
            onChange(clamped);
          }}
        />
      </div>
      <small>
        * Home advantage is subtracted from the away team's strength when
        calculating fixture strengths.
      </small>
    </>
  );
}

export default HomeAdvantageControls;

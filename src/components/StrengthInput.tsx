interface StrengthInputProps {
  className: string;
  displayValue: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
}

function StrengthInput({
  className,
  displayValue,
  onChange,
  min = 1,
  max = 10,
}: StrengthInputProps) {
  return (
    <input
      type="number"
      step={1}
      max={max}
      min={min}
      inputMode="decimal"
      pattern="[0-9]*"
      value={displayValue}
      className={className}
      onFocus={(e) => e.target.classList.add("focus")}
      onBlur={(e) => e.target.classList.remove("focus")}
      onChange={onChange}
    />
  );
}

export default StrengthInput;

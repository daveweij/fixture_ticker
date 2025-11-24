interface StrengthInputProps {
  className: string;
  displayValue: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function StrengthInput({
  className,
  displayValue,
  onChange,
}: StrengthInputProps) {
  return (
    <input
      type="number"
      step={1}
      max={10}
      min={1}
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

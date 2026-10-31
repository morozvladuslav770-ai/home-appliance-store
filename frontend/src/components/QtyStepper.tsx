type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
};

export default function QtyStepper({ value, max, onChange, label }: Props) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Зменшити кількість"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label="Збільшити кількість"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

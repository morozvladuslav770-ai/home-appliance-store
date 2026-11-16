// Зірки лише для показу; читачі екрана отримують число в aria-label
export default function Stars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`Оцінка ${value} з 5`}>
      {"★".repeat(filled)}
      <span className="stars__off">{"★".repeat(5 - filled)}</span>
    </span>
  );
}

import type { ReactNode } from "react";

type Props = {
  label: string;
  error?: string[];
  children: ReactNode;
};

export default function Field({ label, error, children }: Props) {
  return (
    <label className={`field ${error ? "field--bad" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small className="field__error">{error[0]}</small>}
    </label>
  );
}

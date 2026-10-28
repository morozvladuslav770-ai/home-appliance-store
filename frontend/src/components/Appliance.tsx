import type { ApplianceKind } from "../data";

type Props = { kind: ApplianceKind; className?: string };

// Прості контурні ілюстрації техніки — замінюються справжніми фото товарів
export default function Appliance({ kind, className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      role="img"
      aria-hidden="true"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "fridge" && (
        <>
          <rect className="ap-body" x="30" y="8" width="60" height="124" rx="6" />
          <path className="ap-line" d="M30 50h60" />
          <path className="ap-line" d="M40 24v14M40 62v26" />
        </>
      )}
      {kind === "freezer" && (
        <>
          <rect className="ap-body" x="30" y="16" width="60" height="112" rx="6" />
          <path className="ap-line" d="M30 53h60M30 90h60" />
          <path className="ap-line" d="M54 34h12M54 71h12M54 108h12" />
        </>
      )}
      {kind === "washer" && (
        <>
          <rect className="ap-body" x="20" y="14" width="80" height="112" rx="6" />
          <path className="ap-line" d="M20 38h80" />
          <circle className="ap-line" cx="60" cy="82" r="28" />
          <circle className="ap-fill" cx="60" cy="82" r="18" />
          <circle className="ap-dot" cx="34" cy="26" r="3" />
          <path className="ap-line" d="M60 26h30" />
        </>
      )}
      {kind === "cooker" && (
        <>
          <rect className="ap-body" x="18" y="22" width="84" height="106" rx="6" />
          <circle className="ap-line" cx="42" cy="42" r="8" />
          <circle className="ap-line" cx="78" cy="42" r="8" />
          <circle className="ap-line" cx="42" cy="66" r="8" />
          <circle className="ap-line" cx="78" cy="66" r="8" />
          <rect className="ap-fill" x="30" y="84" width="60" height="34" rx="3" />
          <path className="ap-line" d="M36 80h48" />
        </>
      )}
      {kind === "dishwasher" && (
        <>
          <rect className="ap-body" x="20" y="14" width="80" height="112" rx="6" />
          <path className="ap-line" d="M20 36h80" />
          <circle className="ap-dot" cx="34" cy="25" r="3" />
          <path className="ap-line" d="M48 25h40" />
          <path className="ap-line" d="M30 50h60M30 70h60M30 90h60" />
          <path className="ap-line" d="M46 112h28" />
        </>
      )}
      {kind === "hood" && (
        <>
          <path className="ap-body" d="M44 8h32v44H44z" />
          <path className="ap-body" d="M44 52L14 100h92L76 52z" />
          <path className="ap-line" d="M30 114h60" />
          <path className="ap-line" d="M36 126h48" />
        </>
      )}
      {kind === "oven" && (
        <>
          <rect className="ap-body" x="16" y="22" width="88" height="96" rx="6" />
          <path className="ap-line" d="M16 46h88" />
          <circle className="ap-line" cx="36" cy="34" r="5" />
          <circle className="ap-line" cx="60" cy="34" r="5" />
          <circle className="ap-line" cx="84" cy="34" r="5" />
          <rect className="ap-fill" x="28" y="58" width="64" height="44" rx="3" />
          <path className="ap-line" d="M38 52h44" />
        </>
      )}
    </svg>
  );
}

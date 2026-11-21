// Довгий опис товару: абзаци розділяються порожнім рядком, рядки з «• » стають списком,
// а рядок, що закінчується двокрапкою перед списком, — підзаголовком
export default function Description({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  return (
    <div className="pp__desc">
      {blocks.map((lines, i) => {
        const isBullet = (line: string) => line.startsWith("•");
        const heading = lines.length > 1 && lines[0].endsWith(":") && lines.slice(1).every(isBullet) ? lines[0] : null;
        const rest = heading ? lines.slice(1) : lines;

        if (rest.every(isBullet)) {
          return (
            <div key={i}>
              {heading && <h3>{heading.slice(0, -1)}</h3>}
              <ul>
                {rest.map((line) => (
                  <li key={line}>{line.replace(/^•\s*/, "")}</li>
                ))}
              </ul>
            </div>
          );
        }
        return <p key={i}>{rest.join(" ")}</p>;
      })}
    </div>
  );
}

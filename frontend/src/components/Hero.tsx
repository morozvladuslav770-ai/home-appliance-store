import Appliance from "./Appliance";

// Шкала енергокласів — характерний для побутової техніки елемент
const LADDER = [
  { cls: "A", width: 38, color: "#1F9D6B" },
  { cls: "B", width: 50, color: "#6BB536" },
  { cls: "C", width: 62, color: "#C5C21E" },
  { cls: "D", width: 74, color: "#F5A623" },
  { cls: "E", width: 86, color: "#E8762B" },
];

const PERKS = [
  {
    title: "Доставка по Україні",
    text: "У всі населені пункти, які обслуговують служби доставки.",
  },
  {
    title: "Оплата частинами",
    text: "Або карткою онлайн, або при отриманні.",
  },
  {
    title: "Порівняння товарів",
    text: "До 4 моделей поруч за характеристиками.",
  },
];

export default function Hero() {
  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__text">
          <h1 id="hero-title">Велика техніка для дому з доставкою по Україні</h1>
          <p>
            Холодильники, пральні машини, плити та інша техніка для кухні й
            ванної. Фільтруйте за брендом, ціною та енергокласом.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#catalog">
              Перейти до каталогу
            </a>
            <a className="btn btn--ghost" href="#hits">
              Акції тижня
            </a>
          </div>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="ladder">
            {LADDER.map((row, i) => (
              <div
                className="ladder__row"
                key={row.cls}
                style={
                  {
                    "--w": `${row.width}%`,
                    "--c": row.color,
                    "--i": i,
                  } as React.CSSProperties
                }
              >
                <span className="ladder__bar">{row.cls}</span>
              </div>
            ))}
          </div>
          <div className="hero__fridge">
            <Appliance kind="fridge" />
          </div>
          <div className="hero__tag">
            <strong>Енергоклас A</strong>
            <span>Менше споживання — менше витрат</span>
          </div>
        </div>
      </section>

      <ul className="perks container">
        {PERKS.map((p) => (
          <li key={p.title}>
            <strong>{p.title}</strong>
            <span>{p.text}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

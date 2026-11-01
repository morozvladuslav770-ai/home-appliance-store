import { useShop } from "../shop/context";

export default function Footer() {
  const { categories } = useShop();
  return (
    <footer className="footer" id="contacts">
      <div className="container footer__grid">
        <div>
          <strong className="footer__brand">ТехноДім</strong>
          <p>Інтернет-магазин великої побутової техніки.</p>
        </div>

        <div>
          <h2>Каталог</h2>
          <ul>
            {categories.slice(0, 4).map((c) => (
              <li key={c.name}>
                <a href="#catalog">{c.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Покупцям</h2>
          <ul>
            <li><a href="#delivery">Доставка й оплата</a></li>
            <li><a href="#returns">Обмін і повернення</a></li>
            <li><a href="#account">Особистий кабінет</a></li>
          </ul>
        </div>

        <div>
          <h2>Контакти</h2>
          <ul>
            <li><a href="tel:+380000000000">+38 (000) 000-00-00</a></li>
            <li><a href="mailto:info@example.com">info@example.com</a></li>
            <li>
              <a href="#instagram">Instagram</a>, <a href="#facebook">Facebook</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__legal">
        <span>© 2026 ТехноДім. Усі права захищено.</span>
        <span>
          <a href="#privacy">Політика конфіденційності</a>
          {"  "}
          <a href="#terms">Умови використання</a>
        </span>
      </div>
    </footer>
  );
}

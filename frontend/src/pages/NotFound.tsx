import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section container page-message">
      <h1>Сторінку не знайдено</h1>
      <p>Можливо, адресу введено з помилкою або товар більше не продається.</p>
      <Link className="btn btn--primary" to="/">
        На головну
      </Link>
    </section>
  );
}

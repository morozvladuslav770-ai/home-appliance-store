import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Спільна обгортка для довідкових сторінок (доставка, повернення тощо)
export default function InfoPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="section container info" aria-labelledby="info-title">
      <nav className="crumbs" aria-label="Навігація">
        <Link to="/">Головна</Link>
        <span aria-hidden="true"> / </span>
        <span>{title}</span>
      </nav>
      <h1 className="h2" id="info-title">
        {title}
      </h1>
      <p className="info__lead">{lead}</p>
      <div className="info__body">{children}</div>
    </section>
  );
}

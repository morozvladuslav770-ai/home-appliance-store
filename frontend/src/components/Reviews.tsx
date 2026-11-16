import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, type FieldErrors } from "../api";
import { useAuth } from "../auth/context";
import type { Product } from "../data";
import { useShop } from "../shop/context";
import Field from "./Field";
import Stars from "./Stars";

type Review = { id: number; rating: number; body: string; author: string; created_at: string; mine: boolean };
type Eligibility = "guest" | "not_purchased" | "can_review" | "reviewed";
type Data = { reviews: Review[]; eligibility: Eligibility };

function ReviewForm({
  productId,
  existing,
  onDone,
  onCancel,
}: {
  productId: number;
  existing: Review | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { token } = useAuth();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const result = await api(existing ? `/reviews/${existing.id}` : `/products/${productId}/reviews`, {
      method: existing ? "PATCH" : "POST",
      token,
      body: { review: { rating, body } },
    });
    setSending(false);

    if (result.ok) onDone();
    else setErrors(result.errors);
  };

  return (
    <form className="panel review-form" onSubmit={submit} noValidate>
      <h3>{existing ? "Редагувати відгук" : "Ваш відгук"}</h3>

      {errors.base && (
        <ul className="form-errors" role="alert">
          {errors.base.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <fieldset className="star-input">
        <legend>Оцінка</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= rating ? "is-on" : ""}>
            <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{n} з 5</span>
          </label>
        ))}
      </fieldset>
      {errors.rating && <p className="field__error">{errors.rating[0]}</p>}

      <Field label="Текст відгуку" error={errors.body}>
        <textarea
          rows={4}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Що сподобалось, а що ні? Як техніка працює вдома?"
        />
      </Field>

      <div className="row-actions">
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? "Надсилаємо…" : existing ? "Зберегти" : "Опублікувати"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}

// FR-4.5: відгуки з оцінкою; писати можуть лише покупці, які отримали товар
export default function Reviews({ product }: { product: Product }) {
  const { token, user } = useAuth();
  const { reload: reloadShop } = useShop();
  const { pathname } = useLocation();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<Data>(`/products/${product.id}/reviews`, { token }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [product.id, token, version]);

  const changed = () => {
    setEditing(false);
    setVersion((v) => v + 1);
    reloadShop(); // середня оцінка товару змінилась
  };

  return (
    <section className="section container" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews__head">
        <h2 id="reviews-title">Відгуки</h2>
        {product.rating && (
          <p className="reviews__summary">
            <Stars value={Number(product.rating)} />
            <strong>{Number(product.rating).toFixed(1)}</strong>
            {product.reviews_count ? <span>на основі відгуків: {product.reviews_count}</span> : null}
          </p>
        )}
      </div>

      {failed && <p className="form-errors">Не вдалося завантажити відгуки.</p>}
      {data === null && !failed && <p className="notice">Завантаження відгуків…</p>}

      {data && (
        <>
          {data.eligibility === "guest" && (
            <p className="panel__hint">
              <Link to="/login" state={{ from: pathname }}>
                Увійдіть
              </Link>
              , щоб залишити відгук. Його можуть написати покупці, які вже отримали цей товар.
            </p>
          )}
          {data.eligibility === "not_purchased" && (
            <p className="panel__hint">Відгук можуть залишити лише покупці, які вже отримали цей товар.</p>
          )}
          {data.eligibility === "can_review" && <ReviewForm productId={product.id} existing={null} onDone={changed} />}

          {data.reviews.length === 0 ? (
            <p className="empty">Відгуків поки немає.</p>
          ) : (
            <ul className="reviews">
              {data.reviews.map((r) =>
                r.mine && editing ? (
                  <li key={r.id}>
                    <ReviewForm productId={product.id} existing={r} onDone={changed} onCancel={() => setEditing(false)} />
                  </li>
                ) : (
                  <li className="review" key={r.id}>
                    <div className="review__head">
                      <Stars value={r.rating} />
                      <strong>{r.author}</strong>
                      {r.mine && <span className="review__mine">Ваш відгук</span>}
                      <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString("uk-UA")}</time>
                    </div>
                    <p>{r.body}</p>
                    {r.mine && user && (
                      <button type="button" className="link" onClick={() => setEditing(true)}>
                        Редагувати
                      </button>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

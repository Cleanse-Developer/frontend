import Avatar from "../primitives/Avatar";
import RatingStars from "./RatingStars";
import "./ReviewCard.css";

/**
 * ReviewCard — a single customer review, distilled from the Testimonials card
 * (avatar, name, rating, quote). Standalone & reusable (no carousel logic).
 */
export default function ReviewCard({
  name,
  role,
  avatar,
  rating,
  text,
  date,
  className = "",
}) {
  return (
    <article className={`ui-review ${className}`.trim()}>
      <header className="ui-review-head">
        <Avatar src={avatar} name={name} size={48} />
        <div className="ui-review-meta">
          <span className="ui-review-name">{name}</span>
          {role ? <span className="ui-review-role">{role}</span> : null}
        </div>
      </header>
      {rating != null ? <RatingStars value={rating} className="ui-review-stars" /> : null}
      {text ? <p className="ui-review-text">{text}</p> : null}
      {date ? <span className="ui-review-date">{date}</span> : null}
    </article>
  );
}

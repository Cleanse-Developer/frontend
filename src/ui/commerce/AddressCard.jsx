import "./AddressCard.css";

/**
 * AddressCard — a saved address (profile / checkout). Selectable via radio.
 * `address`: { fullName, phone, line1, line2, city, state, pincode, label }.
 */
export default function AddressCard({
  address = {},
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  className = "",
}) {
  const { fullName, phone, line1, line2, city, state, pincode, label } = address;
  return (
    <div
      className={`ui-address-card ${selected ? "is-selected" : ""} ${className}`.trim()}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="ui-address-card-head">
        <span className="ui-address-card-name">{fullName}</span>
        {label ? <span className="ui-address-card-label">{label}</span> : null}
      </div>
      <p className="ui-address-card-lines">
        {[line1, line2, city, state, pincode].filter(Boolean).join(", ")}
      </p>
      {phone ? <p className="ui-address-card-phone">{phone}</p> : null}
      {(onEdit || onDelete) ? (
        <div className="ui-address-card-actions">
          {onEdit ? <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</button> : null}
          {onDelete ? <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button> : null}
        </div>
      ) : null}
    </div>
  );
}

import "./MaintenanceScreen.css";

/* The under-maintenance screen. Rendered from the root layout's early-return branch,
 * which means it sits OUTSIDE SettingsProvider — so every piece of copy arrives as a
 * prop rather than through useSettings().
 *
 * Deliberately NOT a client component. Both animations are pure CSS, so this whole
 * branch ships as static HTML with nothing to hydrate. That is the point: the usual
 * reason to switch maintenance on is that something downstream is broken, and a
 * screen that needs JS to appear is the wrong thing to show at that moment.
 *
 * `data` is the /api/settings/maintenance payload. Every field is optional — a blank
 * one is simply not rendered.
 */
export default function MaintenanceScreen({ data = {} }) {
  const {
    eyebrow,
    heading,
    message,
    revisitNote,
    email,
    phone,
    whatsapp,
    addressLines,
    showBranches = true,
  } = data;

  // The \n convention used by cmsBlog.newsletterTitle and cmsContact.heroTitle: the
  // admin controls the line break, and each line reveals on its own beat.
  const headingLines = String(heading || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const address = (Array.isArray(addressLines) ? addressLines : []).filter(Boolean);
  const hasContact = email || phone || whatsapp || address.length > 0;

  return (
    <section className="mnt">
      {/* Animation 2 — ambient ink bloom. The three blots breathe; the grain layer
          carries the turbulence filter and stays still. See the CSS for why. */}
      <span className="mnt-bloom mnt-bloom--1" aria-hidden="true" />
      <span className="mnt-bloom mnt-bloom--2" aria-hidden="true" />
      <span className="mnt-bloom mnt-bloom--3" aria-hidden="true" />
      <span className="mnt-bloom-grain" aria-hidden="true" />

      {/* Animation 1 — the recovered category branch, growing inward from both
          bottom corners on an ink-reveal mask sweep. */}
      {showBranches && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/root-branch.png"
            alt=""
            aria-hidden="true"
            className="mnt-branch mnt-branch--left"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/root-branch.png"
            alt=""
            aria-hidden="true"
            className="mnt-branch mnt-branch--right"
          />
        </>
      )}

      <div className="mnt-inner">
        {/* <div> rather than <span>: these wrap block-level <p>, and the reveal rule
            makes them display:block anyway. */}
        {eyebrow && (
          <div className="mnt-reveal mnt-reveal--1">
            <p className="mnt-eyebrow">{eyebrow}</p>
          </div>
        )}

        {headingLines.length > 0 && (
          <h1 className="mnt-heading">
            {headingLines.map((line, i) => (
              <span key={i} className="mnt-reveal mnt-heading-line">
                <span>{line}</span>
              </span>
            ))}
          </h1>
        )}

        {message && (
          <div className="mnt-reveal mnt-reveal--3">
            <p className="mnt-message">{message}</p>
          </div>
        )}

        {revisitNote && (
          <div className="mnt-reveal mnt-reveal--4">
            <p className="mnt-revisit">{revisitNote}</p>
          </div>
        )}

        {hasContact && (
          <>
            <hr className="mnt-rule" />
            <ul className="mnt-contact">
              {email && (
                <li className="mnt-contact-item">
                  <span className="mnt-contact-label">Email</span>
                  <a className="mnt-contact-value" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li className="mnt-contact-item">
                  <span className="mnt-contact-label">Call</span>
                  <a
                    className="mnt-contact-value"
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  >
                    {phone}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li className="mnt-contact-item">
                  <span className="mnt-contact-label">WhatsApp</span>
                  <a
                    className="mnt-contact-value"
                    href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {whatsapp}
                  </a>
                </li>
              )}
              {address.length > 0 && (
                <li className="mnt-contact-item">
                  <span className="mnt-contact-label">Visit</span>
                  <address className="mnt-contact-value mnt-address">
                    {address.map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {/* Turbulence filter for the ink grain. Lives here rather than in a shared defs
          file because nothing else on the site uses it. The explicit region caps how
          much area the browser has to process. */}
      <svg className="mnt-defs" aria-hidden="true" focusable="false">
        <filter
          id="mntInkEdge"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.019"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </section>
  );
}

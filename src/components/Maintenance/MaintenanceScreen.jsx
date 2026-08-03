import "./MaintenanceScreen.css";

/* The under-maintenance screen. Rendered from the root layout's early-return branch,
 * which means it sits OUTSIDE SettingsProvider — so every piece of copy arrives as a
 * prop rather than through useSettings().
 *
 * Deliberately NOT a client component. Every animation here is pure CSS, so this whole
 * branch ships as static HTML with nothing to hydrate. That is the point: the usual
 * reason to switch maintenance on is that something downstream is broken, and a screen
 * that needs JS to appear is the wrong thing to show at that moment.
 *
 * `data` is the /api/settings/maintenance payload. Every field is optional — a blank
 * one is simply not rendered.
 */

/* The Cleanse monogram, same paths as /public/cleanse-monogram.svg and the same array
 * the Preloader inlines — copied rather than imported because the Preloader owns them
 * as a client-component constant, and this screen must not pull a client module in.
 *
 * Each petal carries pathLength="1" so one CSS rule can draw all fifteen: normalising
 * the length means stroke-dasharray/offset work in 0..1 units regardless of the real
 * path length, which is what lets the ink draw happen without JS. The Preloader needs
 * getTotalLength() only because it drives the same effect through GSAP.
 */
const MONO_PATHS = [
  "M125.83,174.96c-.36.06-.34-.44-.43-.7-.86-2.67-1.38-5.64-2.22-8.38-3.66-11.96-9.03-23.56-15.41-34.28-.95-1.59-3.4-4.54-3.41-6.2,0-3.36,2.15-10.06,3.23-13.43,3.16-9.82,8.63-22.37,14.75-30.66.45-.61,2.29-3.21,2.85-3.21.25,0,2.22,1.92,2.53,2.27,6.83,7.38,14.43,24.55,17.78,34.18.68,1.96,2.82,8,2.13,9.71-.42,1.04-3.15,4.04-4,5.33-8.92,13.36-15.38,29.48-17.81,45.38Z",
  "M123.06,172.94c-1.45-1.82-2.56-3.89-3.94-5.77-3.17-4.33-7.26-8.61-11.2-12.26-.49-.46-3.18-2.4-3.28-2.59-.32-.6-.65-2.91-.76-3.72-.66-5.06-1.68-12.74-1.01-17.65.05-.39.29-2.15.63-2.14,8.97,13.4,15.49,28.51,19.55,44.14Z",
  "M147.46,151.44c-7.72,5.75-14.08,13.58-18.14,22.35l-1.72,4.2c1.42-11.98,5.74-23.84,11.31-34.47,2.76-5.27,6.17-10.14,9.11-15.29l.77-.43c.43,7.89.13,15.86-1.33,23.64Z",
  "M102.88,150.49l-8.25-5.5c-1.14-.69-7.65-3.89-7.91-4.26-.41-.58-1.01-3.67-1.17-4.57-1.45-7.99-1.49-16.28-.07-24.27,6.09,4.13,12.02,9.02,16.61,14.81-.78,7.94-.33,15.91.8,23.78Z",
  "M148.63,150.4l8.25-5.5c1.14-.69,7.65-3.89,7.91-4.26.41-.58,1.01-3.67,1.17-4.57,1.45-7.99,1.49-16.28.07-24.27-6.09,4.13-12.02,9.02-16.61,14.81.78,7.94.33,15.91-.8,23.78Z",
  "M119.53,191.61c-.28.24-1.88-1.07-2.18-1.35-11.19-10.36-24.26-29.61-29.65-43.88-.18-.49-.67-1.08-.08-1.43,5.6,2.85,11.08,6.03,15.89,10.09,2.89,13.12,7.68,25.94,16.03,36.56Z",
  "M162.92,144.95c.64.68-6.57,15.33-7.52,17.07-4.93,9.03-11.39,18.13-19.47,24.55.96-2.02,2.35-3.83,3.41-5.8,4.53-8.38,7.27-17.57,9.19-26.88,4.46-3.46,9.19-6.71,14.39-8.94Z",
  "M109.44,184.04c-6.88-3.21-13.96-6.55-21.6-7.53-4.52-.58-9.71-.69-13.63,1.95l-.33-.08c-12.26-11.26-20.71-26.03-24.48-42.26,12.37.12,24.8,2.98,36.06,7.95,3.88,10.5,9.16,20.38,15.7,29.45,2.61,3.62,5.55,6.99,8.28,10.51Z",
  "M201.77,134.86c-3.02,13.64-9.35,26.97-18.79,37.33-.65.72-3.45,3.71-4.03,4.05-1.16.66-2.6,0-3.79-.02-9.76-.23-20.32.86-29.2,5.13-1.84.89-3.57,2.34-5.5,2.95,7.48-7.08,13.07-15.6,17.79-24.71,2.58-4.97,5.25-10.38,6.49-15.84,11.66-5.14,24.22-8.42,37.02-8.89Z",
  "M125.08,194.64c-.56.58-3.84-2.9-4.28-3.41-2.33-2.72-4.72-6.78-6.45-9.95-4.27-7.83-7.72-16.51-9.71-25.23.19-.2,1.41.84,1.61,1.03,1.46,1.37,3.47,3.5,4.82,5.02,8.04,9.01,13.4,20.33,14,32.54Z",
  "M146.52,155.29c-2.39,11.94-6.84,25.75-15.13,34.94-1.07,1.18-4.22,4.9-4.06,1.25.56-12.69,6.55-23.14,15.02-32.16l4.16-4.03Z",
  "M70.59,135.61c-7.15-1.5-14.37-2.72-21.71-2.88-4.95-26.03,3.66-54.65,22.97-72.79l-2.98,3.96c-14,20.06-13.19,52.31,1.72,71.71Z",
  "M180.37,133.95c7.15-1.5,14.37-2.72,21.71-2.88,4.95-26.03-3.66-54.65-22.97-72.79l2.98,3.96c14,20.06,13.19,52.31-1.72,71.71Z",
  "M122.3,198.17c-16.54-.56-33.23-6.8-45.66-17.65,7.58-2.32,16.04-.42,23.27,2.33,8.28,3.14,16.67,8.56,22.39,15.32Z",
  "M175.02,179.5c.1.42-.14.51-.38.75-.64.62-1.78,1.42-2.53,2.01-12.42,9.74-28.69,15.6-44.51,15.9,5.63-8.83,15.13-13.31,24.92-16.07,7.26-2.04,14.95-3.29,22.5-2.59Z",
];

/* Blossom petals drifting down behind the card, spring-cherry style.
 *
 * Hand-tuned rather than generated: this component renders on the server and then
 * hydrates, so Math.random() per petal would produce different values on each side and
 * React would flag a mismatch. Fixed values also mean the composition is repeatable.
 *
 * `d` is the fall duration and `t` the delay — negative delays start a petal partway
 * down, so the screen already has petals in the air on first paint instead of waiting
 * out a full cycle. `v` alternates the sway direction between two keyframes so the
 * fall doesn't read as fourteen copies of one path.
 */
const PETALS = [
  { x: "3%", s: 22, d: 15, t: -2, o: 0.85, v: "a" },
  { x: "9%", s: 15, d: 19, t: -9, o: 0.6, v: "b" },
  { x: "15%", s: 26, d: 13, t: -5, o: 0.9, v: "a" },
  { x: "21%", s: 17, d: 21, t: -14, o: 0.55, v: "b" },
  { x: "27%", s: 20, d: 17, t: -1, o: 0.75, v: "a" },
  { x: "33%", s: 14, d: 23, t: -11, o: 0.5, v: "b" },
  { x: "39%", s: 24, d: 14, t: -7, o: 0.85, v: "a" },
  { x: "45%", s: 16, d: 20, t: -16, o: 0.6, v: "b" },
  { x: "51%", s: 21, d: 16, t: -3, o: 0.78, v: "a" },
  { x: "57%", s: 15, d: 22, t: -12, o: 0.52, v: "b" },
  { x: "63%", s: 25, d: 12, t: -8, o: 0.88, v: "a" },
  { x: "69%", s: 17, d: 18, t: -6, o: 0.58, v: "b" },
  { x: "75%", s: 22, d: 15, t: -13, o: 0.8, v: "a" },
  { x: "81%", s: 15, d: 24, t: -4, o: 0.54, v: "b" },
  { x: "87%", s: 23, d: 16, t: -10, o: 0.82, v: "a" },
  { x: "93%", s: 18, d: 20, t: -18, o: 0.6, v: "b" },
  { x: "97%", s: 20, d: 13, t: -15, o: 0.76, v: "a" },
  { x: "6%", s: 16, d: 25, t: -21, o: 0.56, v: "b" },
];

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
      {/* Ambient ink bloom. The three blots breathe; the grain layer carries the
          turbulence filter and stays still. See the CSS for why. */}
      <span className="mnt-bloom mnt-bloom--1" aria-hidden="true" />
      <span className="mnt-bloom mnt-bloom--2" aria-hidden="true" />
      <span className="mnt-bloom mnt-bloom--3" aria-hidden="true" />
      <span className="mnt-bloom-grain" aria-hidden="true" />

      {/* Falling blossom. Sits above the branches but below the card, which keeps its
          own stacking level so nothing ever drifts across the copy. */}
      <div className="mnt-petals" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className={`mnt-petal mnt-petal--${p.v}`}
            style={{
              left: p.x,
              "--sz": `${p.s}px`,
              "--dur": `${p.d}s`,
              "--delay": `${p.t}s`,
              "--op": p.o,
            }}
          />
        ))}
      </div>

      {/* The recovered category branches, drawn out from the bottom edge on an
          ink-reveal mask sweep. Oversized and pushed past the viewport so only the
          flowering length reads, like a border growing in from off-screen. */}
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

      <div className="mnt-card">
        {/* The splash-screen logo: monogram drawn petal by petal in gold ink, then
            filled, then the wordmark washed in behind a feathered edge. */}
        <div className="mnt-logo">
          <svg
            className="mnt-mono"
            viewBox="41.93 56.28 167.10 143.89"
            role="img"
            aria-label="Cleanse Ayurveda"
          >
            {MONO_PATHS.map((d, i) => (
              <path key={i} d={d} pathLength="1" />
            ))}
          </svg>
          <span className="mnt-wordmark" aria-hidden="true">
            <span className="mnt-wordmark-mark" />
          </span>
        </div>

        <div className="mnt-inner">
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
                  <li className="mnt-contact-item mnt-contact-item--address">
                    <span className="mnt-contact-label">Visit</span>
                    <address className="mnt-contact-value mnt-address">
                      {address.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </address>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
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

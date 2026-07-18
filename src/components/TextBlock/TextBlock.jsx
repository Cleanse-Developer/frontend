import { Fragment } from "react";
import "./TextBlock.css";

import Copy from "../Copy/Copy";

/* The genesis manifesto band. Content is passed down from the /genesis page
   rather than read from useSettings() here, so this stays a plain presentational
   component (no "use client" needed) and the CMS wiring lives in one place. */
const TextBlock = ({ data = {} }) => {
  const headingLines = (data.manifestoHeading || "").split("\n");
  const columns = data.manifestoColumns || [];

  return (
    <section className="text-block">
      <img
        className="text-block-aside-img"
        src={data.manifestoImage?.url}
        alt=""
      />
      <div className="container">
        <div className="text-block-col">
          <Copy>
            <h3>
              {headingLines.map((line, i) => (
                <Fragment key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </Fragment>
              ))}
            </h3>
          </Copy>
        </div>
        <div className="text-block-col">
          {columns.map((col, i) => (
            <div className="text-block-copy" key={i}>
              <Copy>
                <p className="bodyCopy sm">{col}</p>
              </Copy>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TextBlock;

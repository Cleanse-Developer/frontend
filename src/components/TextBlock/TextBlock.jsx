import "./TextBlock.css";

import Copy from "../Copy/Copy";

const TextBlock = () => {
  return (
    <section className="text-block">
      <img className="text-block-aside-img" src="/about.png" alt="" />
      <div className="container">
        <div className="text-block-col">
          <Copy>
            <h3>Pure nature,<br />timeless beauty.</h3>
          </Copy>
        </div>
        <div className="text-block-col">
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                Crafted with sacred intention. Built on Ayurvedic wisdom, not trends.
                Each formula functions with purpose, nothing artificial. Pure in essence,
                deliberate in potency, rituals for those seeking true wellness.
              </p>
            </Copy>
          </div>
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                No synthetics. No compromises. Just formulas perfected over millennia.
                Indifferent to fads, untouched by chemicals. Botanical in source,
                sacred in tradition. A system for those who honor their skin.
              </p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextBlock;

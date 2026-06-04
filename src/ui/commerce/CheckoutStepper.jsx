import "./CheckoutStepper.css";

/**
 * CheckoutStepper — horizontal progress indicator for the checkout flow.
 * `steps`: array of labels. `current`: 0-based index of the active step.
 */
export default function CheckoutStepper({ steps = [], current = 0, className = "" }) {
  return (
    <ol className={`ui-stepper ${className}`.trim()}>
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <li className={`ui-stepper-step is-${state}`} key={label + i}>
            <span className="ui-stepper-dot">{i < current ? "✓" : i + 1}</span>
            <span className="ui-stepper-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

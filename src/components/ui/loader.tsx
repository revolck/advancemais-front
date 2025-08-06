import React from "react";

/**
 * Animated loader used while the application waits for API responses.
 * Styles are defined in `src/styles/components.css` under the `.adv-loader*` classes.
 */
export function Loader() {
  return (
    <div className="adv-loader-card">
      <div className="adv-loader">
        <p>Juntos, somos + </p>
        <div className="adv-loader-words">
          <span className="adv-loader-word">oportunidades</span>
          <span className="adv-loader-word">talentos</span>
          <span className="adv-loader-word">resultados</span>
          <span className="adv-loader-word">conhecimento</span>
          <span className="adv-loader-word">futuro</span>
          <span className="adv-loader-word">crescimento</span>
          <span className="adv-loader-word">transformação</span>
        </div>
      </div>
    </div>
  );
}

export default Loader;

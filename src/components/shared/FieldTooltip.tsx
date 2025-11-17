import { useState } from "react";
import "./FieldTooltip.css";

interface FieldTooltipProps {
  content: string;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  icon?: string;
}

const FieldTooltip: React.FC<FieldTooltipProps> = ({
  content,
  title,
  position = "top",
  children,
  icon = "ℹ️"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="field-tooltip-container">
      <span
        className="field-tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children || <span className="field-tooltip-icon">{icon}</span>}
      </span>

      {isVisible && (
        <div className={`field-tooltip-content ${position}`}>
          {title && <div className="field-tooltip-title">{title}</div>}
          <div className="field-tooltip-text">{content}</div>
        </div>
      )}
    </div>
  );
};

export default FieldTooltip;

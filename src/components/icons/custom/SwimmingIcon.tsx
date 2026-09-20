import React from "react";
import { CustomIconProps } from "./BadmintonIcon";

export const SwimmingIcon: React.FC<CustomIconProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="6" cy="11" r="2" />
    <path d="M10 13c1-2 3-3 5-3s4 1 5 3" />
    <path d="M8 15h6" />
    <path d="M2 17c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1 2.5-1 4-1 2.5 1 4 1" />
    <path d="M2 21c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1 2.5-1 4-1 2.5 1 4 1" />
  </svg>
);

export default SwimmingIcon;

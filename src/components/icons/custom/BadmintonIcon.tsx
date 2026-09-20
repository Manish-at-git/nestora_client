import React from "react";

export interface CustomIconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export const BadmintonIcon: React.FC<CustomIconProps> = ({
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
    <path d="M9 17a3 3 0 0 0 6 0Z" />
    <path d="M9 17L4 3l5 3 3-4 3 4 5-3-5 14" />
    <path d="M6 8h12" />
    <path d="M7.5 12h9" />
  </svg>
);

export default BadmintonIcon;

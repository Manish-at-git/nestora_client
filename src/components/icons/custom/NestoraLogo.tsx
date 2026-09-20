import React from "react";
import { CustomIconProps } from "./BadmintonIcon";

export const NestoraLogo: React.FC<CustomIconProps> = ({
  size = 28,
  color = "currentColor",
  className = "",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <rect width="32" height="32" rx="10" fill="#0F172A" />
    <path
      d="M9 22V10L16 17L23 10V22"
      stroke="#DDE7DE"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NestoraLogo;

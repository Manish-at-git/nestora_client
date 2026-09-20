import React from "react";
import { Icons, IconName, IconProps } from "./index";

export interface UnifiedIconProps extends Omit<IconProps, "name"> {
  name: IconName | string;
}

export const Icon: React.FC<UnifiedIconProps> = ({
  name,
  size = 20,
  color,
  className = "",
  strokeWidth = 2,
  style,
  ...props
}) => {
  if (!name) {
    const Fallback = Icons.LayoutGrid;
    return <Fallback size={size} color={color} className={className} strokeWidth={strokeWidth} style={style} {...props} />;
  }

  const strName = String(name).trim();

  // 1. Raw Inline SVG markup (<svg ...>...</svg>)
  if (strName.startsWith("<svg") || strName.includes("<svg")) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:stroke-current ${className}`}
        style={{ width: size, height: size, color, ...style }}
        dangerouslySetInnerHTML={{ __html: strName }}
        {...props}
      />
    );
  }

  // 2. SVG / Image URL (data:image/svg+xml, http://, https://, /uploads/, blob:)
  if (
    strName.startsWith("data:image/") ||
    strName.startsWith("http://") ||
    strName.startsWith("https://") ||
    strName.startsWith("blob:") ||
    strName.startsWith("/")
  ) {
    return (
      <img
        src={strName}
        alt=""
        className={`shrink-0 object-contain ${className}`}
        style={{ width: size, height: size, ...style }}
        {...props}
      />
    );
  }

  // 3. Registered Icon Name from Icons dictionary
  let IconComponent = Icons[name as IconName];

  // Case-insensitive fallback lookup
  if (!IconComponent) {
    const foundKey = Object.keys(Icons).find(
      (k) => k.toLowerCase() === strName.toLowerCase()
    );
    if (foundKey) {
      IconComponent = Icons[foundKey as IconName];
    }
  }

  // 4. Default Fallback Icon if not found
  if (!IconComponent) {
    IconComponent = Icons.LayoutGrid;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
      style={style}
      {...props}
    />
  );
};

export default Icon;

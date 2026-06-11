import React from "react";
import { A } from "../constants/assets";

export default function Icon({ name, alt = "", className = "", style = {}, tint = false, ...props }) {
  if (tint) {
    const iconUrl = `${A}${name}`;
    const combinedStyle = {
      display: "inline-block",
      backgroundColor: "currentColor",
      WebkitMask: `url(${iconUrl}) no-repeat center/contain`,
      mask: `url(${iconUrl}) no-repeat center/contain`,
      ...style
    };
    return (
      <span
        className={`icon ${className}`}
        style={combinedStyle}
        role="img"
        aria-label={alt || name}
        {...props}
      />
    );
  }
  return <img className={`icon ${className}`} src={`${A}${name}`} alt={alt} style={style} {...props} />;
}

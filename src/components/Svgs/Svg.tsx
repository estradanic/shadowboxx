import React, { ReactNode, ReactText } from "react";

export interface SvgProps {
  height: ReactText;
  children: ReactNode;
}

/** A component to display an SVG */
const Svg = ({ height, children }: SvgProps) => {
  return <div style={{ height }}>{children}</div>;
};

export default Svg;

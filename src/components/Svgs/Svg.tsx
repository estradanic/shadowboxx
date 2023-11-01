import React, { ReactNode, ReactText } from "react";

export interface SvgProps {
  height: ReactText;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** A component to display an SVG */
const Svg = ({ height, children, ...rest }: SvgProps) => <div {...rest} style={{ height }}>{children}</div>;

export default Svg;

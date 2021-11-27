import React, { ReactNode, ReactText } from "react";

export interface SvgProps {
  height: ReactText;
  children: ReactNode;
}

const Svg = ({ height, children }: SvgProps) => {
  return <div style={{ height }}>{children}</div>;
};

export default Svg;

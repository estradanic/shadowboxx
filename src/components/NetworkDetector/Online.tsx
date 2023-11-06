import React, { ReactNode } from "react";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";

export interface OnlineProps {
  /** Child node */
  children: ReactNode;
}

/** Component that only renders its children when online */
const Online = ({ children }: OnlineProps) => {
  const { online } = useNetworkDetectionContext();
  return <>{online && children}</>;
};

export default Online;

import React, { ReactNode } from "react";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";

export interface OfflineProps {
  /** Child node */
  children: ReactNode;
}

/** Component that only renders its children when offline */
const Offline = ({ children }: OfflineProps) => {
  const { online } = useNetworkDetectionContext();
  return <>{!online && children}</>;
};

export default Offline;

import React from "react";
import { useNetworkDetectionContext } from "../../contexts";

export interface OfflineProps {
  /** Child node */
  children: React.ReactNode;
}

/** Component that only renders its children when offline */
const Offline = ({ children }: OfflineProps) => {
  const { online } = useNetworkDetectionContext();
  return <>{!online && children}</>;
};

export default Offline;
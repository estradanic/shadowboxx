import React from "react";
import Skeleton, { SkeletonProps } from "./Skeleton";

export type AvatarSkeletonProps = Omit<
  SkeletonProps,
  "height" | "width" | "variant"
>;

const AvatarSkeleton = (props: AvatarSkeletonProps) => (
  <Skeleton {...props} variant="circle" height={40} width={40} />
);

export default AvatarSkeleton;

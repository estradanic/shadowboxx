import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import FancyTitleTypography, { FancyTitleTypographyProps } from "../Typography/FancyTitleTypography";

export interface FancyTitleTypographySkeletonProps extends Pick<FancyTitleTypographyProps, "outlineColor"> {}

const FancyTitleTypographySkeleton = ({outlineColor}: FancyTitleTypographySkeletonProps) => (
  <FancyTitleTypography outlineColor={outlineColor}>
    <Skeleton variant="text" width="20rem" />
  </FancyTitleTypography>
);

export default FancyTitleTypographySkeleton;

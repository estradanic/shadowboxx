import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import FancyTitleTypography, {
  FancyTitleTypographyProps,
} from "../Typography/FancyTitleTypography";
import Skeleton from "./Skeleton";

export interface FancyTitleTypographySkeletonProps
  extends Pick<FancyTitleTypographyProps, "outlineColor"> {}

const FancyTitleTypographySkeleton = ({
  outlineColor,
}: FancyTitleTypographySkeletonProps) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <FancyTitleTypography outlineColor={outlineColor}>
      <Skeleton variant="text" width={mobile ? "20vw" : "20rem"} />
    </FancyTitleTypography>
  );
};

export default FancyTitleTypographySkeleton;

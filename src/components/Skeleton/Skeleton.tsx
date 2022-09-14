import React from "react";
import MuiSkeleton, {
  SkeletonProps as MuiSkeletonProps,
} from "@material-ui/lab/Skeleton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";

export interface SkeletonProps extends MuiSkeletonProps {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.grey[200],
  },
}));

const Skeleton = ({ className, ...rest }: SkeletonProps) => {
  const classes = useStyles();

  return (
    <MuiSkeleton className={classNames(className, classes.root)} {...rest} />
  );
};

export default Skeleton;

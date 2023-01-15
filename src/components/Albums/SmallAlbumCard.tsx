import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { ParseAlbum, ParseImage } from "../../classes";
import { useNetworkDetectionContext } from "../../contexts";
import { useQueryConfigs } from "../../hooks";
import { VariableColor } from "../../types";
import { elide } from "../../utils";

interface UseStylesParams {
  borderColor: VariableColor;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: "flex",
    flexDirection: "row",
    height: theme.spacing(14),
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor ?? "primary"].dark}`,
    width: theme.spacing(60),
    maxWidth: "100%",
  },
  info: {
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: "auto",
  },
  coverImage: {
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: theme.spacing(14),
    marginLeft: "auto",
  },
}));

export interface SmallAlbumCardProps {
  /** The album to display */
  value: ParseAlbum;
  /** Border color for the card */
  borderColor: VariableColor;
  /** Function to run when card is clicked */
  onClick?: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void | Promise<void>;
  /** Custom css class */
  className?: string;
}

/** Component for displaying basic information about an album */
const SmallAlbumCard = ({
  value,
  borderColor,
  className,
  ...rest
}: SmallAlbumCardProps) => {
  const classes = useStyles({ borderColor });
  const { online } = useNetworkDetectionContext();
  const { getImageByIdQueryKey, getImageByIdFunction, getImageByIdOptions } =
    useQueryConfigs();
  const { data: coverImage } = useQuery<ParseImage, Error>(
    getImageByIdQueryKey(value.coverImage?.id ?? ""),
    () => getImageByIdFunction(online, value.coverImage?.id ?? ""),
    getImageByIdOptions({ enabled: !!value.coverImage?.id })
  );

  return (
    <Card {...rest} className={classNames(classes.card, className)}>
      <CardContent className={classes.info}>
        <Typography variant="h6">{value.name}</Typography>
        <Typography variant="body2">{elide(value.description, 100)}</Typography>
      </CardContent>
      <CardMedia
        className={classes.coverImage}
        src={coverImage?.fileMobile?.url()}
        component="img"
      />
    </Card>
  );
};

export default SmallAlbumCard;

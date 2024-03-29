import React, { MouseEvent } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { ParseAlbum } from "../../classes";
import { VariableColor } from "../../types";
import { elide } from "../../utils";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";

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
    margin: theme.spacing(0, 2),
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
  onClick?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
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
  const { getImageUrlFunction, getImageUrlOptions, getImageUrlQueryKey } =
    useQueryConfigs();
  const { data: imageUrl } = useQuery<string, Error>(
    getImageUrlQueryKey(value.coverImage?.id ?? "", "mobile"),
    () => getImageUrlFunction(value.coverImage?.id ?? "", "mobile"),
    getImageUrlOptions({ enabled: !!value.coverImage?.id })
  );

  return (
    <Card {...rest} className={classNames(classes.card, className)}>
      <CardContent className={classes.info}>
        <Typography variant="h6">{value.name}</Typography>
        <Typography variant="body2">{elide(value.description, 100)}</Typography>
      </CardContent>
      <CardMedia
        className={classes.coverImage}
        src={imageUrl}
        component="img"
      />
    </Card>
  );
};

export default SmallAlbumCard;

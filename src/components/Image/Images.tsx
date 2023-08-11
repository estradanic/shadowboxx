import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { SortDirection, VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import ImagesSkeleton from "../Skeleton/ImagesSkeleton";
import Image, { ImageProps } from "./Image";
import NoImages from "./NoImages";
import useImageStyles from "./useImageStyles";
import { TextField } from "../Field";
import { Button, IconButton } from "../Button";
import { Strings } from "../../resources";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
  buttonText: {
    padding: theme.spacing(2, 3),
    color: theme.palette.primary.contrastText,
    "&:hover,&:focus": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    "&:active": {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
    },
  },
  buttonContained: {
    padding: theme.spacing(2, 3),
    cursor: "default",
    "&,&:hover,&:focus,&:active": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  },
  firstButton: {
    marginRight: theme.spacing(1),
  },
  mobileButtons: {
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
}));

export type ImagesProps = {
  /** Images to show */
  images?: ParseImage[];
  /** React query status of images */
  status: "success" | "loading" | "error" | "refetching";
  /** Color of the borders of the images */
  outlineColor: VariableColor;
  /** Function to get ImageProps given a particulat image */
  getImageProps?: (image: ParseImage) => Promise<Partial<ImageProps>>;
} & (
  | {
      /** Direction the given images are sorted in */
      sortDirection: SortDirection;
      /** Function to set the sort direction */
      setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
    }
  | {
      /** Direction the given images are sorted in */
      sortDirection?: undefined;
      /** Function to set the sort direction */
      setSortDirection?: undefined;
    }
);

/** Component showing a list of images */
const Images = ({
  images,
  status,
  outlineColor,
  getImageProps,
  sortDirection,
  setSortDirection,
}: ImagesProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const [search, setSearch] = useState<string>("");
  const imageClasses = useImageStyles();
  const classes = useStyles();
  const [imageProps, setImageProps] = useState<
    Record<string, Partial<ImageProps>>
  >({});

  useEffect(() => {
    if (images) {
      images.forEach(async (image) => {
        if (getImageProps) {
          const newImageProps = await getImageProps(image);
          setImageProps((prev) => ({
            ...prev,
            [image.id]: newImageProps,
          }));
        }
      });
    }
  }, [images, getImageProps, setImageProps]);

  const filteredImages =
    images?.filter((image) => {
      if (!search) {
        return true;
      }
      const caption = imageProps[image.id]?.caption;
      if (!caption) {
        return false;
      }
      return caption.toLowerCase().includes(search.toLowerCase());
    }) ?? [];

  let content: React.ReactNode;
  if (status === "loading" || (!images && status !== "error")) {
    content = <ImagesSkeleton />;
  } else if (status === "error" || !filteredImages?.length) {
    content = <NoImages />;
  } else {
    content = (
      <>
        {filteredImages?.map((image) => (
          <Grid key={image.id} item xs={12} md={6} lg={4} xl={3}>
            <Image
              borderColor={outlineColor}
              parseImage={image}
              showFullResolutionOnClick={true}
              {...imageProps[image.id]}
            />
          </Grid>
        ))}
      </>
    );
  }

  return (
    <Grid item container className={imageClasses.imageContainer} xs={12}>
      <Grid
        xs={12}
        className={classes.toolbar}
        direction="row"
        justifyContent="space-between"
        item
        alignContent="flex-end"
        container
      >
        {!!sortDirection && (
          <Grid
            className={classNames({ [classes.mobileButtons]: xs })}
            item
            container
            xs={12}
            md={4}
            lg={3}
            xl={2}
          >
            <Button
              className={classes.firstButton}
              classes={{
                text: classes.buttonText,
                contained: classes.buttonContained,
              }}
              variant={sortDirection === "ascending" ? "contained" : "text"}
              onClick={() => setSortDirection("ascending")}
              size="large"
            >
              Ascending
            </Button>
            <Button
              classes={{
                text: classes.buttonText,
                contained: classes.buttonContained,
              }}
              variant={sortDirection === "descending" ? "contained" : "text"}
              onClick={() => setSortDirection("descending")}
              size="large"
            >
              Descending
            </Button>
          </Grid>
        )}
        <Grid item xs={12} md={4} lg={3} xl={2}>
          <TextField
            fullWidth
            InputProps={{
              endAdornment: !!search && (
                <IconButton
                  contrastText={false}
                  color="error"
                  onClick={() => setSearch("")}
                >
                  <CloseIcon />
                </IconButton>
              ),
            }}
            label={Strings.label.captionSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Grid>
      {content}
    </Grid>
  );
};

export default Images;

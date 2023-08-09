import React, {
  ImgHTMLAttributes,
  memo,
  useEffect,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import NotesIcon from "@material-ui/icons/Notes";
import Popper from "@material-ui/core/Popper";
import classNames from "classnames";
import { VariableColor } from "../../types";
import { ParseImage } from "../../classes";
import { opacity } from "../../utils";
import Tooltip from "../Tooltip/Tooltip";
import { ImageDecorationProps } from "./Decoration/ImageDecoration";
import Skeleton from "../Skeleton/Skeleton";
import { IMAGE_SKELETON_HEIGHT } from "../Skeleton/ImageSkeleton";
import Typography from "@material-ui/core/Typography";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useQuery } from "@tanstack/react-query";

interface UseStylesParams {
  borderColor: VariableColor;
  hasCaption: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    position: "relative",
  },
  rootNoPadding: {
    position: "relative",
  },
  image: {
    boxShadow: theme.shadows[5],
    display: "block",
    borderRadius: "4px",
    overflow: "hidden",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
    marginTop: "auto",
    marginBottom: "auto",
  },
  width100: {
    width: "100%",
  },
  pointer: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  fullResolution: {
    zIndex: theme.zIndex.modal,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2, 0),
    display: "flex",
    backgroundColor: opacity(theme.palette.background.default, 0.7),
    flexDirection: "column",
    overflowY: "auto",
  },
  fullResolutionImage: {
    borderRadius: "4px",
    overflow: "hidden",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
    maxWidth: "90vw",
    maxHeight: "90vh",
  },
  fullResolutionPicture: {
    margin: "auto",
    marginBottom: ({ hasCaption }: UseStylesParams) =>
      hasCaption ? 0 : "auto",
  },
  fullResolutionSkeleton: {
    "&&": {
      maxWidth: "600px",
    },
    margin: "auto",
  },
  displayNone: {
    display: "none",
  },
  caption: {
    color: theme.palette.text.primary,
    fontSize: "large",
    textAlign: "center",
    margin: "auto",
    marginTop: 0,
    backgroundColor: opacity(theme.palette.background.paper, 0.9),
    maxWidth: "90vw",
    width: "max-content",
    padding: theme.spacing(2),
    borderRadius: "4px",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor].dark}`,
  },
  captionIcon: {
    color: theme.palette.text.primary,
    fontSize: "large",
    marginRight: theme.spacing(1),
  },
}));

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** React key passed to parent div */
  key?: string;
  /** Image to display */
  parseImage: ParseImage;
  /** Array of ImageDecorations */
  decorations?: React.ReactElement<ImageDecorationProps<any>>[];
  /** CSS border color */
  borderColor?: VariableColor;
  /** Whether to show full resolution popup when the image is clicked */
  showFullResolutionOnClick?: boolean;
  /** Style variant */
  variant?: "bordered" | "contained" | "bordered-no-padding";
  /** Caption text */
  caption?: string;
  /** onClick handler */
  onClick?: (e: MouseEvent<HTMLVideoElement | HTMLImageElement>) => void;
};

/** Component showing an image in a pretty and functional way */
const Image = memo(
  ({
    className,
    key,
    decorations,
    borderColor = "primary",
    showFullResolutionOnClick,
    parseImage,
    variant = "bordered",
    onClick: piOnClick,
    caption,
    ...rest
  }: ImageProps) => {
    const classes = useStyles({ borderColor, hasCaption: !!caption });
    const { getImageUrlFunction, getImageUrlOptions, getImageUrlQueryKey } =
      useQueryConfigs();
    const { data: mobileUrl } = useQuery<string, Error>(
      getImageUrlQueryKey(parseImage.id, "mobile"),
      () => getImageUrlFunction(parseImage.id, "mobile"),
      getImageUrlOptions({
        enabled: !!parseImage.id && parseImage.type === "image",
      })
    );
    const { data: legacyUrl } = useQuery<string, Error>(
      getImageUrlQueryKey(parseImage.id, "legacy"),
      () => getImageUrlFunction(parseImage.id, "legacy"),
      getImageUrlOptions({
        enabled: !!parseImage.id && parseImage.type === "image",
      })
    );
    const { data: fullUrl } = useQuery<string, Error>(
      getImageUrlQueryKey(parseImage.id, "full"),
      () => getImageUrlFunction(parseImage.id, "full"),
      getImageUrlOptions({ enabled: !!parseImage.id })
    );
    if (variant === "contained") {
      classes.image = "";
      classes.pointer = "";
      classes.root = "";
    } else if (variant === "bordered-no-padding") {
      classes.root = classes.rootNoPadding;
    }
    const [fullResolutionOpen, setFullResolutionOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFullResolutionLoaded, setIsFullResolutionLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const onClick = (e: MouseEvent<HTMLImageElement | HTMLVideoElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (showFullResolutionOnClick) {
        setFullResolutionOpen(true);
      } else if (piOnClick) {
        piOnClick(e);
      }
    };

    const largeVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playbackTimeRef = useRef<number>(0);
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, []);
    useEffect(() => {
      if (!videoRef.current) {
        return;
      }
      if (
        fullResolutionOpen &&
        isFullResolutionLoaded &&
        largeVideoRef.current
      ) {
        videoRef.current.pause();
        largeVideoRef.current.currentTime = playbackTimeRef.current;
        if (isPlaying) {
          largeVideoRef.current.play();
        }
      } else if (!fullResolutionOpen) {
        videoRef.current.currentTime = playbackTimeRef.current;
        setIsFullResolutionLoaded(false);
        if (isPlaying) {
          videoRef.current.play();
        }
      }
    }, [isFullResolutionLoaded, fullResolutionOpen, isPlaying]);

    return (
      <div className={classNames(className, classes.root)} key={key} ref={ref}>
        <Tooltip title={parseImage.name}>
          {parseImage.type === "video" ? (
            <>
              <video
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                ref={videoRef}
                src={fullUrl}
                className={classNames(classes.image, classes.width100, {
                  [classes.pointer]: showFullResolutionOnClick,
                  [classes.displayNone]: !isLoaded,
                })}
                onLoadStart={() => setIsLoaded(true)}
                onClick={onClick}
                controls
                preload="metadata"
                onTimeUpdate={(e) =>
                  (playbackTimeRef.current = e.currentTarget.currentTime)
                }
              />
              {!isLoaded && (
                <Skeleton
                  variant="rect"
                  width="100%"
                  height={IMAGE_SKELETON_HEIGHT}
                />
              )}
            </>
          ) : (
            <>
              <picture
                className={classNames(classes.image, classes.width100, {
                  [classes.pointer]: showFullResolutionOnClick,
                  [classes.displayNone]: !isLoaded,
                })}
              >
                <source srcSet={mobileUrl} type="image/webp" />
                <source srcSet={legacyUrl} type="image/png" />
                <img
                  className={classes.width100}
                  onLoad={() => setIsLoaded(true)}
                  alt={parseImage.name}
                  src={legacyUrl}
                  onClick={onClick}
                  {...rest}
                />
              </picture>
              {!isLoaded && (
                <Skeleton
                  variant="rect"
                  width="100%"
                  height={IMAGE_SKELETON_HEIGHT}
                />
              )}
            </>
          )}
        </Tooltip>
        {decorations?.map((decoration, index) =>
          React.cloneElement(decoration, { key: `decoration${index}` })
        )}
        {showFullResolutionOnClick && (
          <Popper
            open={fullResolutionOpen}
            className={classes.fullResolution}
            onClick={() => setFullResolutionOpen(false)}
            anchorEl={ref.current}
          >
            {parseImage.type === "video" ? (
              <>
                <video
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) =>
                    (playbackTimeRef.current = e.currentTarget.currentTime)
                  }
                  ref={largeVideoRef}
                  src={fullUrl}
                  className={classNames(
                    classes.fullResolutionPicture,
                    classes.fullResolutionImage,
                    {
                      [classes.displayNone]: !isFullResolutionLoaded,
                    }
                  )}
                  onLoadStart={() => setIsFullResolutionLoaded(true)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (largeVideoRef.current?.paused) {
                      largeVideoRef.current?.play();
                    } else {
                      largeVideoRef.current?.pause();
                    }
                  }}
                  controls
                  preload="metadata"
                />
                {!isLoaded && (
                  <Skeleton
                    variant="rect"
                    width="100%"
                    height={IMAGE_SKELETON_HEIGHT}
                  />
                )}
              </>
            ) : (
              <picture
                className={classNames(classes.fullResolutionPicture, {
                  [classes.displayNone]: !isFullResolutionLoaded,
                })}
              >
                <source srcSet={fullUrl} type="image/webp" />
                <source srcSet={legacyUrl} type="image/png" />
                <img
                  className={classes.fullResolutionImage}
                  alt={parseImage.name}
                  onLoad={() => setIsFullResolutionLoaded(true)}
                  src={legacyUrl}
                />
              </picture>
            )}
            <Typography
              className={classNames(classes.caption, {
                [classes.displayNone]:
                  !isFullResolutionLoaded ||
                  (!caption && !parseImage.dateTaken),
              })}
            >
              <NotesIcon className={classes.captionIcon} />
              {`${
                caption ? caption : ""
              } ${parseImage.dateTaken.toLocaleDateString()}`}
            </Typography>
            {!isFullResolutionLoaded && (
              <Skeleton
                variant="rect"
                width="90vw"
                height="90vh"
                className={classNames(
                  classes.fullResolutionImage,
                  classes.fullResolutionSkeleton
                )}
              />
            )}
          </Popper>
        )}
      </div>
    );
  }
);

export default Image;

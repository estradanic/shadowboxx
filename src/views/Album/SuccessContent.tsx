import React, { useCallback } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { Route, Routes, useSearchParams } from "react-router-dom";
import ParseAlbum from "../../cloud/shared/classes/ParseAlbum";
import Fab from "../../components/Button/Fab";
import Images from "../../components/Image/Images";
import Timeline from "../../components/Image/Timeline";
import Online from "../../components/NetworkDetector/Online";
import {
  FancyTitleTypography,
  FancyTypography,
} from "../../components/Typography";
import { Strings } from "../../resources";
import VariableColor from "../../types/VariableColor";
import EditIcon from "@material-ui/icons/Edit";
import { ParseImage } from "../../classes";
import OwnerImageDecoration from "../../components/Image/Decoration/OwnerImageDecoration";
import ShareImageDecoration from "../../components/Image/Decoration/ShareImageDecoration";
import FilterBar from "../../components/FilterBar/FilterBar";
import useFilterBar from "../../components/FilterBar/useFilterBar";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";
import EditingContent from "./EditingContent";
import useNavigate from "../../hooks/useNavigate";

type UseStylesParams = {
  randomColor: VariableColor;
};

const useStyles = makeStyles((theme: Theme) => ({
  controls: {
    marginTop: theme.spacing(4),
  },
  switchText: {
    fontSize: "x-large",
  },
  switchBase: {
    "&&": {
      color: ({ randomColor }: UseStylesParams) =>
        theme.palette[randomColor ?? "primary"].light,
    },
  },
  switchChecked: {},
  switchTrack: {
    "&&&": {
      backgroundColor: ({ randomColor }: UseStylesParams) =>
        theme.palette[randomColor ?? "primary"].dark,
      opacity: 1,
    },
  },
}));

type SuccessContentProps = {
  album: ParseAlbum;
  randomColor: VariableColor;
};

const SuccessContent = ({ album, randomColor }: SuccessContentProps) => {
  const navigate = useNavigate();
  const classes = useStyles({ randomColor });
  const [search, setSearch] = useSearchParams();
  const timelineView = search.get("timeline") === "true";
  const { online } = useNetworkDetectionContext();

  const {
    getTagsByImageIdFunction,
    getTagsByImageIdOptions,
    getTagsByImageIdQueryKey,
  } = useQueryConfigs();
  const {
    getImagesByIdInfiniteFunction,
    getImagesByIdInfiniteQueryKey,
    getImagesByIdInfiniteOptions,
  } = useInfiniteQueryConfigs();

  const {
    sortDirection,
    debouncedCaptionSearch,
    tagSearch,
    ...restFilterBarProps
  } = useFilterBar();
  const { data: tags } = useQuery<string[], Error>(
    getTagsByImageIdQueryKey(album.images),
    () => getTagsByImageIdFunction(album.images),
    getTagsByImageIdOptions()
  );

  const {
    data,
    status: imagesStatus,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery<ParseImage[], Error>(
    getImagesByIdInfiniteQueryKey(album.images ?? [], {
      sortDirection,
      captionSearch: debouncedCaptionSearch,
      captions: album.captions,
      tagSearch,
    }),
    ({ pageParam: page = 0 }) =>
      getImagesByIdInfiniteFunction(
        online,
        album.images,
        {
          sortDirection,
          captionSearch: debouncedCaptionSearch,
          captions: album.captions,
          tagSearch,
        },
        {
          showErrorsInSnackbar: true,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        }
      ),
    getImagesByIdInfiniteOptions({ enabled: !!album.images })
  );

  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });

  const getImageDecorations = useCallback(
    async (image: ParseImage) => {
      if (timelineView) {
        return [];
      }
      return [
        <OwnerImageDecoration
          UserAvatarProps={{
            UseUserInfoParams: { userPointer: image.owner },
          }}
        />,
        <ShareImageDecoration image={image} />,
      ];
    },
    [timelineView]
  );

  const getImageCaption = useCallback(
    async (image: ParseImage) => {
      return album.captions?.[image.objectId] ?? "";
    },
    [album.captions]
  );

  const getImageProps = useCallback(
    async (image: ParseImage) => {
      const decorations = await getImageDecorations(image);
      const caption = await getImageCaption(image);
      return {
        decorations,
        caption,
      };
    },
    [getImageDecorations, getImageCaption]
  );

  const images = useFlatInfiniteQueryData(data);

  const filterBar = (
    <FilterBar
      tagSearch={tagSearch}
      sortDirection={sortDirection}
      tagOptions={tags}
      {...restFilterBarProps}
    />
  );

  return (
    <Routes>
      <Route
        path="edit"
        element={
          <EditingContent
            images={images} // Not updating, unfortunately
            album={album}
            filterBarProps={{
              tagSearch,
              sortDirection,
              tagOptions: tags,
              ...restFilterBarProps,
            }}
          />
        }
      />
      <Route
        path="/"
        element={
          <>
            <Grid item sm={8}>
              <FancyTitleTypography outlineColor={randomColor}>
                {album.name}
              </FancyTitleTypography>
            </Grid>
            <Grid item sm={8} className={classes.controls}>
              <FormControlLabel
                control={
                  <Switch
                    classes={{
                      switchBase: classes.switchBase,
                      checked: classes.switchChecked,
                      track: classes.switchTrack,
                    }}
                    checked={!!timelineView}
                    onClick={() =>
                      setSearch({ timeline: timelineView ? "false" : "true" })
                    }
                  />
                }
                label={
                  <FancyTypography className={classes.switchText}>
                    {Strings.label.timelineView}
                  </FancyTypography>
                }
              />
            </Grid>
            {timelineView ? (
              <Timeline
                filterBar={filterBar}
                getImageProps={getImageProps}
                status={isRefetching ? "refetching" : imagesStatus}
                images={images}
                outlineColor={randomColor}
              />
            ) : (
              <Images
                filterBar={filterBar}
                getImageProps={getImageProps}
                status={isRefetching ? "refetching" : imagesStatus}
                images={images}
                outlineColor={randomColor}
                albumId={album.objectId}
              />
            )}
            <Online>
              <Fab onClick={() => navigate("edit")}>
                <EditIcon />
              </Fab>
            </Online>
          </>
        }
      />
    </Routes>
  );
};

export default SuccessContent;

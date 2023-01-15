import React, { memo, useLayoutEffect, useMemo, useState } from "react";
import {
  FancyTypography,
  NoImages,
  Online,
  PageContainer,
  useSnackbar,
} from "../../components";
import { useView } from "../View";
import { get, del, createStore } from "idb-keyval";
import {
  useInfiniteQueryConfigs,
  useInfiniteScroll,
  useRandomColor,
  useVirtualList,
} from "../../hooks";
import { ParseAlbum } from "../../classes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { ImageContextProvider, useImageContext, useNetworkDetectionContext } from "../../contexts";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Strings } from "../../resources";
import SmallAlbumCard from "../../components/Albums/SmallAlbumCard";
import { Offline } from "react-detect-offline";
import SmallAlbumCardSkeleton from "../../components/Skeleton/SmallAlbumCardSkeleton";
import NoAlbums from "../../components/Albums/NoAlbums";
import NoConnection from "../../components/NetworkDetector/NoConnection";

const useStyles = makeStyles(() => ({
  title: {
    marginRight: "auto",
  },
  albumsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  noAlbumsContainer: {
    textAlign: "center",
  },
  noAlbums: {
    fontSize: "medium",
  },
  card: {
    cursor: "pointer",
  },
}));

const shareTargetStore = createStore("SHARE_TARGET", "SHARE_TARGET");

interface AlbumsListProps {
  albums: ParseAlbum[];
  classes: ReturnType<typeof useStyles>;
  files: File[];
}

const AlbumsList = ({albums, classes, files}: AlbumsListProps) => {
  const { virtualized: virtualizedAlbums } = useVirtualList({
    list: albums,
    interval: 10,
    enabled: !!albums?.length,
  });
  const borderColor = useRandomColor();
  const {uploadImagesFromFiles} = useImageContext();
  const {enqueueErrorSnackbar} = useSnackbar();

  return (
    <>
      <FancyTypography variant="h3">
        {Strings.shareTargetTitle(files.length)}
      </FancyTypography>
      <br />
      <Grid item spacing={2} container className={classes.albumsContainer}>
        {virtualizedAlbums.map((album) => (
          <Grid item key={album.id}>
            <SmallAlbumCard
              className={classes.card}
              borderColor={borderColor}
              value={album}
              onClick={async () => {
                try {
                  const images = (await uploadImagesFromFiles(files)).map((image) => image.id!);
                  album.update({
                    ...album.attributes,
                    images: [...album.images, ...images],
                  }, {addedImages: images})
                } catch (e) {
                  enqueueErrorSnackbar(Strings.commonError());
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const Share = memo(() => {
  useView("Share");

  const classes = useStyles();
  const { online } = useNetworkDetectionContext();
  const [files, setFiles] = useState<File[]>([new File([], "file1")]);
  const {
    getAllModifyableAlbumsInfiniteFunction,
    getAllModifyableAlbumsInfiniteOptions,
    getAllModifyableAlbumsInfiniteQueryKey,
  } = useInfiniteQueryConfigs();
  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<
    ParseAlbum[],
    Error
  >(
    getAllModifyableAlbumsInfiniteQueryKey(),
    ({ pageParam: page = 0 }) =>
      getAllModifyableAlbumsInfiniteFunction(online, {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getAllModifyableAlbumsInfiniteOptions()
  );

  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const albums = useMemo(
    () => data?.pages?.flatMap((page) => page) ?? [],
    [data?.pages]
  );

  useLayoutEffect(() => {
    get("files", shareTargetStore).then((files: File[]) => {
      setFiles(files);
      del("files", shareTargetStore);
    });
  }, [setFiles]);

  return (
    <PageContainer>
      <Online>
        {files?.length ? (
          <>
            {status === "success" && !!albums.length ? (
              <ImageContextProvider>
                <AlbumsList files={files} albums={albums} classes={classes} />
              </ImageContextProvider>
            ) : (
              <>
                {status === "success" || status === "error" ? (
                  <NoAlbums />
                ) : (
                  <Grid
                    item
                    spacing={2}
                    container
                    className={classes.albumsContainer}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Grid key={i} item xs={12} md={6} lg={4} xl={3}>
                        <SmallAlbumCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </>
        ) : (
          <NoImages text={Strings.noImagesSelected()} />
        )}
      </Online>
      <Offline>
        <NoConnection />
      </Offline>
    </PageContainer>
  );
});

export default Share;

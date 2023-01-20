import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
import {
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_KEY,
  SHARE_TARGET_STORE_NAME,
} from "../../serviceWorker/sharedExports";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import {
  ImageContextProvider,
  useImageContext,
  useNetworkDetectionContext,
} from "../../contexts";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Strings } from "../../resources";
import SmallAlbumCard from "../../components/Albums/SmallAlbumCard";
import { Offline } from "react-detect-offline";
import SmallAlbumCardSkeleton from "../../components/Skeleton/SmallAlbumCardSkeleton";
import NoAlbums from "../../components/Albums/NoAlbums";
import NoConnection from "../../components/NetworkDetector/NoConnection";
import { useGlobalLoadingStore } from "../../stores";

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

const shareTargetStore = createStore(
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_NAME
);

interface AlbumsListProps {
  albums: ParseAlbum[];
  classes: ReturnType<typeof useStyles>;
  files: File[];
}

const AlbumsToShareTo = ({ albums, classes, files }: AlbumsListProps) => {
  const virtualizedAlbums = useVirtualList(albums);
  const borderColor = useRandomColor();
  const { uploadImagesFromFiles } = useImageContext();
  const { enqueueErrorSnackbar } = useSnackbar();

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
                  const images = (await uploadImagesFromFiles(files)).map(
                    (image) => image.id
                  );
                  album.update(
                    {
                      ...album.attributes,
                      images: [...album.images, ...images],
                    },
                    { addedImages: images }
                  );
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
  const [sharedFiles, setSharedFiles] = useState<File[]>([]);
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
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore();
  const { enqueueErrorSnackbar } = useSnackbar();
  const initialized = useRef(false);

  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });
  const albums = useMemo(
    () => data?.pages?.flatMap((page) => page) ?? [],
    [data?.pages]
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    navigator.serviceWorker.ready.then((registration) =>
      registration.active?.postMessage(SHARE_TARGET_STORE_KEY)
    );
    startGlobalLoader({
      type: "indeterminate",
      content: (
        <FancyTypography variant="loading">
          {Strings.loadingSharedImages()}
        </FancyTypography>
      ),
    });
    let count = 0;
    let getting = false;
    const timer = setInterval(() => {
      if (getting) {
        return;
      }
      count++;
      getting = true;
      get(SHARE_TARGET_STORE_KEY, shareTargetStore)
        .then(async (files: File[]) => {
          if (!files) {
            return;
          }
          setSharedFiles(files);
          await del("files", shareTargetStore);
          clearInterval(timer);
          stopGlobalLoader();
        })
        .catch((error: any) => {
          console.warn(error);
        })
        .finally(() => {
          getting = false;
        });
      if (count > 9) {
        enqueueErrorSnackbar(Strings.noImagesSelected());
        clearInterval(timer);
        stopGlobalLoader();
        setFailed(true);
      }
    }, 500);
  }, [
    setSharedFiles,
    startGlobalLoader,
    stopGlobalLoader,
    enqueueErrorSnackbar,
  ]);

  return (
    <PageContainer>
      <Online>
        {sharedFiles?.length ? (
          <>
            {status === "success" && !!albums.length ? (
              <ImageContextProvider>
                <AlbumsToShareTo
                  files={sharedFiles}
                  albums={albums}
                  classes={classes}
                />
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
          failed && <NoImages text={Strings.noImagesSelected()} />
        )}
      </Online>
      <Offline>
        <NoConnection />
      </Offline>
    </PageContainer>
  );
});

export default Share;

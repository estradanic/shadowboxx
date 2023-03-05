import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { get, del, createStore } from "idb-keyval";
import { useInfiniteQuery } from "@tanstack/react-query";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import {
  FancyTypography,
  NoImages,
  Offline,
  Online,
  PageContainer,
  useSnackbar,
  SmallAlbumCard,
  SmallAlbumCardSkeleton,
  NoAlbums,
  NoConnection,
} from "../../components";
import { useView } from "../View";
import { ParseAlbum } from "../../classes";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { Strings } from "../../resources";
import { useGlobalLoadingStore } from "../../stores";
import routes from "../../app/routes";
import {
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_KEY,
  SHARE_TARGET_STORE_NAME,
} from "../../serviceWorker/sharedExports";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import { useNavigate } from "react-router-dom";
import useRandomColor from "../../hooks/useRandomColor";
import useVirtualList from "../../hooks/useVirtualList";
import {
  ImageContextProvider,
  useImageContext,
} from "../../contexts/ImageContext";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";

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
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const navigate = useNavigate();

  return (
    <>
      <FancyTypography variant="h3">
        {Strings.message.shareTargetTitle(files.length)}
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
                  const newAlbum = await album.update(
                    {
                      ...album.attributes,
                      images: [...album.images, ...images],
                    },
                    { addedImages: images }
                  );
                  enqueueSuccessSnackbar(Strings.success.saved);
                  navigate(routes.Album.path.replace(":id", newAlbum.id));
                } catch (e) {
                  console.error(e);
                  enqueueErrorSnackbar(Strings.error.editingAlbum);
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
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
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
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage(SHARE_TARGET_STORE_KEY);
    });
    startGlobalLoader({
      type: "indeterminate",
      content: (
        <FancyTypography variant="loading">
          {Strings.message.loadingSharedImages}
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
        enqueueErrorSnackbar(Strings.message.noImagesSelected);
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
                      <Grid
                        key={`skeleton-${i}`}
                        item
                        xs={12}
                        md={6}
                        lg={4}
                        xl={3}
                      >
                        <SmallAlbumCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </>
        ) : (
          failed && <NoImages text={Strings.message.noImagesSelected} />
        )}
      </Online>
      <Offline>
        <NoConnection />
      </Offline>
    </PageContainer>
  );
});

export default Share;

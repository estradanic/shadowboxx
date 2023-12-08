import React, { memo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import { useInfiniteQuery } from "@tanstack/react-query";
import CloseIcon from "@material-ui/icons/Close";
import {
  PageContainer,
  AlbumCard,
  AlbumCardSkeleton,
  Fab,
  Online,
  Button,
  TextField,
  IconButton,
} from "../../components";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../classes";
import { useView } from "../View";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import NoAlbums from "../../components/Albums/NoAlbums";
import useRandomColor from "../../hooks/useRandomColor";
import useFlatInfiniteQueryData from "../../hooks/Query/useFlatInfiniteQueryData";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { OwnershipFilter, SortDirection } from "../../types";
import { useDebounce } from "use-debounce";
import useNavigate from "../../hooks/useNavigate";

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginRight: "auto",
  },
  toolbar: {
    marginBottom: theme.spacing(6),
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
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
  buttonText: {
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
    cursor: "default",
    "&,&:hover,&:focus,&:active": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  },
  button: {
    flexGrow: 1,
  },
  controlGrid: {
    padding: theme.spacing(0, 1),
    gap: theme.spacing(0.5),
    minHeight: theme.spacing(7),
    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(1),
    },
  },
  spacer: {
    width: "4rem",
  },
}));

/** Home page. Displays a list of albums */
const Home = memo(() => {
  useView("Home");

  const classes = useStyles();
  const {
    getAllAlbumsInfiniteFunction,
    getAllAlbumsInfiniteQueryKey,
    getAllAlbumsInfiniteOptions,
  } = useInfiniteQueryConfigs();
  const { online } = useNetworkDetectionContext();
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [nameDescriptionSearch, setNameDescriptionSearch] = useState("");
  const [debouncedSearch] = useDebounce(nameDescriptionSearch, 300);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchAlbums,
  } = useInfiniteQuery<ParseAlbum[], Error>(
    getAllAlbumsInfiniteQueryKey({
      sortDirection,
      ownership,
      nameDescriptionSearch: debouncedSearch,
    }),
    ({ pageParam: page = 0 }) =>
      getAllAlbumsInfiniteFunction(
        online,
        { sortDirection, ownership, nameDescriptionSearch },
        {
          showErrorsInSnackbar: true,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        }
      ),
    getAllAlbumsInfiniteOptions()
  );
  useInfiniteScroll(fetchNextPage, { canExecute: !isFetchingNextPage });

  const albums = useFlatInfiniteQueryData(data);

  const randomColor = useRandomColor();

  const navigate = useNavigate();

  return (
    <PageContainer>
      <Grid
        item
        container
        xs={12}
        className={classes.toolbar}
        justifyContent="space-between"
      >
        <Grid
          className={classes.controlGrid}
          item
          xs={12}
          sm={4}
          container
          justifyContent="flex-start"
        >
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={sortDirection === "descending" ? "contained" : "text"}
            onClick={() => setSortDirection("descending")}
          >
            {Strings.label.descending}
          </Button>
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={sortDirection === "ascending" ? "contained" : "text"}
            onClick={() => setSortDirection("ascending")}
          >
            {Strings.label.ascending}
          </Button>
        </Grid>
        <Grid
          className={classes.controlGrid}
          item
          xs={12}
          sm={4}
          container
          justifyContent="center"
        >
          <TextField
            fullWidth
            label="Search"
            value={nameDescriptionSearch}
            onChange={(e) => setNameDescriptionSearch(e.target.value)}
            InputProps={{
              endAdornment: !!nameDescriptionSearch && (
                <IconButton
                  contrastText={false}
                  color="error"
                  onClick={() => setNameDescriptionSearch("")}
                >
                  <CloseIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
        <Grid
          className={classes.controlGrid}
          item
          xs={12}
          sm={4}
          container
          justifyContent="flex-end"
        >
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={ownership === "all" ? "contained" : "text"}
            onClick={() => setOwnership("all")}
          >
            {Strings.label.all}
          </Button>
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={ownership === "mine" ? "contained" : "text"}
            onClick={() => setOwnership("mine")}
          >
            {Strings.label.mine}
          </Button>
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={ownership === "shared" ? "contained" : "text"}
            onClick={() => setOwnership("shared")}
          >
            {Strings.label.shared}
          </Button>
        </Grid>
      </Grid>
      {status === "success" && !!albums.length ? (
        <Grid item spacing={2} container className={classes.albumsContainer}>
          {albums.map((album) => (
            <Grid key={album?.name} item xs={12} md={6} lg={4} xl={3}>
              <AlbumCard
                borderColor={randomColor}
                onChange={async (_) => {
                  await refetchAlbums();
                }}
                value={album}
              />
            </Grid>
          ))}
        </Grid>
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
                <Grid key={`skeleton-${i}`} item xs={12} md={6} lg={4} xl={3}>
                  <AlbumCardSkeleton />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      <Online>
        <Fab onClick={() => navigate("/album/new")}>
          <AddIcon />
        </Fab>
      </Online>
    </PageContainer>
  );
});

export default Home;

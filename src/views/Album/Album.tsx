import React, { memo } from "react";
import { BackButton, PageContainer } from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ParseAlbum, UnpersistedParseAlbum } from "../../classes";
import { Void } from "../../components";
import { useView } from "../View";
import useRandomColor from "../../hooks/useRandomColor";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import LoadingContent from "./LoadingContent";
import SuccessContent from "./SuccessContent";
import { useUserContext } from "../../contexts/UserContext";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

/**
 * Page for viewing an album
 */
const Album = memo(() => {
  useView("Album");
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state: { previousLocation?: Location } };
  const randomColor = useRandomColor();
  const classes = useStyles({ randomColor });
  const { online } = useNetworkDetectionContext();
  const { getLoggedInUser } = useUserContext();
  const { getAlbumFunction, getAlbumQueryKey, getAlbumOptions } =
    useQueryConfigs();

  const isNew = id === "new";
  const newAlbum = new UnpersistedParseAlbum({
    owner: getLoggedInUser().toPointer(),
    images: [],
    name: Strings.label.untitledAlbum,
    collaborators: [],
    viewers: [],
    captions: {},
  });
  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(online, id, { showErrorsInSnackbar: true }),
    getAlbumOptions({
      enabled: !isNew,
      placeholderData: isNew ? newAlbum : undefined,
    })
  );

  return (
    <PageContainer>
      {albumStatus === "loading" ? (
        <LoadingContent randomColor={randomColor} />
      ) : albumStatus === "success" && album ? (
        <SuccessContent isNew={isNew} album={album} randomColor={randomColor} />
      ) : (
        <Grid item className={classes.svgContainer}>
          <Void height="40vh" />
          <br />
          <Typography className={classes.svgText} variant="overline">
            {Strings.error.albumNotFound()}
          </Typography>
          <br />
          {!!location.state?.previousLocation && (
            <BackButton color="inherit" placement="body" variant="text" />
          )}
        </Grid>
      )}
    </PageContainer>
  );
});

export default Album;

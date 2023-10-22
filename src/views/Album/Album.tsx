import React, { memo } from "react";
import {
  BackButton,
  PageContainer,
} from "../../components";
import { useLocation, useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { ParseAlbum } from "../../classes";
import { Void } from "../../components";
import { useView } from "../View";
import useRandomColor from "../../hooks/useRandomColor";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import LoadingContent from "./LoadingContent";
import SuccessContent from "./SuccessContent";

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
  const {
    getAlbumFunction,
    getAlbumQueryKey,
    getAlbumOptions,
  } = useQueryConfigs();

  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(online, id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );

  return (
    <PageContainer>
      {albumStatus === "loading" ? (
        <LoadingContent randomColor={randomColor} />
      ) : albumStatus === "success" && album ? (
        <SuccessContent album={album} randomColor={randomColor} />
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

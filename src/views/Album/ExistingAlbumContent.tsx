import React, { memo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import useRandomColor from "../../hooks/useRandomColor";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useQuery } from "@tanstack/react-query";
import { ParseAlbum } from "../../classes";
import LoadingContent from "./LoadingContent";
import SuccessContent from "./SuccessContent";
import Void from "../../components/Svgs/Void";
import Typography from "../../components/Typography/Typography";
import Grid from "@material-ui/core/Grid";
import { Strings } from "../../resources";
import BackButton from "../../components/Button/BackButton";

const useStyles = makeStyles(() => ({
  svgContainer: {
    textAlign: "center",
  },
  svgText: {
    fontSize: "medium",
  },
}));

const ExistingAlbumContent = memo(() => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state: { previousLocation?: Location } };
  const randomColor = useRandomColor();
  const classes = useStyles({ randomColor });
  const { online } = useNetworkDetectionContext();
  const { getAlbumFunction, getAlbumQueryKey, getAlbumOptions } =
    useQueryConfigs();

  const { data: album, status: albumStatus } = useQuery<ParseAlbum, Error>(
    getAlbumQueryKey(id),
    () => getAlbumFunction(online, id, { showErrorsInSnackbar: true }),
    getAlbumOptions()
  );

  return (
    <>
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
    </>
  );
});

export default ExistingAlbumContent;

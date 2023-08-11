import React from "react";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import useFilterBar from "./useFilterBar";
import { Button, IconButton } from "../Button";
import { TextField } from "../Field";
import { Strings } from "../../resources";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import classNames from "classnames";

export interface FilterBarProps extends ReturnType<typeof useFilterBar> {
  /** Whether to show the sort direction buttons */
  showSortDirection?: boolean;
  /** Whether to show the caption search */
  showCaptionSearch?: boolean;
}

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

const FilterBar = ({
  sortDirection,
  setSortDirection,
  captionSearch,
  setCaptionSearch,
  showSortDirection = true,
  showCaptionSearch = true,
}: FilterBarProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <Grid
      xs={12}
      className={classes.toolbar}
      direction="row"
      justifyContent="space-between"
      item
      alignContent="flex-end"
      container
    >
      {!!showSortDirection && (
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
      {!!showCaptionSearch && (
        <Grid item xs={12} md={4} lg={3} xl={2}>
          <TextField
            fullWidth
            InputProps={{
              endAdornment: !!captionSearch && (
                <IconButton
                  contrastText={false}
                  color="error"
                  onClick={() => setCaptionSearch("")}
                >
                  <CloseIcon />
                </IconButton>
              ),
            }}
            label={Strings.label.captionSearch}
            value={captionSearch}
            onChange={(e) => setCaptionSearch(e.target.value)}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default FilterBar;

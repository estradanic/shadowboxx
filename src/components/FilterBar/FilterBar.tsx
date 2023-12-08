import React, { useState, KeyboardEvent } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import useFilterBar from "./useFilterBar";
import { Button, IconButton } from "../Button";
import { TextField } from "../Field";
import { Strings } from "../../resources";
import Tag from "../Tag/Tag";
import { dedupe } from "../../utils";

export interface FilterBarProps
  extends Omit<ReturnType<typeof useFilterBar>, "debouncedCaptionSearch"> {
  /** Whether to show the sort direction buttons */
  showSortDirection?: boolean;
  /** Whether to show the caption search */
  showCaptionSearch?: boolean;
  /** Whether to show the tag search */
  showTagSearch?: boolean;
  /** Options for the tag field */
  tagOptions?: string[];
}

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
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
    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(1),
    },
  },
}));

/** Component to handle filter state for images */
const FilterBar = ({
  sortDirection,
  setSortDirection,
  captionSearch,
  setCaptionSearch,
  tagSearch,
  setTagSearch,
  showSortDirection = true,
  showCaptionSearch = true,
  showTagSearch = true,
  tagOptions = [],
}: FilterBarProps) => {
  const classes = useStyles();
  const [tagSearchInputValue, setTagSearchInputValue] = useState("");

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
      case ",":
      case "Tab": {
        if (tagSearchInputValue.length > 0) {
          setTagSearch(tagSearch.concat([tagSearchInputValue]));
          setTagSearchInputValue("");
        }
        if (event.key !== "Tab") {
          event.preventDefault();
        }
        break;
      }
      default:
    }
  };

  return (
    <Grid
      xs={12}
      className={classes.toolbar}
      justifyContent="space-between"
      item
      alignContent="flex-end"
      container
    >
      {!!showSortDirection && (
        <Grid
          className={classes.controlGrid}
          item
          container
          xs={12}
          md={4}
          xl={3}
        >
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={sortDirection === "ascending" ? "contained" : "text"}
            onClick={() => setSortDirection("ascending")}
            size="large"
          >
            {Strings.label.ascending}
          </Button>
          <Button
            classes={{
              text: classes.buttonText,
              contained: classes.buttonContained,
              root: classes.button,
            }}
            variant={sortDirection === "descending" ? "contained" : "text"}
            onClick={() => setSortDirection("descending")}
            size="large"
          >
            {Strings.label.descending}
          </Button>
        </Grid>
      )}
      {!!showCaptionSearch && (
        <Grid item xs={12} md={4} lg={3} xl={3} className={classes.controlGrid}>
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
      {!!showTagSearch && (
        <Grid item xs={12} md={4} lg={3} xl={3} className={classes.controlGrid}>
          <Autocomplete<string, true, false, true>
            options={dedupe([...tagOptions, "video", "image", "gif"])}
            value={tagSearch}
            fullWidth
            multiple
            freeSolo
            inputValue={tagSearchInputValue}
            filterSelectedOptions
            disableCloseOnSelect
            getOptionSelected={(option) => {
              if (
                ["video", "image", "gif"].includes(option) &&
                (tagSearch.includes("video") ||
                  tagSearch.includes("image") ||
                  tagSearch.includes("gif"))
              ) {
                return true;
              }
              return tagSearch.includes(option);
            }}
            onInputChange={(_, newInputValue) => {
              if (newInputValue.endsWith(" ") || newInputValue.endsWith(",")) {
                setTagSearch(
                  tagSearch.concat([
                    newInputValue.substring(0, newInputValue.length - 1),
                  ])
                );
                setTagSearchInputValue("");
              } else {
                setTagSearchInputValue(newInputValue);
              }
            }}
            onChange={(_, newTags) => {
              setTagSearch(newTags);
            }}
            renderInput={(props) => (
              <TextField
                {...props}
                InputProps={{
                  ...props.InputProps,
                  endAdornment: !!tagSearch.length && (
                    <IconButton
                      contrastText={false}
                      color="error"
                      onClick={() => setTagSearch([])}
                    >
                      <CloseIcon />
                    </IconButton>
                  ),
                }}
                label={Strings.label.tagSearch}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  if (tagSearchInputValue.length > 0) {
                    setTagSearch(tagSearch.concat([tagSearchInputValue]));
                    setTagSearchInputValue("");
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) => {
              return value.map((option, index) => (
                <Tag label={option} {...getTagProps({ index })} key={index} />
              ));
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default FilterBar;

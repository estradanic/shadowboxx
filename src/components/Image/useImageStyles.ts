import { makeStyles, Theme } from "@material-ui/core/styles";

const useImageStyles = makeStyles((theme: Theme) => ({
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(7),
  },
  unselected: {
    margin: theme.spacing(1),
    "& picture, & video": {
      opacity: 0.3,
    },
    cursor: "pointer",
  },
  selected: {
    cursor: "pointer",
    margin: theme.spacing(1),
    "& > *": {
      opacity: 0.9,
    },
    backgroundColor: theme.palette.success.light,
  },
}));

export default useImageStyles;

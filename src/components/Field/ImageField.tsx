import React, {useState} from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Fab,
  Grid,
  Paper,
  InputBase,
  Divider,
  IconButton,
} from "@material-ui/core";
import {Search, AddPhotoAlternate, Close} from "@material-ui/icons";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: theme.spacing(62.5),
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  input: {
    display: "none",
  },
  button: {
    color: theme.palette.primary.main,
    margin: theme.spacing(1.25),
  },
  secondaryButton: {
    color: theme.palette.primary.light,
    margin: theme.spacing(1.25),
  },
  searchRoot: {
    padding: theme.spacing(0.25, 0.5),
    display: "flex",
    alignItems: "center",
    width: theme.spacing(50),
  },
  searchInput: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  searchDivider: {
    width: 1,
    height: theme.spacing(3.5),
    margin: theme.spacing(0.5),
  },
}));

const ImageUploadCard = () => {
  const classes = useStyles();

  const [stage, setStage] = useState<
    "initial" | "search" | "upload" | "uploaded"
  >("initial");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [url, setUrl] = useState<string>("");

  const handleUploadClick = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    const url = reader.readAsDataURL(file);
    console.log(url);

    reader.onloadend = () => {
      setSelectedFile(reader.result);
    };

    setStage("uploaded");
    setSelectedFile(event.target.files[0]);
  };

  const handleSearchClick = () => {
    setStage("search");
  };

  const handleImageSearch = () => {
    const fileName = url.substring(url.lastIndexOf("/") + 1);
    console.log(fileName);
    setStage("uploaded");
    setSelectedFile(url);
  };

  const handleSearchClose = () => {
    setStage("initial");
  };

  const handleImageReset = () => {
    setStage("initial");
    setSelectedFile(null);
  };

  return (
    <>
      <div className={classes.root}>
        <Card>
          {stage === "search" ? (
            <Paper className={classes.searchRoot} elevation={1}>
              <InputBase
                onChange={(event) => setUrl(event.target.value)}
                value={url}
                className={classes.searchInput}
                placeholder="Image URL"
              />
              <IconButton
                className={classes.button}
                aria-label="Search"
                onClick={handleImageSearch}
              >
                <Search />
              </IconButton>
              <Divider className={classes.searchDivider} />
              <IconButton
                color="primary"
                className={classes.secondaryButton}
                aria-label="Close"
                onClick={handleSearchClose}
              >
                <Close />
              </IconButton>
            </Paper>
          ) : stage === "uploaded" ? (
            <CardActionArea onClick={handleImageReset}>
              <img
                width="100%"
                // className={classes.image}
                src={selectedFile}
              />
            </CardActionArea>
          ) : (
            // stage === "initial"
            <CardContent>
              <Grid container justify="center" alignItems="center">
                <input
                  accept="image/*"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={handleUploadClick}
                />
                <label htmlFor="contained-button-file">
                  <Fab component="span" className={classes.button}>
                    <AddPhotoAlternate />
                  </Fab>
                </label>
                <Fab className={classes.button} onClick={handleSearchClick}>
                  <Search />
                </Fab>
              </Grid>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default ImageUploadCard;

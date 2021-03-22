import React, {useState} from "react";
import {
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Typography,
} from "@material-ui/core";
import {Close, AddAPhoto, Link, Check} from "@material-ui/icons";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {elide} from "../../utils/stringUtils";
import Strings from "../../resources/Strings";
import {uniqueId} from "lodash";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    color: theme.palette.primary.light,
    cursor: "pointer",
  },
  endAdornmentAvatar: {
    backgroundColor: theme.palette.primary.light,
    cursor: "pointer",
  },
}));

export interface ImageFieldProps {
  value: string;
  onChange: (value: string, imageName: string) => void;
  imageName: string;
  label?: string;
}

const ImageField = ({value, onChange, imageName, label}: ImageFieldProps) => {
  const classes = useStyles();

  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const inputId = uniqueId("profile-pic-input");
  const urlInputId = uniqueId("image-url-input");

  const addImageFromFile = (event: any) => {
    if (event.target.files?.[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (readerEvent) => {
        onChange(
          (readerEvent?.target?.result as string) ?? "",
          event.target.files[0].name,
        );
      };
    }
  };

  const addImageFromUrl = () => {
    const name = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    setShowUrlInput(false);
    onChange(imageUrl, name);
  };

  const openUrlInput = () => {
    setShowUrlInput(true);
    document.getElementById(urlInputId)?.focus();
  };

  return (
    <>
      <TextField
        style={{display: showUrlInput ? "inherit" : "none"}}
        id={urlInputId}
        inputRef={(input) => input && input.focus()}
        variant="filled"
        fullWidth
        onBlur={() => setShowUrlInput(false)}
        onChange={(event) => setImageUrl(event.target.value)}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            addImageFromUrl();
          }
        }}
        value={imageUrl}
        label={Strings.imageUrl()}
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment position="end" onClick={addImageFromUrl}>
                <Check className={classes.endAdornment} />
              </InputAdornment>
              <InputAdornment
                position="end"
                onClick={() => setShowUrlInput(false)}
              >
                <Close className={classes.endAdornment} />
              </InputAdornment>
            </>
          ),
        }}
      />
      <TextField
        id={inputId}
        style={{display: showUrlInput ? "none" : "inherit"}}
        onChange={addImageFromFile}
        fullWidth
        variant="filled"
        inputProps={{accept: "image/*", multiple: true, style: {opacity: 0}}}
        type="file"
        label={label}
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment onClick={openUrlInput} position="end">
                <Tooltip title={Strings.addFromUrl()}>
                  <Link className={classes.endAdornment} />
                </Tooltip>
              </InputAdornment>
              <InputAdornment
                position="end"
                onClick={() => document.getElementById(inputId)?.click()}
              >
                <Tooltip title={Strings.addFromFile()}>
                  {value ? (
                    <Avatar
                      className={classes.endAdornmentAvatar}
                      src={value}
                      alt={imageName}
                    />
                  ) : (
                    <AddAPhoto className={classes.endAdornment} />
                  )}
                </Tooltip>
              </InputAdornment>
            </>
          ),
          startAdornment: imageName && (
            <InputAdornment position="start">
              <Typography variant="body1">{elide(imageName, 20, 3)}</Typography>
            </InputAdornment>
          ),
          readOnly: true,
        }}
      />
    </>
  );
};

export default ImageField;

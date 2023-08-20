import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Icon, { IconProps } from "@material-ui/core/Icon";
import CloseIcon from "@material-ui/icons/Close";
import Autocomplete from "@material-ui/lab/Autocomplete";
import StyleIcon from "@material-ui/icons/Style";
import TextField from "../../Field/TextField";
import classNames from "classnames";
import { createHtmlPortalNode, InPortal } from "react-reverse-portal";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { useActionDialogContext } from "../../Dialog/ActionDialog";
import useRefState from "../../../hooks/useRefState";
import Tag from "../../Tag/Tag";
import { IconButton } from "../../Button";
import { dedupe } from "../../../utils";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.primary.contrastText}`,
    display: "flex",
    "& > svg": {
      margin: "auto",
    },
  },
}));

export interface TagsImageDecorationProps
  extends Omit<
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "corner" | "ComponentProps" | "onClick"
  > {
  /** Which corner of the image to render the decoration */
  corner?: ImageDecorationProps<IconProps>["corner"];
  /** Props to pass down to the icon */
  IconProps?: IconProps;
  /** The initial state of the tags */
  initialTags?: string[];
  /** Callback fired when the tags are confirmed */
  onConfirm: (tags: string[]) => Promise<void>;
  /** The tags to choose from */
  options?: string[];
}

const TagsImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <StyleIcon />
    </Icon>
  )
);

/** Image decoration component to add/remove tags */
const TagsImageDecoration = ({
  corner = "bottomRight",
  className: piClassName,
  IconProps = {},
  initialTags: piInitialTags = [],
  onConfirm,
  options = [],
  ...rest
}: TagsImageDecorationProps) => {
  const classes = useStyles();
  const { openPrompt } = useActionDialogContext();
  const tagsPortalNode = useMemo(() => createHtmlPortalNode(), []);
  const [initialTags, setInitialTags] = useState(piInitialTags);
  const [tagsRef, tags, setTags] = useRefState(initialTags);

  const handleConfirm = useCallback(async () => {
    onConfirm(tagsRef.current);
    setInitialTags(tagsRef.current);
  }, [onConfirm, tagsRef]);

  const handleCancel = useCallback(async () => {
    setTags(initialTags);
  }, [initialTags, setTags]);

  const [inputValue, setInputValue] = useState("");

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
      case ",":
      case "Tab": {
        if (inputValue.length > 0) {
          setTags(tags.concat([inputValue]));
          setInputValue("");
        }
        event.preventDefault();
        break;
      }
      default:
    }
  };

  return (
    <>
      <InPortal node={tagsPortalNode}>
        <Autocomplete<string, true, false, true>
          options={dedupe(options)}
          value={tags}
          fullWidth
          multiple
          freeSolo
          inputValue={inputValue}
          filterSelectedOptions
          disableCloseOnSelect
          onInputChange={(_, newInputValue) => {
            if (newInputValue.endsWith(" ") || newInputValue.endsWith(",")) {
              setTags(
                tags.concat([
                  newInputValue.substring(0, newInputValue.length - 1),
                ])
              );
              setInputValue("");
            } else {
              setInputValue(newInputValue);
            }
          }}
          onChange={(_, newTags) => {
            setTags(newTags);
          }}
          renderInput={(props) => (
            <TextField
              {...props}
              InputProps={{
                ...props.InputProps,
                endAdornment: !!tags.length && (
                  <IconButton
                    contrastText={false}
                    color="error"
                    onClick={() => setTags([])}
                  >
                    <CloseIcon />
                  </IconButton>
                ),
              }}
              label={Strings.label.tags}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (inputValue.length > 0) {
                  setTags(tags.concat([inputValue]));
                  setInputValue("");
                }
              }}
            />
          )}
          renderTags={(value, getTagProps) => {
            return value.map((option, index) => (
              <Tag label={option} {...getTagProps({ index })} key={option} />
            ));
          }}
        />
      </InPortal>
      <ImageDecoration<IconProps>
        onClick={() => {
          openPrompt(tagsPortalNode, handleConfirm, handleCancel, {
            title: Strings.action.addOrRemoveTags,
            confirmButtonColor: "success",
          });
        }}
        corner={corner}
        Component={TagsImageDecorationIcon}
        description={Strings.action.tagImage}
        ComponentProps={{
          fontSize: "large",
          ...IconProps,
        }}
        className={classNames(piClassName, classes.root)}
        {...rest}
      />
    </>
  );
};

export default TagsImageDecoration;

import React, {
  ForwardedRef,
  forwardRef,
  useState,
  KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import Parse from "parse";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import { Set } from "immutable";
import UserChip from "../User/UserChip";
import TextField from "../Field/TextField";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { useUserContext } from "../../contexts";
import { ParseAlbum, ParseUser } from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
  endAdornment: {
    "& *": {
      color: theme.palette.error.main,
      "&:hover, &:active, &:focus": {
        color: theme.palette.error.dark,
      },
    },
  },
}));

/** Interface defining props for UserField */
export interface UserFieldProps
  extends Omit<
    AutocompleteProps<string, true, false, true>,
    | "multiple"
    | "freeSolo"
    | "renderTags"
    | "renderInput"
    | "options"
    | "renderOption"
    | "onChange"
    | "value"
  > {
  /** Value of the field, array of the emails of the users */
  value: string[];
  /** Label to show on the field */
  label?: string;
  /** Function to call when the value changes */
  onChange: (value: string[]) => void;
}

/** Component to search/filter and input users by email */
const UserField = forwardRef(
  (
    { label, onChange, value, ...rest }: UserFieldProps,
    ref: ForwardedRef<any>
  ) => {
    const { loggedInUser } = useUserContext();
    const classes = useStyles();
    const gotOptions = useRef(false);
    const [options, setOptions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
      if (!gotOptions.current) {
        (async () => {
          await Parse.Query.or(
            ParseAlbum.query().equalTo(
              ParseAlbum.COLUMNS.owner,
              loggedInUser?.toNativePointer()
            ),
            ParseAlbum.query().containsAll(ParseAlbum.COLUMNS.collaborators, [
              loggedInUser!.email,
            ]),
            ParseAlbum.query().containsAll(ParseAlbum.COLUMNS.viewers, [
              loggedInUser!.email,
            ])
          )
            .findAll()
            .then(async (response) => {
              await Parse.Object.pinAll(response);
              const relatedUsers: string[] = [];
              for (const albumResponse of response) {
                const album = new ParseAlbum(albumResponse);
                relatedUsers.push(...album.collaborators, ...album.viewers);
                const ownerUser = await ParseUser.query().get(album.owner.id);
                await ownerUser.pin();
                relatedUsers.push(new ParseUser(ownerUser).email);
              }
              setOptions(
                Array.from(Set(relatedUsers)).filter(
                  (option) => option !== loggedInUser?.email
                )
              );
            });
        })();
        gotOptions.current = true;
      }
    }, [setOptions, loggedInUser]);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
        case " ":
        case ",":
        case "Tab": {
          if (inputValue.length > 0) {
            onChange(value.concat([inputValue]));
            setInputValue("");
          }
          event.preventDefault();
          break;
        }
        default:
      }
    };

    return (
      <Autocomplete<string, true, false, true>
        ref={ref}
        classes={classes}
        options={options}
        value={value}
        fullWidth
        multiple
        freeSolo
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          if (newInputValue.endsWith(" ") || newInputValue.endsWith(",")) {
            onChange(
              value.concat([
                newInputValue.substring(0, newInputValue.length - 1),
              ])
            );
            setInputValue("");
          } else {
            setInputValue(newInputValue);
          }
        }}
        onChange={(_, value) => onChange(value)}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (option) =>
              !value.filter((val) => val === option).length &&
              option
                ?.toLocaleLowerCase()
                ?.includes(inputValue.toLocaleLowerCase())
          )
        }
        renderTags={(value, getTagProps) =>
          value.map((user, index) => (
            <UserChip {...getTagProps({ index })} email={user} />
          ))
        }
        renderInput={(props) => (
          <TextField
            label={label}
            {...props}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (inputValue) {
                onChange(value.concat([inputValue]));
                setInputValue("");
              }
            }}
          />
        )}
        {...rest}
      />
    );
  }
);

export default UserField;

import React, {
  ForwardedRef,
  forwardRef,
  useState,
  KeyboardEvent,
} from "react";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import UserChip from "../User/UserChip";
import TextField from "../Field/TextField";
import debounce from "lodash/debounce";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { isNullOrWhitespace } from "../../utils";
import { useUserContext } from "../../contexts";
import { ParseAlbum } from "../../types";

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
    const [options, setOptions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    const updateOptions = debounce((value) => {
      if (!isNullOrWhitespace(value)) {
        ParseAlbum.query()
          .equalTo(ParseAlbum.COLUMNS.owner, loggedInUser?.toPointer())
          .findAll()
          .then((response) => {
            const relatedUsers: string[] = [];
            response.forEach((albumResponse) => {
              const album = new ParseAlbum(albumResponse);
              relatedUsers.push(
                ...album.collaborators,
                ...album.viewers,
                ...album.coOwners
              );
            });
            setOptions(Array.from(new Set(relatedUsers)));
          });
      }
    }, 500);

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
        onInputChange={(_, value) => {
          setInputValue(value);
          updateOptions(value);
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
          <TextField label={label} {...props} onKeyDown={onKeyDown} />
        )}
        {...rest}
      />
    );
  }
);

export default UserField;

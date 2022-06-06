import React, { ForwardedRef, forwardRef, useState } from "react";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import UserChip from "../User/UserChip";
import TextField from "../Field/TextField";
import { debounce } from "lodash";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ParseAlbum from "../../types/Album";
import ParseUser from "../../types/User";
import { useUserContext } from "../../app/UserContext";

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

    const updateOptions = debounce((value) => {
      if (!isNullOrWhitespace(value)) {
        ParseAlbum.query()
          .equalTo(ParseAlbum.COLUMNS.owner, loggedInUser!.email)
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
            ParseUser.query()
              .containedIn(
                ParseUser.COLUMNS.email,
                Array.from(new Set(relatedUsers))
              )
              .findAll()
              .then((response) => {
                setOptions(response.map((user) => new ParseUser(user).email));
              });
          });
      }
    }, 500);

    return (
      <Autocomplete<string, true, false, true>
        ref={ref}
        classes={classes}
        options={options}
        value={value}
        fullWidth
        multiple
        freeSolo
        onInputChange={(_, value) => {
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
        renderInput={(props) => <TextField label={label} {...props} />}
        {...rest}
      />
    );
  }
);

export default UserField;

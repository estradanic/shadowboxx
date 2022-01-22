import React, { ForwardedRef, forwardRef, useState } from "react";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import UserChip from "../User/UserChip";
import TextField from "../Field/TextField";
import { debounce } from "lodash";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";
import { ParseAlbum, Album } from "../../types/Album";
import { ParseUser } from "../../types/User";
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
    AutocompleteProps<ParseUser, true, false, true>,
    | "multiple"
    | "freeSolo"
    | "renderTags"
    | "renderInput"
    | "options"
    | "renderOption"
    | "onChange"
    | "value"
  > {
  /** Value of the field, array of ParseUser */
  value: ParseUser[];
  /** Label to show on the field */
  label?: string;
  /** Function to call when the value changes */
  onChange: (value: ParseUser[]) => void;
}

/** Component to search/filter and input users by email */
const UserField = forwardRef(
  (
    { label, onChange: piOnChange, value, ...rest }: UserFieldProps,
    ref: ForwardedRef<any>
  ) => {
    const { loggedInUser } = useUserContext();
    const classes = useStyles();
    const [options, setOptions] = useState<ParseUser[]>([]);
    const onChange = async (_: any, value: (ParseUser | string)[]) => {
      const newUsers = [];
      for (let i = 0; i < value.length; i++) {
        const option = value[i];
        if (typeof option === "string") {
          // TODO VERIFY: Will this work or do I need to use signup?
          newUsers.push(
            await ParseUser.fromAttributes({
              username: option,
              firstName: option,
            })
          );
        } else {
          newUsers.push(option);
        }
      }
      piOnChange(newUsers);
    };

    const getOptions = debounce((value) => {
      if (!isNullOrWhitespace(value)) {
        new Parse.Query<Parse.Object<Album>>("Album")
          .equalTo("owner", loggedInUser!.toPointer())
          .findAll()
          .then((response) => {
            response.forEach((albumResponse) => {
              const album = new ParseAlbum(albumResponse);
              album.collaborators
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(
                      new Set([
                        ...prev,
                        ...response.map(
                          (collaborator) => new ParseUser(collaborator)
                        ),
                      ])
                    )
                  );
                });
              album.viewers
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(
                      new Set([
                        ...prev,
                        ...response.map((viewer) => new ParseUser(viewer)),
                      ])
                    )
                  );
                });
              album.coOwners
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(
                      new Set([
                        ...prev,
                        ...response.map((coOwner) => new ParseUser(coOwner)),
                      ])
                    )
                  );
                });
            });
          });
      }
    }, 500);

    const resolveUserInfo = (resolvedUser: ParseUser) => {
      if (
        value.find(
          (user) =>
            user?.email === resolvedUser?.email &&
            user?.email === user?.firstName &&
            resolvedUser?.email !== resolvedUser?.firstName &&
            user?.firstName !== resolvedUser?.firstName
        )
      ) {
        onChange(
          null,
          value.map((user) => {
            if (resolvedUser?.email === user?.email) {
              return resolvedUser;
            }
            return user;
          })
        );
      }
    };

    return (
      <Autocomplete<ParseUser, true, false, true>
        ref={ref}
        classes={classes}
        options={options}
        value={value}
        fullWidth
        multiple
        freeSolo
        onInputChange={(_, value) => {
          getOptions(value);
        }}
        onChange={onChange}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (option) =>
              !value.filter((val) => val?.email === option?.email).length &&
              (option?.email
                ?.toLocaleLowerCase()
                ?.includes(inputValue.toLocaleLowerCase()) ||
                `${option?.firstName} ${option?.lastName}`
                  .toLocaleLowerCase()
                  .includes(inputValue.toLocaleLowerCase()))
          )
        }
        getOptionLabel={(option) => `${option?.firstName} ${option.lastName}`}
        renderTags={(value, getTagProps) =>
          value.map((user, index) => (
            <UserChip
              onResolve={resolveUserInfo}
              {...getTagProps({ index })}
              user={user}
            />
          ))
        }
        renderInput={(props) => <TextField label={label} {...props} />}
        {...rest}
      />
    );
  }
);

export default UserField;

import React, { ForwardedRef, forwardRef, useState } from "react";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import UserChip from "../User/UserChip";
import TextField from "../Field/TextField";
import { debounce } from "lodash";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Parse from "parse";
import Album from "../../types/Album";

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
    AutocompleteProps<Parse.User, true, false, true>,
    | "multiple"
    | "freeSolo"
    | "renderTags"
    | "renderInput"
    | "options"
    | "renderOption"
    | "onChange"
    | "value"
  > {
  /** Value of the field, array of Parse.User */
  value: Parse.User[];
  /** Label to show on the field */
  label?: string;
  /** Function to call when the value changes */
  onChange: (value: Parse.User[]) => void;
}

/** Component to search/filter and input users by email */
const UserField = forwardRef(
  (
    { label, onChange: piOnChange, value, ...rest }: UserFieldProps,
    ref: ForwardedRef<any>
  ) => {
    const classes = useStyles();
    const [options, setOptions] = useState<Parse.User[]>([]);
    const onChange = async (_: any, value: (Parse.User | string)[]) => {
      const newUsers = [];
      for (let i = 0; i < value.length; i++) {
        const option = value[i];
        if (typeof option === "string") {
          // Will this work or do I need to use signup?
          newUsers.push(
            await new Parse.User({
              email: option,
              username: option,
              password: "",
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
        const currentUser = Parse.User.current();
        if (!currentUser) {
          throw new Error("Not Logged In!");
        }
        new Parse.Query<Parse.Object<Album>>("Album")
          .equalTo("owner", currentUser.toPointer())
          .findAll()
          .then((response) => {
            response.forEach((album) => {
              album
                .get("collaborators")
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(new Set([...prev, ...response]))
                  );
                });
              album
                .get("viewers")
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(new Set([...prev, ...response]))
                  );
                });
              album
                .get("coOwners")
                ?.query()
                .findAll()
                .then((response) => {
                  setOptions((prev) =>
                    Array.from(new Set([...prev, ...response]))
                  );
                });
            });
          });
      }
    }, 500);

    const resolveUserInfo = (resolvedUser: Parse.User) => {
      if (
        value.find(
          (user) =>
            user?.getEmail() === resolvedUser?.getEmail() &&
            user?.getEmail() === user?.get("firstName") &&
            resolvedUser?.getEmail() !== resolvedUser?.get("firstName") &&
            user?.get("firstName") !== resolvedUser?.get("firstName")
        )
      ) {
        onChange(
          null,
          value.map((user) => {
            if (resolvedUser?.getEmail() === user?.getEmail()) {
              return resolvedUser;
            }
            return user;
          })
        );
      }
    };

    return (
      <Autocomplete<Parse.User, true, false, true>
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
              !value.filter((val) => val?.getEmail() === option?.getEmail())
                .length &&
              (option
                ?.getEmail()
                ?.toLocaleLowerCase()
                ?.includes(inputValue.toLocaleLowerCase()) ||
                `${option?.get("firstName")} ${option?.get("lastName")}`
                  .toLocaleLowerCase()
                  .includes(inputValue.toLocaleLowerCase()))
          )
        }
        getOptionLabel={(option) =>
          `${option?.get("firstName")} ${option.get("lastName")}`
        }
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

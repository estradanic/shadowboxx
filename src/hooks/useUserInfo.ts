/* eslint-disable react-hooks/rules-of-hooks */
// The rule is disabled because it is wrong.
// The hooks are not called conditionally because the condition is unchanging.
import { useCallback, useState } from "react";
import {
  QueryKey,
  QueryObserverOptions,
  useQuery,
} from "@tanstack/react-query";
import { ParsePointer, ParseUser } from "../classes";
import { Exclusive } from "../types";
import useQueryConfigs from "./Query/useQueryConfigs";
import { FunctionOptions } from "./Query/useQueryConfigHelpers";
import { useNetworkDetectionContext } from "../contexts/NetworkDetectionContext";

/** Interface defining parameters for useUserInfo */
export type UseUserInfoParams = Exclusive<
  {
    /** Email of the user to get */
    email: string;
    /** Function to get user */
    fetchUser: () => ParseUser | Promise<ParseUser>;
    /** ParseUser to get */
    user: ParseUser;
    /** Pointer to the ParseUser to get */
    userPointer: ParsePointer<"_User">;
    /** Options to pass into the queryFunction */
    queryFunctionOptions?: FunctionOptions;
    /** Options to pass into useQuery */
    queryOptions?: Partial<
      QueryObserverOptions<ParseUser, Error, ParseUser, ParseUser, QueryKey>
    >;
    /**
     * Query key to use.
     * Defaults to email, user.id, or userPointer.id, depending on which is provided
     * MUST be provided if using fetchUser
     */
    queryKey?: string;
  },
  "email" | "user" | "userPointer" | "fetchUser"
>;

/** Hook to get a ParseUser from a multitude of different approaches */
const useUserInfo = ({
  email,
  fetchUser,
  user,
  userPointer,
  queryFunctionOptions,
  queryOptions,
  queryKey = email ?? userPointer?.id ?? user?.objectId,
}: UseUserInfoParams): ParseUser | undefined => {
  const [memoizedQueryKey] = useState<string | undefined>(queryKey);
  if (!memoizedQueryKey) {
    console.error("No queryKey provided to useUserInfo");
    return undefined;
  }

  const {
    getUserByEmailFunction,
    getUserByEmailQueryKey,
    getUserByEmailOptions,
  } = useQueryConfigs();
  const { online } = useNetworkDetectionContext();

  const getUserFunction = useCallback(async () => {
    if (fetchUser) {
      return await fetchUser();
    } else if (user) {
      return user;
    } else if (userPointer) {
      return await userPointer.fetch<ParseUser>(online);
    } else {
      return await getUserByEmailFunction(online, email, queryFunctionOptions);
    }
  }, [
    fetchUser,
    user,
    userPointer,
    email,
    getUserByEmailFunction,
    queryFunctionOptions,
    online,
  ]);

  const { data: fetchedUser } = useQuery<ParseUser, Error>(
    getUserByEmailQueryKey(memoizedQueryKey),
    getUserFunction,
    getUserByEmailOptions({
      staleTime: Infinity,
      cacheTime: Infinity,
      ...(queryOptions ?? {}),
    })
  );

  return fetchedUser;
};

export default useUserInfo;

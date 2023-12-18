import React, { useMemo, useState, MouseEvent } from "react";
import LockIcon from "@material-ui/icons/Lock";
import UnlockIcon from "@material-ui/icons/LockOpen";
import Button, { ButtonProps } from "./Button";

export interface LockedButtonProps extends Omit<ButtonProps, "color"> {}

/** Button that must be clicked once to unlock, then clicked again for the action */
const LockedButton = ({
  onClick: userOnClick,
  children,
  ...rest
}: ButtonProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const onClick = useMemo(() => {
    return isLocked
      ? () => setIsLocked(false)
      : async (e: MouseEvent<HTMLButtonElement>) => {
          await userOnClick?.(e);
          setIsLocked(true);
        };
  }, [userOnClick, setIsLocked, isLocked]);

  return (
    <Button
      onClick={onClick}
      color={isLocked ? "info" : "error"}
      onBlur={() => setIsLocked(true)}
      {...rest}
    >
      {isLocked ? (
        <LockIcon style={{ fontSize: "medium" }} />
      ) : (
        <UnlockIcon style={{ fontSize: "medium" }} />
      )}
      {children}
      {isLocked ? (
        <LockIcon style={{ fontSize: "medium" }} />
      ) : (
        <UnlockIcon style={{ fontSize: "medium" }} />
      )}
    </Button>
  );
};

export default LockedButton;

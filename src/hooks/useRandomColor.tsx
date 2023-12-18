import { useMemo } from "react";
import { VariableColor } from "../types";

/** Hook that provides a random color from the theme */
const useRandomColor = (): VariableColor => {
  const randomColor: VariableColor = useMemo(() => {
    const colors: VariableColor[] = ["success", "error", "warning", "info"];
    return colors[Math.round(Math.random() * colors.length)];
  }, []);

  return randomColor;
};

export default useRandomColor;

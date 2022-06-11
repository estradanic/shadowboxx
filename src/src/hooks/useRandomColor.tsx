import { useMemo } from "react";
import { VariableColor } from "../types";

const useRandomColor = (): VariableColor => {
  const randomColor: VariableColor = useMemo(() => {
    const colors: VariableColor[] = [
      "primary",
      "secondary",
      "success",
      "error",
      "warning",
      "info",
    ];
    return colors[Math.round(Math.random() * colors.length)];
  }, []);

  return randomColor;
};

export default useRandomColor;

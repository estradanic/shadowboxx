import VariableColor from "./VariableColor";

type TypographyColor =
  | VariableColor
  | "inherit"
  | "primaryContrast"
  | "secondaryContrast"
  | "infoContrast"
  | "warningContrast"
  | "successContrast"
  | "errorContrast"
  | "disabled"
  | "textPrimary"
  | "textSecondary";

export default TypographyColor;

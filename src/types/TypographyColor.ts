import VariableColor from "./VariableColor";

/** Colors that typography can have */
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

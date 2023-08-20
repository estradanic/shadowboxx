/** apply opacity to a color */
export const opacity = (color: string, opacity: number): string => {
  // coerce values so it is between 0 and 1.
  const normalizedOpacity = Math.round(
    Math.min(Math.max(opacity || 1, 0), 1) * 255
  );
  return color + normalizedOpacity.toString(16).toUpperCase();
};

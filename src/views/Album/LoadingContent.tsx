import React from "react";
import { FancyTitleTypographySkeleton, ImagesSkeleton } from "../../components/Skeleton";
import { VariableColor } from "../../types";

type LoadingContentProps = {
	randomColor: VariableColor;
};

const LoadingContent = ({randomColor}: LoadingContentProps) => (
	<>
      <FancyTitleTypographySkeleton outlineColor={randomColor} />
      <ImagesSkeleton />
	</>
);

export default LoadingContent;

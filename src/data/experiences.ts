import type { ComponentType } from "react";
import PlaceholderPage from "@/experiences/algorithms/sorting/bubble-sort/page/PlaceholderPage";

export const EXPERIENCES: Record<string, ComponentType> = {
	"bubble-sort": PlaceholderPage,
};

export const IMPLEMENTED_EXPERIENCES: ReadonlySet<string> = new Set(
  Object.keys(EXPERIENCES)
)
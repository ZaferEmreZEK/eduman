import { createContext } from "react";
import type { PaletteMode } from "@mui/material";

export type ThemeModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggle: () => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "light",
  setMode: () => undefined,
  toggle: () => undefined,
});

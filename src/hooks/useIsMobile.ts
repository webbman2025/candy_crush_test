import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Hook to determine if the current viewport is mobile size
 * @returns boolean indicating if the viewport is mobile size (below md breakpoint)
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return isMobile;
};

export default useIsMobile;

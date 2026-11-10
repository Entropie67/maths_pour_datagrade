export const KEYCAP_WIDTH = {
  sm: 30,
  md: 40,
  lg: 60,
  xl: 80,
}
export const KEYCAP_HEIGHT = {
  sm: 40,
  md: 40,
}
export const GAP_BETWEEN_BLOCKS = {
  sm: 10,
  md: 15,
  lg: 15,
  xl: 15,
}
export const GAP_BETWEEN_KEYS = {
  sm: 4,
  md: 8,
  lg: 8,
  xl: 8,
}

export const SM_BREAKPOINT = 640
export const MD_BREAKPOINT = 768
export const LG_BREAKPOINT = 1024
export const XL_BREAKPOINT = 1280

/** Largeur d'écran à partir de laquelle on n'est plus sur smartphone. */
export const estSmartphone = (innerWidth: number): boolean =>
  innerWidth > 0 && innerWidth <= SM_BREAKPOINT

export const getMode = function (
  innerWidth: number,
  isInLine: boolean,
): 'sm' | 'md' | 'lg' | 'xl' {
  if (isInLine) {
    return innerWidth <= SM_BREAKPOINT ? 'sm' : 'md'
  }
  return innerWidth <= SM_BREAKPOINT
    ? 'sm'
    : innerWidth <= MD_BREAKPOINT
      ? 'md'
      : innerWidth <= LG_BREAKPOINT
        ? 'lg'
        : 'xl'
}

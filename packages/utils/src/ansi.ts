export const COLOR_ENABLED =
  typeof process !== 'undefined'
    ? !process.env.NODE_DISABLE_COLORS && (!process.env.NO_COLOR || process.env.NO_COLOR === '0')
    : true;

export const RESET      = COLOR_ENABLED ? '\u001b[0m'  : ''; // biome-ignore format: this is aligned
export const BOLD       = COLOR_ENABLED ? '\u001b[1m'  : ''; // biome-ignore format: this is aligned
export const DIM        = COLOR_ENABLED ? '\u001b[2m'  : ''; // biome-ignore format: this is aligned
export const ITALIC     = COLOR_ENABLED ? '\u001b[3m'  : ''; // biome-ignore format: this is aligned
export const UNDERLINE  = COLOR_ENABLED ? '\u001b[4m'  : ''; // biome-ignore format: this is aligned
export const FG_BLACK   = COLOR_ENABLED ? '\u001b[30m' : ''; // biome-ignore format: this is aligned
export const FG_RED     = COLOR_ENABLED ? '\u001b[31m' : ''; // biome-ignore format: this is aligned
export const FG_GREEN   = COLOR_ENABLED ? '\u001b[32m' : ''; // biome-ignore format: this is aligned
export const FG_YELLOW  = COLOR_ENABLED ? '\u001b[33m' : ''; // biome-ignore format: this is aligned
export const FG_BLUE    = COLOR_ENABLED ? '\u001b[34m' : ''; // biome-ignore format: this is aligned
export const FG_MAGENTA = COLOR_ENABLED ? '\u001b[35m' : ''; // biome-ignore format: this is aligned
export const FG_CYAN    = COLOR_ENABLED ? '\u001b[36m' : ''; // biome-ignore format: this is aligned
export const FG_WHITE   = COLOR_ENABLED ? '\u001b[37m' : ''; // biome-ignore format: this is aligned
export const BG_BLACK   = COLOR_ENABLED ? '\u001b[40m' : ''; // biome-ignore format: this is aligned
export const BG_RED     = COLOR_ENABLED ? '\u001b[41m' : ''; // biome-ignore format: this is aligned
export const BG_GREEN   = COLOR_ENABLED ? '\u001b[42m' : ''; // biome-ignore format: this is aligned
export const BG_YELLOW  = COLOR_ENABLED ? '\u001b[43m' : ''; // biome-ignore format: this is aligned
export const BG_BLUE    = COLOR_ENABLED ? '\u001b[44m' : ''; // biome-ignore format: this is aligned
export const BG_MAGENTA = COLOR_ENABLED ? '\u001b[45m' : ''; // biome-ignore format: this is aligned
export const BG_CYAN    = COLOR_ENABLED ? '\u001b[46m' : ''; // biome-ignore format: this is aligned
export const BG_WHITE   = COLOR_ENABLED ? '\u001b[47m' : ''; // biome-ignore format: this is aligned

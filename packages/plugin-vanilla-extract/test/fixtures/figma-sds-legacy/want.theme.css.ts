import { createGlobalThemeContract, createTheme } from "@vanilla-extract/css";

export const vars = createGlobalThemeContract({
  "color": {
    "background": {
      "brand": {
        "default": "color-background-brand-default",
        "hover": "color-background-brand-hover",
        "secondary": "color-background-brand-secondary",
        "secondaryHover": "color-background-brand-secondary-hover",
        "tertiary": "color-background-brand-tertiary",
        "tertiaryHover": "color-background-brand-tertiary-hover"
      },
      "danger": {
        "default": "color-background-danger-default",
        "hover": "color-background-danger-hover",
        "secondary": "color-background-danger-secondary",
        "secondaryHover": "color-background-danger-secondary-hover",
        "tertiary": "color-background-danger-tertiary",
        "tertiaryHover": "color-background-danger-tertiary-hover"
      },
      "default": {
        "default": "color-background-default-default",
        "hover": "color-background-default-hover",
        "secondary": "color-background-default-secondary",
        "secondaryHover": "color-background-default-secondary-hover",
        "tertiary": "color-background-default-tertiary",
        "tertiaryHover": "color-background-default-tertiary-hover"
      },
      "disabled": {
        "default": "color-background-disabled-default"
      },
      "neutral": {
        "default": "color-background-neutral-default",
        "hover": "color-background-neutral-hover",
        "secondary": "color-background-neutral-secondary",
        "secondaryHover": "color-background-neutral-secondary-hover",
        "tertiary": "color-background-neutral-tertiary",
        "tertiaryHover": "color-background-neutral-tertiary-hover"
      },
      "positive": {
        "default": "color-background-positive-default",
        "hover": "color-background-positive-hover",
        "secondary": "color-background-positive-secondary",
        "secondaryHover": "color-background-positive-secondary-hover",
        "tertiary": "color-background-positive-tertiary",
        "tertiaryHover": "color-background-positive-tertiary-hover"
      },
      "warning": {
        "default": "color-background-warning-default",
        "hover": "color-background-warning-hover",
        "secondary": "color-background-warning-secondary",
        "secondaryHover": "color-background-warning-secondary-hover",
        "tertiary": "color-background-warning-tertiary",
        "tertiaryHover": "color-background-warning-tertiary-hover"
      }
    },
    "black": {
      "100": "color-black-100",
      "200": "color-black-200",
      "300": "color-black-300",
      "400": "color-black-400",
      "500": "color-black-500",
      "600": "color-black-600",
      "700": "color-black-700",
      "800": "color-black-800",
      "900": "color-black-900",
      "1000": "color-black-1000"
    },
    "border": {
      "brand": {
        "default": "color-border-brand-default",
        "secondary": "color-border-brand-secondary",
        "tertiary": "color-border-brand-tertiary"
      },
      "danger": {
        "default": "color-border-danger-default",
        "secondary": "color-border-danger-secondary",
        "tertiary": "color-border-danger-tertiary"
      },
      "default": {
        "default": "color-border-default-default",
        "secondary": "color-border-default-secondary",
        "tertiary": "color-border-default-tertiary"
      },
      "disabled": {
        "default": "color-border-disabled-default"
      },
      "neutral": {
        "default": "color-border-neutral-default",
        "secondary": "color-border-neutral-secondary",
        "tertiary": "color-border-neutral-tertiary"
      },
      "positive": {
        "default": "color-border-positive-default",
        "secondary": "color-border-positive-secondary",
        "tertiary": "color-border-positive-tertiary"
      },
      "warning": {
        "default": "color-border-warning-default",
        "secondary": "color-border-warning-secondary",
        "tertiary": "color-border-warning-tertiary"
      }
    },
    "brand": {
      "100": "color-brand-100",
      "200": "color-brand-200",
      "300": "color-brand-300",
      "400": "color-brand-400",
      "500": "color-brand-500",
      "600": "color-brand-600",
      "700": "color-brand-700",
      "800": "color-brand-800",
      "900": "color-brand-900",
      "1000": "color-brand-1000"
    },
    "gray": {
      "100": "color-gray-100",
      "200": "color-gray-200",
      "300": "color-gray-300",
      "400": "color-gray-400",
      "500": "color-gray-500",
      "600": "color-gray-600",
      "700": "color-gray-700",
      "800": "color-gray-800",
      "900": "color-gray-900",
      "1000": "color-gray-1000"
    },
    "green": {
      "100": "color-green-100",
      "200": "color-green-200",
      "300": "color-green-300",
      "400": "color-green-400",
      "500": "color-green-500",
      "600": "color-green-600",
      "700": "color-green-700",
      "800": "color-green-800",
      "900": "color-green-900",
      "1000": "color-green-1000"
    },
    "icon": {
      "brand": {
        "default": "color-icon-brand-default",
        "onBrand": "color-icon-brand-on-brand",
        "onBrandSecondary": "color-icon-brand-on-brand-secondary",
        "onBrandTertiary": "color-icon-brand-on-brand-tertiary",
        "secondary": "color-icon-brand-secondary",
        "tertiary": "color-icon-brand-tertiary"
      },
      "danger": {
        "default": "color-icon-danger-default",
        "onDanger": "color-icon-danger-on-danger",
        "onDangerSecondary": "color-icon-danger-on-danger-secondary",
        "onDangerTertiary": "color-icon-danger-on-danger-tertiary",
        "secondary": "color-icon-danger-secondary",
        "tertiary": "color-icon-danger-tertiary"
      },
      "default": {
        "default": "color-icon-default-default",
        "secondary": "color-icon-default-secondary",
        "tertiary": "color-icon-default-tertiary"
      },
      "disabled": {
        "default": "color-icon-disabled-default",
        "onDisabled": "color-icon-disabled-on-disabled"
      },
      "neutral": {
        "default": "color-icon-neutral-default",
        "onNeutral": "color-icon-neutral-on-neutral",
        "onNeutralSecondary": "color-icon-neutral-on-neutral-secondary",
        "onNeutralTertiary": "color-icon-neutral-on-neutral-tertiary",
        "secondary": "color-icon-neutral-secondary",
        "tertiary": "color-icon-neutral-tertiary"
      },
      "positive": {
        "default": "color-icon-positive-default",
        "onPositive": "color-icon-positive-on-positive",
        "onPositiveSecondary": "color-icon-positive-on-positive-secondary",
        "onPositiveTertiary": "color-icon-positive-on-positive-tertiary",
        "secondary": "color-icon-positive-secondary",
        "tertiary": "color-icon-positive-tertiary"
      },
      "warning": {
        "default": "color-icon-warning-default",
        "onWarning": "color-icon-warning-on-warning",
        "onWarningSecondary": "color-icon-warning-on-warning-secondary",
        "onWarningTertiary": "color-icon-warning-on-warning-tertiary",
        "secondary": "color-icon-warning-secondary",
        "tertiary": "color-icon-warning-tertiary"
      }
    },
    "pink": {
      "100": "color-pink-100",
      "200": "color-pink-200",
      "300": "color-pink-300",
      "400": "color-pink-400",
      "500": "color-pink-500",
      "600": "color-pink-600",
      "700": "color-pink-700",
      "800": "color-pink-800",
      "900": "color-pink-900",
      "1000": "color-pink-1000"
    },
    "red": {
      "100": "color-red-100",
      "200": "color-red-200",
      "300": "color-red-300",
      "400": "color-red-400",
      "500": "color-red-500",
      "600": "color-red-600",
      "700": "color-red-700",
      "800": "color-red-800",
      "900": "color-red-900",
      "1000": "color-red-1000"
    },
    "slate": {
      "100": "color-slate-100",
      "200": "color-slate-200",
      "300": "color-slate-300",
      "400": "color-slate-400",
      "500": "color-slate-500",
      "600": "color-slate-600",
      "700": "color-slate-700",
      "800": "color-slate-800",
      "900": "color-slate-900",
      "1000": "color-slate-1000"
    },
    "text": {
      "brand": {
        "default": "color-text-brand-default",
        "onBrand": "color-text-brand-on-brand",
        "onBrandSecondary": "color-text-brand-on-brand-secondary",
        "onBrandTertiary": "color-text-brand-on-brand-tertiary",
        "secondary": "color-text-brand-secondary",
        "tertiary": "color-text-brand-tertiary"
      },
      "danger": {
        "default": "color-text-danger-default",
        "onDanger": "color-text-danger-on-danger",
        "onDangerSecondary": "color-text-danger-on-danger-secondary",
        "onDangerTertiary": "color-text-danger-on-danger-tertiary",
        "secondary": "color-text-danger-secondary",
        "tertiary": "color-text-danger-tertiary"
      },
      "default": {
        "default": "color-text-default-default",
        "secondary": "color-text-default-secondary",
        "tertiary": "color-text-default-tertiary"
      },
      "disabled": {
        "default": "color-text-disabled-default",
        "onDisabled": "color-text-disabled-on-disabled"
      },
      "neutral": {
        "default": "color-text-neutral-default",
        "onNeutral": "color-text-neutral-on-neutral",
        "onNeutralSecondary": "color-text-neutral-on-neutral-secondary",
        "onNeutralTertiary": "color-text-neutral-on-neutral-tertiary",
        "secondary": "color-text-neutral-secondary",
        "tertiary": "color-text-neutral-tertiary"
      },
      "positive": {
        "default": "color-text-positive-default",
        "onPositive": "color-text-positive-on-positive",
        "onPositiveSecondary": "color-text-positive-on-positive-secondary",
        "onPositiveTertiary": "color-text-positive-on-positive-tertiary",
        "secondary": "color-text-positive-secondary",
        "tertiary": "color-text-positive-tertiary"
      },
      "warning": {
        "default": "color-text-warning-default",
        "onWarning": "color-text-warning-on-warning",
        "onWarningSecondary": "color-text-warning-on-warning-secondary",
        "onWarningTertiary": "color-text-warning-on-warning-tertiary",
        "secondary": "color-text-warning-secondary",
        "tertiary": "color-text-warning-tertiary"
      }
    },
    "white": {
      "100": "color-white-100",
      "200": "color-white-200",
      "300": "color-white-300",
      "400": "color-white-400",
      "500": "color-white-500",
      "600": "color-white-600",
      "700": "color-white-700",
      "800": "color-white-800",
      "900": "color-white-900",
      "1000": "color-white-1000"
    },
    "yellow": {
      "100": "color-yellow-100",
      "200": "color-yellow-200",
      "300": "color-yellow-300",
      "400": "color-yellow-400",
      "500": "color-yellow-500",
      "600": "color-yellow-600",
      "700": "color-yellow-700",
      "800": "color-yellow-800",
      "900": "color-yellow-900",
      "1000": "color-yellow-1000"
    }
  },
  "size": {
    "blur": {
      "100": "size-blur-100"
    },
    "depth": {
      "0": "size-depth-0",
      "100": "size-depth-100",
      "200": "size-depth-200",
      "400": "size-depth-400",
      "800": "size-depth-800",
      "1200": "size-depth-1200",
      "025": "size-depth-025",
      "negative025": "size-depth-negative-025",
      "negative100": "size-depth-negative-100",
      "negative200": "size-depth-negative-200",
      "negative400": "size-depth-negative-400",
      "negative800": "size-depth-negative-800",
      "negative1200": "size-depth-negative-1200"
    },
    "icon": {
      "large": "size-icon-large",
      "medium": "size-icon-medium",
      "small": "size-icon-small"
    },
    "radius": {
      "100": "size-radius-100",
      "200": "size-radius-200",
      "400": "size-radius-400",
      "full": "size-radius-full"
    },
    "space": {
      "0": "size-space-0",
      "100": "size-space-100",
      "150": "size-space-150",
      "200": "size-space-200",
      "300": "size-space-300",
      "400": "size-space-400",
      "600": "size-space-600",
      "800": "size-space-800",
      "1200": "size-space-1200",
      "1600": "size-space-1600",
      "2400": "size-space-2400",
      "4000": "size-space-4000",
      "050": "size-space-050",
      "negative100": "size-space-negative-100",
      "negative200": "size-space-negative-200",
      "negative300": "size-space-negative-300",
      "negative400": "size-space-negative-400",
      "negative600": "size-space-negative-600"
    },
    "stroke": {
      "border": "size-stroke-border",
      "focusRing": "size-stroke-focus-ring"
    }
  },
  "typography": {
    "body": {
      "large": {
        "fontFamily": "typography-body-large-font-family",
        "fontSize": "typography-body-large-font-size",
        "fontWeight": "typography-body-large-font-weight",
        "letterSpacing": "typography-body-large-letter-spacing",
        "lineHeight": "typography-body-large-line-height"
      },
      "medium": {
        "fontFamily": "typography-body-medium-font-family",
        "fontSize": "typography-body-medium-font-size",
        "fontWeight": "typography-body-medium-font-weight",
        "letterSpacing": "typography-body-medium-letter-spacing",
        "lineHeight": "typography-body-medium-line-height"
      },
      "small": {
        "fontFamily": "typography-body-small-font-family",
        "fontSize": "typography-body-small-font-size",
        "fontWeight": "typography-body-small-font-weight",
        "letterSpacing": "typography-body-small-letter-spacing",
        "lineHeight": "typography-body-small-line-height"
      }
    },
    "code": {
      "large": {
        "fontFamily": "typography-code-large-font-family",
        "fontSize": "typography-code-large-font-size",
        "fontWeight": "typography-code-large-font-weight",
        "letterSpacing": "typography-code-large-letter-spacing",
        "lineHeight": "typography-code-large-line-height"
      },
      "medium": {
        "fontFamily": "typography-code-medium-font-family",
        "fontSize": "typography-code-medium-font-size",
        "fontWeight": "typography-code-medium-font-weight",
        "letterSpacing": "typography-code-medium-letter-spacing",
        "lineHeight": "typography-code-medium-line-height"
      },
      "small": {
        "fontFamily": "typography-code-small-font-family",
        "fontSize": "typography-code-small-font-size",
        "fontWeight": "typography-code-small-font-weight",
        "letterSpacing": "typography-code-small-letter-spacing",
        "lineHeight": "typography-code-small-line-height"
      }
    },
    "family": {
      "mono": "typography-family-mono",
      "sans": "typography-family-sans",
      "serif": "typography-family-serif"
    },
    "heading": {
      "base": {
        "fontFamily": "typography-heading-base-font-family",
        "fontSize": "typography-heading-base-font-size",
        "fontWeight": "typography-heading-base-font-weight",
        "letterSpacing": "typography-heading-base-letter-spacing",
        "lineHeight": "typography-heading-base-line-height"
      },
      "large": {
        "fontFamily": "typography-heading-large-font-family",
        "fontSize": "typography-heading-large-font-size",
        "fontWeight": "typography-heading-large-font-weight",
        "letterSpacing": "typography-heading-large-letter-spacing",
        "lineHeight": "typography-heading-large-line-height"
      },
      "small": {
        "fontFamily": "typography-heading-small-font-family",
        "fontSize": "typography-heading-small-font-size",
        "fontWeight": "typography-heading-small-font-weight",
        "letterSpacing": "typography-heading-small-letter-spacing",
        "lineHeight": "typography-heading-small-line-height"
      }
    },
    "scale": {
      "10": "typography-scale-10",
      "01": "typography-scale-01",
      "02": "typography-scale-02",
      "03": "typography-scale-03",
      "04": "typography-scale-04",
      "05": "typography-scale-05",
      "06": "typography-scale-06",
      "07": "typography-scale-07",
      "08": "typography-scale-08",
      "09": "typography-scale-09"
    },
    "subheading": {
      "base": {
        "fontFamily": "typography-subheading-base-font-family",
        "fontSize": "typography-subheading-base-font-size",
        "fontWeight": "typography-subheading-base-font-weight",
        "letterSpacing": "typography-subheading-base-letter-spacing",
        "lineHeight": "typography-subheading-base-line-height"
      },
      "large": {
        "fontFamily": "typography-subheading-large-font-family",
        "fontSize": "typography-subheading-large-font-size",
        "fontWeight": "typography-subheading-large-font-weight",
        "letterSpacing": "typography-subheading-large-letter-spacing",
        "lineHeight": "typography-subheading-large-line-height"
      },
      "small": {
        "fontFamily": "typography-subheading-small-font-family",
        "fontSize": "typography-subheading-small-font-size",
        "fontWeight": "typography-subheading-small-font-weight",
        "letterSpacing": "typography-subheading-small-letter-spacing",
        "lineHeight": "typography-subheading-small-line-height"
      }
    },
    "subtitle": {
      "base": {
        "fontFamily": "typography-subtitle-base-font-family",
        "fontSize": "typography-subtitle-base-font-size",
        "fontWeight": "typography-subtitle-base-font-weight",
        "letterSpacing": "typography-subtitle-base-letter-spacing",
        "lineHeight": "typography-subtitle-base-line-height"
      },
      "large": {
        "fontFamily": "typography-subtitle-large-font-family",
        "fontSize": "typography-subtitle-large-font-size",
        "fontWeight": "typography-subtitle-large-font-weight",
        "letterSpacing": "typography-subtitle-large-letter-spacing",
        "lineHeight": "typography-subtitle-large-line-height"
      },
      "small": {
        "fontFamily": "typography-subtitle-small-font-family",
        "fontSize": "typography-subtitle-small-font-size",
        "fontWeight": "typography-subtitle-small-font-weight",
        "letterSpacing": "typography-subtitle-small-letter-spacing",
        "lineHeight": "typography-subtitle-small-line-height"
      }
    },
    "titleHero": {
      "fontFamily": "typography-title-hero-font-family",
      "fontSize": "typography-title-hero-font-size",
      "fontWeight": "typography-title-hero-font-weight",
      "letterSpacing": "typography-title-hero-letter-spacing",
      "lineHeight": "typography-title-hero-line-height"
    },
    "titlePage": {
      "base": {
        "fontFamily": "typography-title-page-base-font-family",
        "fontSize": "typography-title-page-base-font-size",
        "fontWeight": "typography-title-page-base-font-weight",
        "letterSpacing": "typography-title-page-base-letter-spacing",
        "lineHeight": "typography-title-page-base-line-height"
      },
      "large": {
        "fontFamily": "typography-title-page-large-font-family",
        "fontSize": "typography-title-page-large-font-size",
        "fontWeight": "typography-title-page-large-font-weight",
        "letterSpacing": "typography-title-page-large-letter-spacing",
        "lineHeight": "typography-title-page-large-line-height"
      },
      "small": {
        "fontFamily": "typography-title-page-small-font-family",
        "fontSize": "typography-title-page-small-font-size",
        "fontWeight": "typography-title-page-small-font-weight",
        "letterSpacing": "typography-title-page-small-letter-spacing",
        "lineHeight": "typography-title-page-small-line-height"
      }
    },
    "weight": {
      "black": "typography-weight-black",
      "bold": "typography-weight-bold",
      "extrabold": "typography-weight-extrabold",
      "extralight": "typography-weight-extralight",
      "light": "typography-weight-light",
      "medium": "typography-weight-medium",
      "regular": "typography-weight-regular",
      "semibold": "typography-weight-semibold",
      "thin": "typography-weight-thin"
    }
  }
});

export const [lightClass, light] = createTheme(vars, {
  "color": {
    "background": {
      "brand": {
        "default": vars.color.brand[800],
        "hover": vars.color.brand[900],
        "secondary": vars.color.brand[200],
        "secondaryHover": vars.color.brand[300],
        "tertiary": vars.color.brand[100],
        "tertiaryHover": vars.color.brand[200]
      },
      "danger": {
        "default": vars.color.red[500],
        "hover": vars.color.red[600],
        "secondary": vars.color.red[200],
        "secondaryHover": vars.color.red[300],
        "tertiary": vars.color.red[100],
        "tertiaryHover": vars.color.red[200]
      },
      "default": {
        "default": vars.color.white[1000],
        "hover": vars.color.gray[100],
        "secondary": vars.color.gray[100],
        "secondaryHover": vars.color.gray[200],
        "tertiary": vars.color.gray[300],
        "tertiaryHover": vars.color.gray[400]
      },
      "disabled": {
        "default": vars.color.brand[300]
      },
      "neutral": {
        "default": vars.color.slate[700],
        "hover": vars.color.slate[800],
        "secondary": vars.color.slate[300],
        "secondaryHover": vars.color.slate[400],
        "tertiary": vars.color.slate[200],
        "tertiaryHover": vars.color.slate[300]
      },
      "positive": {
        "default": vars.color.green[500],
        "hover": vars.color.green[600],
        "secondary": vars.color.green[200],
        "secondaryHover": vars.color.green[300],
        "tertiary": vars.color.green[100],
        "tertiaryHover": vars.color.green[200]
      },
      "warning": {
        "default": vars.color.yellow[400],
        "hover": vars.color.yellow[500],
        "secondary": vars.color.yellow[200],
        "secondaryHover": vars.color.yellow[300],
        "tertiary": vars.color.yellow[100],
        "tertiaryHover": vars.color.yellow[200]
      }
    },
    "black": {
      "100": "rgb(4.7059% 4.7059% 5.098% / 0.05098)",
      "200": "rgb(4.7059% 4.7059% 5.098% / 0.10196)",
      "300": "rgb(4.7059% 4.7059% 5.098% / 0.2)",
      "400": "rgb(4.7059% 4.7059% 5.098% / 0.4)",
      "500": "rgb(4.7059% 4.7059% 5.098% / 0.69804)",
      "600": "rgb(4.7059% 4.7059% 5.098% / 0.8)",
      "700": "rgb(4.7059% 4.7059% 5.098% / 0.85098)",
      "800": "rgb(4.7059% 4.7059% 5.098% / 0.89804)",
      "900": "rgb(4.7059% 4.7059% 5.098% / 0.94902)",
      "1000": "rgb(4.7059% 4.7059% 5.098%)"
    },
    "border": {
      "brand": {
        "default": vars.color.brand[800],
        "secondary": vars.color.brand[600],
        "tertiary": vars.color.brand[500]
      },
      "danger": {
        "default": vars.color.red[700],
        "secondary": vars.color.red[600],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.gray[300],
        "secondary": vars.color.gray[500],
        "tertiary": vars.color.gray[700]
      },
      "disabled": {
        "default": vars.color.brand[400]
      },
      "neutral": {
        "default": vars.color.slate[900],
        "secondary": vars.color.slate[600],
        "tertiary": vars.color.slate[400]
      },
      "positive": {
        "default": vars.color.green[800],
        "secondary": vars.color.green[600],
        "tertiary": vars.color.green[500]
      },
      "warning": {
        "default": vars.color.yellow[900],
        "secondary": vars.color.yellow[700],
        "tertiary": vars.color.yellow[600]
      }
    },
    "brand": {
      "100": "rgb(96.078% 96.078% 96.078%)",
      "200": "rgb(90.196% 90.196% 90.196%)",
      "300": "rgb(85.098% 85.098% 85.098%)",
      "400": "rgb(70.196% 70.196% 70.196%)",
      "500": "rgb(45.882% 45.882% 45.882%)",
      "600": "rgb(26.667% 26.667% 26.667%)",
      "700": "rgb(21.961% 21.961% 21.961%)",
      "800": "rgb(17.255% 17.255% 17.255%)",
      "900": "rgb(11.765% 11.765% 11.765%)",
      "1000": "rgb(6.6667% 6.6667% 6.6667%)"
    },
    "gray": {
      "100": "rgb(96.078% 96.078% 96.078%)",
      "200": "rgb(90.196% 90.196% 90.196%)",
      "300": "rgb(85.098% 85.098% 85.098%)",
      "400": "rgb(70.196% 70.196% 70.196%)",
      "500": "rgb(45.882% 45.882% 45.882%)",
      "600": "rgb(26.667% 26.667% 26.667%)",
      "700": "rgb(21.961% 21.961% 21.961%)",
      "800": "rgb(17.255% 17.255% 17.255%)",
      "900": "rgb(11.765% 11.765% 11.765%)",
      "1000": "rgb(6.6667% 6.6667% 6.6667%)"
    },
    "green": {
      "100": "rgb(92.157% 100% 93.333%)",
      "200": "rgb(81.176% 96.863% 82.745%)",
      "300": "rgb(68.627% 95.686% 77.647%)",
      "400": " rgb(52.157% 87.843% 63.922%)",
      "500": "rgb(7.8431% 68.235% 36.078%)",
      "600": "rgb(0% 60% 31.765%)",
      "700": "rgb(0% 50.196% 26.275%)",
      "800": "rgb(0.78431% 32.941% 17.647%)",
      "900": "rgb(0.78431% 25.098% 13.725%)",
      "1000": "rgb(2.3529% 17.647% 10.588%)"
    },
    "icon": {
      "brand": {
        "default": vars.color.brand[800],
        "onBrand": vars.color.brand[100],
        "onBrandSecondary": vars.color.brand[900],
        "onBrandTertiary": vars.color.brand[800],
        "secondary": vars.color.brand[600],
        "tertiary": vars.color.brand[500]
      },
      "danger": {
        "default": vars.color.red[700],
        "onDanger": vars.color.red[100],
        "onDangerSecondary": vars.color.red[700],
        "onDangerTertiary": vars.color.red[700],
        "secondary": vars.color.red[600],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.gray[900],
        "secondary": vars.color.gray[500],
        "tertiary": vars.color.gray[400]
      },
      "disabled": {
        "default": vars.color.brand[400],
        "onDisabled": vars.color.brand[400]
      },
      "neutral": {
        "default": vars.color.slate[900],
        "onNeutral": vars.color.slate[100],
        "onNeutralSecondary": vars.color.slate[900],
        "onNeutralTertiary": vars.color.slate[800],
        "secondary": vars.color.slate[700],
        "tertiary": vars.color.slate[600]
      },
      "positive": {
        "default": vars.color.green[800],
        "onPositive": vars.color.green[100],
        "onPositiveSecondary": vars.color.green[800],
        "onPositiveTertiary": vars.color.green[900],
        "secondary": vars.color.green[600],
        "tertiary": vars.color.green[500]
      },
      "warning": {
        "default": vars.color.yellow[900],
        "onWarning": vars.color.yellow[1000],
        "onWarningSecondary": vars.color.yellow[800],
        "onWarningTertiary": vars.color.yellow[900],
        "secondary": vars.color.yellow[700],
        "tertiary": vars.color.yellow[600]
      }
    },
    "pink": {
      "100": "color(srgb 0.9882352941176471 0.9450980392156862 0.9921568627450981)",
      "200": "color(srgb 0.9803921568627451 0.8823529411764706 0.9803921568627451)",
      "300": "color(srgb 0.9607843137254902 0.7529411764705882 0.9372549019607843)",
      "400": "color(srgb 0.9450980392156862 0.6196078431372549 0.8627450980392157)",
      "500": "color(srgb 0.9176470588235294 0.24705882352941178 0.7215686274509804)",
      "600": "color(srgb 0.8431372549019608 0.19607843137254902 0.6588235294117647)",
      "700": "color(srgb 0.7294117647058823 0.16470588235294117 0.5725490196078431)",
      "800": "color(srgb 0.5411764705882353 0.13333333333333333 0.43529411764705883)",
      "900": "color(srgb 0.3411764705882353 0.09411764705882353 0.2901960784313726)",
      "1000": "color(srgb 0.24705882352941178 0.08235294117647059 0.21176470588235294)"
    },
    "red": {
      "100": "color(srgb 0.996078431372549 0.9137254901960784 0.9058823529411765)",
      "200": "color(srgb 0.9921568627450981 0.8274509803921568 0.8156862745098039)",
      "300": "color(srgb 0.9882352941176471 0.7019607843137254 0.6784313725490196)",
      "400": "color(srgb 0.9568627450980393 0.4666666666666667 0.41568627450980394)",
      "500": "color(srgb 0.9254901960784314 0.13333333333333333 0.12156862745098039)",
      "600": "rgb(75.294% 5.8824% 4.7059%)",
      "700": "rgb(56.471% 4.3137% 3.5294%)",
      "800": "rgb(41.176% 3.1373% 2.7451%)",
      "900": "rgb(30.196% 4.3137% 3.9216%)",
      "1000": "rgb(18.824% 2.3529% 1.1765%)"
    },
    "slate": {
      "100": "rgb(95.294% 95.294% 95.294%)",
      "200": "rgb(89.02% 89.02% 89.02%)",
      "300": "rgb(80.392% 80.392% 80.392%)",
      "400": "rgb(69.804% 69.804% 69.804%)",
      "500": "rgb(58.039% 58.039% 58.039%)",
      "600": "rgb(46.275% 46.275% 46.275%)",
      "700": "rgb(35.294% 35.294% 35.294%)",
      "800": "rgb(26.275% 26.275% 26.275%)",
      "900": "rgb(18.824% 18.824% 18.824%)",
      "1000": "rgb(14.118% 14.118% 14.118%)"
    },
    "text": {
      "brand": {
        "default": vars.color.brand[800],
        "onBrand": vars.color.brand[100],
        "onBrandSecondary": vars.color.brand[900],
        "onBrandTertiary": vars.color.brand[800],
        "secondary": vars.color.brand[600],
        "tertiary": vars.color.brand[500]
      },
      "danger": {
        "default": vars.color.red[700],
        "onDanger": vars.color.red[100],
        "onDangerSecondary": vars.color.red[700],
        "onDangerTertiary": vars.color.red[700],
        "secondary": vars.color.red[600],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.gray[900],
        "secondary": vars.color.gray[500],
        "tertiary": vars.color.gray[400]
      },
      "disabled": {
        "default": vars.color.brand[400],
        "onDisabled": vars.color.brand[400]
      },
      "neutral": {
        "default": vars.color.slate[900],
        "onNeutral": vars.color.slate[100],
        "onNeutralSecondary": vars.color.slate[900],
        "onNeutralTertiary": vars.color.slate[800],
        "secondary": vars.color.slate[700],
        "tertiary": vars.color.slate[600]
      },
      "positive": {
        "default": vars.color.green[800],
        "onPositive": vars.color.green[100],
        "onPositiveSecondary": vars.color.green[800],
        "onPositiveTertiary": vars.color.green[800],
        "secondary": vars.color.green[600],
        "tertiary": vars.color.green[500]
      },
      "warning": {
        "default": vars.color.yellow[900],
        "onWarning": vars.color.yellow[1000],
        "onWarningSecondary": vars.color.yellow[800],
        "onWarningTertiary": vars.color.yellow[900],
        "secondary": vars.color.yellow[700],
        "tertiary": vars.color.yellow[600]
      }
    },
    "white": {
      "100": "rgb(100% 100% 100% / 0.05098)",
      "200": "rgb(100% 100% 100% / 0.10196)",
      "300": "rgb(100% 100% 100% / 0.2)",
      "400": "rgb(100% 100% 100% / 0.4)",
      "500": "rgb(100% 100% 100% / 0.69804)",
      "600": "rgb(100% 100% 100% / 0.8)",
      "700": "rgb(100% 100% 100% / 0.85098)",
      "800": "rgb(100% 100% 100% / 0.89804)",
      "900": "rgb(100% 100% 100% / 0.94902)",
      "1000": "rgb(100% 100% 100%))"
    },
    "yellow": {
      "100": "rgb(100% 98.431% 92.157%)",
      "200": "rgb(100% 94.51% 76.078%)",
      "300": "rgb(100% 90.98% 63.922%)",
      "400": "rgb(90.98% 72.549% 19.216%)",
      "500": "rgb(89.804% 62.745% 0%)",
      "600": "rgb(74.902% 41.569% 0.78431%)",
      "700": "rgb(59.216% 31.765% 0.78431%)",
      "800": "rgb(40.784% 17.647% 1.1765%)",
      "900": "rgb(32.157% 14.51% 1.5686%",
      "1000": "rgb(25.098% 10.588% 0.39216%)"
    }
  },
  "size": {
    "blur": {
      "100": "0.25rem"
    },
    "depth": {
      "0": "0",
      "100": "0.25rem",
      "200": "0.5rem",
      "400": "1rem",
      "800": "2rem",
      "1200": "3rem",
      "025": "0.0625rem",
      "negative025": "-0.0625rem",
      "negative100": "-0.25rem",
      "negative200": "-0.5rem",
      "negative400": "-1rem",
      "negative800": "-2rem",
      "negative1200": "-3rem"
    },
    "icon": {
      "large": "2.5rem",
      "medium": "2rem",
      "small": "1.5rem"
    },
    "radius": {
      "100": "0.25rem",
      "200": "0.5rem",
      "400": "1rem",
      "full": "624.9375rem"
    },
    "space": {
      "0": "0",
      "100": "0.25rem",
      "150": "0.375rem",
      "200": "0.5rem",
      "300": "0.75rem",
      "400": "1rem",
      "600": "1.5rem",
      "800": "2rem",
      "1200": "3rem",
      "1600": "4rem",
      "2400": "6rem",
      "4000": "0",
      "050": "0.125rem",
      "negative100": "-0.25rem",
      "negative200": "-0.5rem",
      "negative300": "-0.75rem",
      "negative400": "-1rem",
      "negative600": "-1.5rem"
    },
    "stroke": {
      "border": "0.0625rem",
      "focusRing": "0.125rem"
    }
  },
  "typography": {
    "body": {
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "medium": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['02'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "code": {
      "large": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "medium": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['02'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "family": {
      "mono": "\"roboto mono\", monospace",
      "sans": "inter, sans-serif",
      "serif": "\"noto serif\", serif"
    },
    "heading": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['06'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "scale": {
      "10": "4.5rem",
      "01": "0.75rem",
      "02": "0.875rem",
      "03": "1rem",
      "04": "1.25rem",
      "05": "1.5rem",
      "06": "2rem",
      "07": "2.5rem",
      "08": "3rem",
      "09": "4rem"
    },
    "subheading": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "subtitle": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['06'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['07'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "titleHero": {
      "fontFamily": vars.typography.family.sans,
      "fontSize": vars.typography.scale[10],
      "fontWeight": vars.typography.weight.bold,
      "letterSpacing": "0",
      "lineHeight": "1"
    },
    "titlePage": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['08'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['09'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['07'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "weight": {
      "black": "900",
      "bold": "700",
      "extrabold": "800",
      "extralight": "200",
      "light": "300",
      "medium": "500",
      "regular": "400",
      "semibold": "600",
      "thin": "100"
    }
  }
});

export const [darkClass, dark] = createTheme(vars, {
  "color": {
    "background": {
      "brand": {
        "default": vars.color.white[100],
        "hover": vars.color.brand[300],
        "secondary": vars.color.brand[600],
        "secondaryHover": vars.color.brand[500],
        "tertiary": vars.color.brand[600],
        "tertiaryHover": vars.color.brand[800]
      },
      "danger": {
        "default": vars.color.red[600],
        "hover": vars.color.red[700],
        "secondary": vars.color.red[800],
        "secondaryHover": vars.color.red[900],
        "tertiary": vars.color.red[900],
        "tertiaryHover": vars.color.red[1000]
      },
      "default": {
        "default": vars.color.gray[900],
        "hover": vars.color.gray[700],
        "secondary": vars.color.gray[800],
        "secondaryHover": vars.color.gray[900],
        "tertiary": vars.color.gray[600],
        "tertiaryHover": vars.color.gray[700]
      },
      "disabled": {
        "default": vars.color.brand[700]
      },
      "neutral": {
        "default": vars.color.slate[400],
        "hover": vars.color.slate[500],
        "secondary": vars.color.slate[900],
        "secondaryHover": vars.color.slate[1000],
        "tertiary": vars.color.slate[900],
        "tertiaryHover": vars.color.slate[1000]
      },
      "positive": {
        "default": vars.color.green[700],
        "hover": vars.color.green[800],
        "secondary": vars.color.green[800],
        "secondaryHover": vars.color.green[900],
        "tertiary": vars.color.green[900],
        "tertiaryHover": vars.color.green[1000]
      },
      "warning": {
        "default": vars.color.yellow[400],
        "hover": vars.color.yellow[500],
        "secondary": vars.color.yellow[800],
        "secondaryHover": vars.color.yellow[900],
        "tertiary": vars.color.yellow[900],
        "tertiaryHover": vars.color.yellow[1000]
      }
    },
    "black": {
      "100": "rgb(4.7059% 4.7059% 5.098% / 0.05098)",
      "200": "rgb(4.7059% 4.7059% 5.098% / 0.10196)",
      "300": "rgb(4.7059% 4.7059% 5.098% / 0.2)",
      "400": "rgb(4.7059% 4.7059% 5.098% / 0.4)",
      "500": "rgb(4.7059% 4.7059% 5.098% / 0.69804)",
      "600": "rgb(4.7059% 4.7059% 5.098% / 0.8)",
      "700": "rgb(4.7059% 4.7059% 5.098% / 0.85098)",
      "800": "rgb(4.7059% 4.7059% 5.098% / 0.89804)",
      "900": "rgb(4.7059% 4.7059% 5.098% / 0.94902)",
      "1000": "rgb(4.7059% 4.7059% 5.098%)"
    },
    "border": {
      "brand": {
        "default": vars.color.brand[100],
        "secondary": vars.color.brand[300],
        "tertiary": vars.color.brand[400]
      },
      "danger": {
        "default": vars.color.red[200],
        "secondary": vars.color.red[400],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.gray[600],
        "secondary": vars.color.gray[500],
        "tertiary": vars.color.gray[400]
      },
      "disabled": {
        "default": vars.color.brand[600]
      },
      "neutral": {
        "default": vars.color.slate[100],
        "secondary": vars.color.slate[500],
        "tertiary": vars.color.slate[600]
      },
      "positive": {
        "default": vars.color.green[200],
        "secondary": vars.color.green[400],
        "tertiary": vars.color.green[600]
      },
      "warning": {
        "default": vars.color.yellow[200],
        "secondary": vars.color.yellow[400],
        "tertiary": vars.color.yellow[600]
      }
    },
    "brand": {
      "100": "rgb(96.078% 96.078% 96.078%)",
      "200": "rgb(90.196% 90.196% 90.196%)",
      "300": "rgb(85.098% 85.098% 85.098%)",
      "400": "rgb(70.196% 70.196% 70.196%)",
      "500": "rgb(45.882% 45.882% 45.882%)",
      "600": "rgb(26.667% 26.667% 26.667%)",
      "700": "rgb(21.961% 21.961% 21.961%)",
      "800": "rgb(17.255% 17.255% 17.255%)",
      "900": "rgb(11.765% 11.765% 11.765%)",
      "1000": "rgb(6.6667% 6.6667% 6.6667%)"
    },
    "gray": {
      "100": "rgb(96.078% 96.078% 96.078%)",
      "200": "rgb(90.196% 90.196% 90.196%)",
      "300": "rgb(85.098% 85.098% 85.098%)",
      "400": "rgb(70.196% 70.196% 70.196%)",
      "500": "rgb(45.882% 45.882% 45.882%)",
      "600": "rgb(26.667% 26.667% 26.667%)",
      "700": "rgb(21.961% 21.961% 21.961%)",
      "800": "rgb(17.255% 17.255% 17.255%)",
      "900": "rgb(11.765% 11.765% 11.765%)",
      "1000": "rgb(6.6667% 6.6667% 6.6667%)"
    },
    "green": {
      "100": "rgb(92.157% 100% 93.333%)",
      "200": "rgb(81.176% 96.863% 82.745%)",
      "300": "rgb(68.627% 95.686% 77.647%)",
      "400": " rgb(52.157% 87.843% 63.922%)",
      "500": "rgb(7.8431% 68.235% 36.078%)",
      "600": "rgb(0% 60% 31.765%)",
      "700": "rgb(0% 50.196% 26.275%)",
      "800": "rgb(0.78431% 32.941% 17.647%)",
      "900": "rgb(0.78431% 25.098% 13.725%)",
      "1000": "rgb(2.3529% 17.647% 10.588%)"
    },
    "icon": {
      "brand": {
        "default": vars.color.brand[100],
        "onBrand": vars.color.brand[900],
        "onBrandSecondary": vars.color.brand[100],
        "onBrandTertiary": vars.color.brand[100],
        "secondary": vars.color.brand[300],
        "tertiary": vars.color.brand[400]
      },
      "danger": {
        "default": vars.color.red[200],
        "onDanger": vars.color.red[100],
        "onDangerSecondary": vars.color.red[100],
        "onDangerTertiary": vars.color.red[100],
        "secondary": vars.color.red[400],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.white[1000],
        "secondary": vars.color.white[500],
        "tertiary": vars.color.white[400]
      },
      "disabled": {
        "default": vars.color.brand[500],
        "onDisabled": vars.color.brand[400]
      },
      "neutral": {
        "default": vars.color.slate[200],
        "onNeutral": vars.color.slate[1000],
        "onNeutralSecondary": vars.color.slate[100],
        "onNeutralTertiary": vars.color.slate[100],
        "secondary": vars.color.slate[300],
        "tertiary": vars.color.slate[400]
      },
      "positive": {
        "default": vars.color.green[200],
        "onPositive": vars.color.green[100],
        "onPositiveSecondary": vars.color.green[100],
        "onPositiveTertiary": vars.color.green[100],
        "secondary": vars.color.green[400],
        "tertiary": vars.color.green[600]
      },
      "warning": {
        "default": vars.color.yellow[200],
        "onWarning": vars.color.yellow[1000],
        "onWarningSecondary": vars.color.yellow[100],
        "onWarningTertiary": vars.color.yellow[100],
        "secondary": vars.color.yellow[400],
        "tertiary": vars.color.yellow[600]
      }
    },
    "pink": {
      "100": "color(srgb 0.9882352941176471 0.9450980392156862 0.9921568627450981)",
      "200": "color(srgb 0.9803921568627451 0.8823529411764706 0.9803921568627451)",
      "300": "color(srgb 0.9607843137254902 0.7529411764705882 0.9372549019607843)",
      "400": "color(srgb 0.9450980392156862 0.6196078431372549 0.8627450980392157)",
      "500": "color(srgb 0.9176470588235294 0.24705882352941178 0.7215686274509804)",
      "600": "color(srgb 0.8431372549019608 0.19607843137254902 0.6588235294117647)",
      "700": "color(srgb 0.7294117647058823 0.16470588235294117 0.5725490196078431)",
      "800": "color(srgb 0.5411764705882353 0.13333333333333333 0.43529411764705883)",
      "900": "color(srgb 0.3411764705882353 0.09411764705882353 0.2901960784313726)",
      "1000": "color(srgb 0.24705882352941178 0.08235294117647059 0.21176470588235294)"
    },
    "red": {
      "100": "color(srgb 0.996078431372549 0.9137254901960784 0.9058823529411765)",
      "200": "color(srgb 0.9921568627450981 0.8274509803921568 0.8156862745098039)",
      "300": "color(srgb 0.9882352941176471 0.7019607843137254 0.6784313725490196)",
      "400": "color(srgb 0.9568627450980393 0.4666666666666667 0.41568627450980394)",
      "500": "color(srgb 0.9254901960784314 0.13333333333333333 0.12156862745098039)",
      "600": "rgb(75.294% 5.8824% 4.7059%)",
      "700": "rgb(56.471% 4.3137% 3.5294%)",
      "800": "rgb(41.176% 3.1373% 2.7451%)",
      "900": "rgb(30.196% 4.3137% 3.9216%)",
      "1000": "rgb(18.824% 2.3529% 1.1765%)"
    },
    "slate": {
      "100": "rgb(95.294% 95.294% 95.294%)",
      "200": "rgb(89.02% 89.02% 89.02%)",
      "300": "rgb(80.392% 80.392% 80.392%)",
      "400": "rgb(69.804% 69.804% 69.804%)",
      "500": "rgb(58.039% 58.039% 58.039%)",
      "600": "rgb(46.275% 46.275% 46.275%)",
      "700": "rgb(35.294% 35.294% 35.294%)",
      "800": "rgb(26.275% 26.275% 26.275%)",
      "900": "rgb(18.824% 18.824% 18.824%)",
      "1000": "rgb(14.118% 14.118% 14.118%)"
    },
    "text": {
      "brand": {
        "default": vars.color.brand[100],
        "onBrand": vars.color.brand[900],
        "onBrandSecondary": vars.color.brand[100],
        "onBrandTertiary": vars.color.brand[100],
        "secondary": vars.color.brand[300],
        "tertiary": vars.color.brand[400]
      },
      "danger": {
        "default": vars.color.red[200],
        "onDanger": vars.color.red[100],
        "onDangerSecondary": vars.color.red[100],
        "onDangerTertiary": vars.color.red[100],
        "secondary": vars.color.red[400],
        "tertiary": vars.color.red[500]
      },
      "default": {
        "default": vars.color.white[1000],
        "secondary": vars.color.white[500],
        "tertiary": vars.color.white[400]
      },
      "disabled": {
        "default": vars.color.brand[500],
        "onDisabled": vars.color.brand[400]
      },
      "neutral": {
        "default": vars.color.slate[200],
        "onNeutral": vars.color.slate[1000],
        "onNeutralSecondary": vars.color.slate[100],
        "onNeutralTertiary": vars.color.slate[100],
        "secondary": vars.color.slate[300],
        "tertiary": vars.color.slate[400]
      },
      "positive": {
        "default": vars.color.green[200],
        "onPositive": vars.color.green[100],
        "onPositiveSecondary": vars.color.green[100],
        "onPositiveTertiary": vars.color.green[100],
        "secondary": vars.color.green[400],
        "tertiary": vars.color.green[600]
      },
      "warning": {
        "default": vars.color.yellow[200],
        "onWarning": vars.color.yellow[1000],
        "onWarningSecondary": vars.color.yellow[100],
        "onWarningTertiary": vars.color.yellow[100],
        "secondary": vars.color.yellow[400],
        "tertiary": vars.color.yellow[600]
      }
    },
    "white": {
      "100": "rgb(100% 100% 100% / 0.05098)",
      "200": "rgb(100% 100% 100% / 0.10196)",
      "300": "rgb(100% 100% 100% / 0.2)",
      "400": "rgb(100% 100% 100% / 0.4)",
      "500": "rgb(100% 100% 100% / 0.69804)",
      "600": "rgb(100% 100% 100% / 0.8)",
      "700": "rgb(100% 100% 100% / 0.85098)",
      "800": "rgb(100% 100% 100% / 0.89804)",
      "900": "rgb(100% 100% 100% / 0.94902)",
      "1000": "rgb(100% 100% 100%))"
    },
    "yellow": {
      "100": "rgb(100% 98.431% 92.157%)",
      "200": "rgb(100% 94.51% 76.078%)",
      "300": "rgb(100% 90.98% 63.922%)",
      "400": "rgb(90.98% 72.549% 19.216%)",
      "500": "rgb(89.804% 62.745% 0%)",
      "600": "rgb(74.902% 41.569% 0.78431%)",
      "700": "rgb(59.216% 31.765% 0.78431%)",
      "800": "rgb(40.784% 17.647% 1.1765%)",
      "900": "rgb(32.157% 14.51% 1.5686%",
      "1000": "rgb(25.098% 10.588% 0.39216%)"
    }
  },
  "size": {
    "blur": {
      "100": "0.25rem"
    },
    "depth": {
      "0": "0",
      "100": "0.25rem",
      "200": "0.5rem",
      "400": "1rem",
      "800": "2rem",
      "1200": "3rem",
      "025": "0.0625rem",
      "negative025": "-0.0625rem",
      "negative100": "-0.25rem",
      "negative200": "-0.5rem",
      "negative400": "-1rem",
      "negative800": "-2rem",
      "negative1200": "-3rem"
    },
    "icon": {
      "large": "2.5rem",
      "medium": "2rem",
      "small": "1.5rem"
    },
    "radius": {
      "100": "0.25rem",
      "200": "0.5rem",
      "400": "1rem",
      "full": "624.9375rem"
    },
    "space": {
      "0": "0",
      "100": "0.25rem",
      "150": "0.375rem",
      "200": "0.5rem",
      "300": "0.75rem",
      "400": "1rem",
      "600": "1.5rem",
      "800": "2rem",
      "1200": "3rem",
      "1600": "4rem",
      "2400": "6rem",
      "4000": "0",
      "050": "0.125rem",
      "negative100": "-0.25rem",
      "negative200": "-0.5rem",
      "negative300": "-0.75rem",
      "negative400": "-1rem",
      "negative600": "-1.5rem"
    },
    "stroke": {
      "border": "0.0625rem",
      "focusRing": "0.125rem"
    }
  },
  "typography": {
    "body": {
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "medium": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['02'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "code": {
      "large": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "medium": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.mono,
        "fontSize": vars.typography.scale['02'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "family": {
      "mono": "\"roboto mono\", monospace",
      "sans": "inter, sans-serif",
      "serif": "\"noto serif\", serif"
    },
    "heading": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['06'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.semibold,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "scale": {
      "10": "4.5rem",
      "01": "0.75rem",
      "02": "0.875rem",
      "03": "1rem",
      "04": "1.25rem",
      "05": "1.5rem",
      "06": "2rem",
      "07": "2.5rem",
      "08": "3rem",
      "09": "4rem"
    },
    "subheading": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['04'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['03'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "subtitle": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['06'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['07'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['05'],
        "fontWeight": vars.typography.weight.regular,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "titleHero": {
      "fontFamily": vars.typography.family.sans,
      "fontSize": vars.typography.scale[10],
      "fontWeight": vars.typography.weight.bold,
      "letterSpacing": "0",
      "lineHeight": "1"
    },
    "titlePage": {
      "base": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['08'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "large": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['09'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      },
      "small": {
        "fontFamily": vars.typography.family.sans,
        "fontSize": vars.typography.scale['07'],
        "fontWeight": vars.typography.weight.bold,
        "letterSpacing": "0",
        "lineHeight": "1"
      }
    },
    "weight": {
      "black": "900",
      "bold": "700",
      "extrabold": "800",
      "extralight": "200",
      "light": "300",
      "medium": "500",
      "regular": "400",
      "semibold": "600",
      "thin": "100"
    }
  }
});

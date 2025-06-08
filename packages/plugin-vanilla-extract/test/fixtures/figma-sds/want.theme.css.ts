import { createGlobalThemeContract, createTheme } from "@vanilla-extract/css";

export const tzVars = createGlobalThemeContract({
  "color": {
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
    },
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
    "icon": {
      "brand": {
        "default": "color-icon-brand-default",
        "secondary": "color-icon-brand-secondary",
        "tertiary": "color-icon-brand-tertiary",
        "onBrand": "color-icon-brand-on-brand",
        "onBrandSecondary": "color-icon-brand-on-brand-secondary",
        "onBrandTertiary": "color-icon-brand-on-brand-tertiary"
      },
      "danger": {
        "default": "color-icon-danger-default",
        "secondary": "color-icon-danger-secondary",
        "tertiary": "color-icon-danger-tertiary",
        "onDanger": "color-icon-danger-on-danger",
        "onDangerSecondary": "color-icon-danger-on-danger-secondary",
        "onDangerTertiary": "color-icon-danger-on-danger-tertiary"
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
        "secondary": "color-icon-neutral-secondary",
        "tertiary": "color-icon-neutral-tertiary",
        "onNeutral": "color-icon-neutral-on-neutral",
        "onNeutralSecondary": "color-icon-neutral-on-neutral-secondary",
        "onNeutralTertiary": "color-icon-neutral-on-neutral-tertiary"
      },
      "positive": {
        "default": "color-icon-positive-default",
        "secondary": "color-icon-positive-secondary",
        "tertiary": "color-icon-positive-tertiary",
        "onPositive": "color-icon-positive-on-positive",
        "onPositiveSecondary": "color-icon-positive-on-positive-secondary",
        "onPositiveTertiary": "color-icon-positive-on-positive-tertiary"
      },
      "warning": {
        "default": "color-icon-warning-default",
        "secondary": "color-icon-warning-secondary",
        "tertiary": "color-icon-warning-tertiary",
        "onWarning": "color-icon-warning-on-warning",
        "onWarningSecondary": "color-icon-warning-on-warning-secondary",
        "onWarningTertiary": "color-icon-warning-on-warning-tertiary"
      }
    },
    "text": {
      "brand": {
        "default": "color-text-brand-default",
        "secondary": "color-text-brand-secondary",
        "tertiary": "color-text-brand-tertiary",
        "onBrand": "color-text-brand-on-brand",
        "onBrandSecondary": "color-text-brand-on-brand-secondary",
        "onBrandTertiary": "color-text-brand-on-brand-tertiary"
      },
      "danger": {
        "default": "color-text-danger-default",
        "secondary": "color-text-danger-secondary",
        "tertiary": "color-text-danger-tertiary",
        "onDanger": "color-text-danger-on-danger",
        "onDangerSecondary": "color-text-danger-on-danger-secondary",
        "onDangerTertiary": "color-text-danger-on-danger-tertiary"
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
        "secondary": "color-text-positive-secondary",
        "tertiary": "color-text-positive-tertiary",
        "onPositive": "color-text-positive-on-positive",
        "onPositiveSecondary": "color-text-positive-on-positive-secondary",
        "onPositiveTertiary": "color-text-positive-on-positive-tertiary"
      },
      "warning": {
        "default": "color-text-warning-default",
        "secondary": "color-text-warning-secondary",
        "tertiary": "color-text-warning-tertiary",
        "onWarning": "color-text-warning-on-warning",
        "onWarningSecondary": "color-text-warning-on-warning-secondary",
        "onWarningTertiary": "color-text-warning-on-warning-tertiary"
      }
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
      "small": "size-icon-small",
      "medium": "size-icon-medium",
      "large": "size-icon-large"
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
    "titleHero": "typography-title-hero",
    "titlePage": {
      "small": "typography-title-page-small",
      "base": "typography-title-page-base",
      "large": "typography-title-page-large"
    },
    "subtitle": {
      "small": "typography-subtitle-small",
      "base": "typography-subtitle-base",
      "large": "typography-subtitle-large"
    },
    "heading": {
      "small": "typography-heading-small",
      "base": "typography-heading-base",
      "large": "typography-heading-large"
    },
    "subheading": {
      "small": "typography-subheading-small",
      "base": "typography-subheading-base",
      "large": "typography-subheading-large"
    },
    "body": {
      "small": "typography-body-small",
      "medium": "typography-body-medium",
      "large": "typography-body-large"
    },
    "code": {
      "small": "typography-code-small",
      "medium": "typography-code-medium",
      "large": "typography-code-large"
    },
    "family": {
      "mono": "typography-family-mono",
      "sans": "typography-family-sans",
      "serif": "typography-family-serif"
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
    "weight": {
      "thin": "typography-weight-thin",
      "extralight": "typography-weight-extralight",
      "light": "typography-weight-light",
      "regular": "typography-weight-regular",
      "medium": "typography-weight-medium",
      "semibold": "typography-weight-semibold",
      "bold": "typography-weight-bold",
      "extrabold": "typography-weight-extrabold",
      "black": "typography-weight-black"
    }
  }
});

export const [lightClass, light] = createTheme({
  "color": {
    "black": {
      "100": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.050980392156862744)",
      "200": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.10196078431372549)",
      "300": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.2)",
      "400": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.4)",
      "500": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.6980392156862745)",
      "600": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8)",
      "700": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8509803921568627)",
      "800": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8980392156862745)",
      "900": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.9490196078431372)",
      "1000": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744)"
    },
    "brand": {
      "100": "color(srgb 0.9607843137254902 0.9607843137254902 0.9607843137254902)",
      "200": "color(srgb 0.9019607843137255 0.9019607843137255 0.9019607843137255)",
      "300": "color(srgb 0.8509803921568627 0.8509803921568627 0.8509803921568627)",
      "400": "color(srgb 0.7019607843137254 0.7019607843137254 0.7019607843137254)",
      "500": "color(srgb 0.4588235294117647 0.4588235294117647 0.4588235294117647)",
      "600": "color(srgb 0.26666666666666666 0.26666666666666666 0.26666666666666666)",
      "700": "color(srgb 0.2196078431372549 0.2196078431372549 0.2196078431372549)",
      "800": "color(srgb 0.17254901960784313 0.17254901960784313 0.17254901960784313)",
      "900": "color(srgb 0.11764705882352941 0.11764705882352941 0.11764705882352941)",
      "1000": "color(srgb 0.06666666666666667 0.06666666666666667 0.06666666666666667)"
    },
    "gray": {
      "100": "color(srgb 0.9607843137254902 0.9607843137254902 0.9607843137254902)",
      "200": "color(srgb 0.9019607843137255 0.9019607843137255 0.9019607843137255)",
      "300": "color(srgb 0.8509803921568627 0.8509803921568627 0.8509803921568627)",
      "400": "color(srgb 0.7019607843137254 0.7019607843137254 0.7019607843137254)",
      "500": "color(srgb 0.4588235294117647 0.4588235294117647 0.4588235294117647)",
      "600": "color(srgb 0.26666666666666666 0.26666666666666666 0.26666666666666666)",
      "700": "color(srgb 0.2196078431372549 0.2196078431372549 0.2196078431372549)",
      "800": "color(srgb 0.17254901960784313 0.17254901960784313 0.17254901960784313)",
      "900": "color(srgb 0.11764705882352941 0.11764705882352941 0.11764705882352941)",
      "1000": "color(srgb 0.06666666666666667 0.06666666666666667 0.06666666666666667)"
    },
    "green": {
      "100": "color(srgb 0.9215686274509803 1 0.9333333333333333)",
      "200": "color(srgb 0.8117647058823529 0.9686274509803922 0.8274509803921568)",
      "300": "color(srgb 0.6862745098039216 0.9568627450980393 0.7764705882352941)",
      "400": "color(srgb 0.5215686274509804 0.8784313725490196 0.6392156862745098)",
      "500": "color(srgb 0.0784313725490196 0.6823529411764706 0.3607843137254902)",
      "600": "color(srgb 0 0.6 0.3176470588235294)",
      "700": "color(srgb 0 0.5019607843137255 0.2627450980392157)",
      "800": "color(srgb 0.00784313725490196 0.32941176470588235 0.17647058823529413)",
      "900": "color(srgb 0.00784313725490196 0.25098039215686274 0.13725490196078433)",
      "1000": "color(srgb 0.023529411764705882 0.17647058823529413 0.10588235294117647)"
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
      "600": "color(srgb 0.7529411764705882 0.058823529411764705 0.047058823529411764)",
      "700": "color(srgb 0.5647058823529412 0.043137254901960784 0.03529411764705882)",
      "800": "color(srgb 0.4117647058823529 0.03137254901960784 0.027450980392156862)",
      "900": "color(srgb 0.30196078431372547 0.043137254901960784 0.0392156862745098)",
      "1000": "color(srgb 0.18823529411764706 0.023529411764705882 0.011764705882352941)"
    },
    "slate": {
      "100": "color(srgb 0.9529411764705882 0.9529411764705882 0.9529411764705882)",
      "200": "color(srgb 0.8901960784313725 0.8901960784313725 0.8901960784313725)",
      "300": "color(srgb 0.803921568627451 0.803921568627451 0.803921568627451)",
      "400": "color(srgb 0.6980392156862745 0.6980392156862745 0.6980392156862745)",
      "500": "color(srgb 0.5803921568627451 0.5803921568627451 0.5803921568627451)",
      "600": "color(srgb 0.4627450980392157 0.4627450980392157 0.4627450980392157)",
      "700": "color(srgb 0.35294117647058826 0.35294117647058826 0.35294117647058826)",
      "800": "color(srgb 0.2627450980392157 0.2627450980392157 0.2627450980392157)",
      "900": "color(srgb 0.18823529411764706 0.18823529411764706 0.18823529411764706)",
      "1000": "color(srgb 0.1411764705882353 0.1411764705882353 0.1411764705882353)"
    },
    "white": {
      "100": "color(srgb 1 1 1 / 0.050980392156862744)",
      "200": "color(srgb 1 1 1 / 0.10196078431372549)",
      "300": "color(srgb 1 1 1 / 0.2)",
      "400": "color(srgb 1 1 1 / 0.4)",
      "500": "color(srgb 1 1 1 / 0.6980392156862745)",
      "600": "color(srgb 1 1 1 / 0.8)",
      "700": "color(srgb 1 1 1 / 0.8509803921568627)",
      "800": "color(srgb 1 1 1 / 0.8980392156862745)",
      "900": "color(srgb 1 1 1 / 0.9490196078431372)",
      "1000": "color(srgb 1 1 1)"
    },
    "yellow": {
      "100": "color(srgb 1 0.984313725490196 0.9215686274509803)",
      "200": "color(srgb 1 0.9450980392156862 0.7607843137254902)",
      "300": "color(srgb 1 0.9098039215686274 0.6392156862745098)",
      "400": "color(srgb 0.9098039215686274 0.7254901960784313 0.19215686274509805)",
      "500": "color(srgb 0.8980392156862745 0.6274509803921569 0)",
      "600": "color(srgb 0.7490196078431373 0.41568627450980394 0.00784313725490196)",
      "700": "color(srgb 0.592156862745098 0.3176470588235294 0.00784313725490196)",
      "800": "color(srgb 0.40784313725490196 0.17647058823529413 0.011764705882352941)",
      "900": "color(srgb 0.3215686274509804 0.1450980392156863 0.01568627450980392)",
      "1000": "color(srgb 0.25098039215686274 0.10588235294117647 0.00392156862745098)"
    },
    "background": {
      "brand": {
        "default": tzVars.color.brand[800],
        "hover": tzVars.color.brand[900],
        "secondary": tzVars.color.brand[200],
        "secondaryHover": tzVars.color.brand[300],
        "tertiary": tzVars.color.brand[100],
        "tertiaryHover": tzVars.color.brand[200]
      },
      "danger": {
        "default": tzVars.color.red[500],
        "hover": tzVars.color.red[600],
        "secondary": tzVars.color.red[200],
        "secondaryHover": tzVars.color.red[300],
        "tertiary": tzVars.color.red[100],
        "tertiaryHover": tzVars.color.red[200]
      },
      "default": {
        "default": tzVars.color.white[1000],
        "hover": tzVars.color.gray[100],
        "secondary": tzVars.color.gray[100],
        "secondaryHover": tzVars.color.gray[200],
        "tertiary": tzVars.color.gray[300],
        "tertiaryHover": tzVars.color.gray[400]
      },
      "disabled": {
        "default": tzVars.color.brand[300]
      },
      "neutral": {
        "default": tzVars.color.slate[700],
        "hover": tzVars.color.slate[800],
        "secondary": tzVars.color.slate[300],
        "secondaryHover": tzVars.color.slate[400],
        "tertiary": tzVars.color.slate[200],
        "tertiaryHover": tzVars.color.slate[300]
      },
      "positive": {
        "default": tzVars.color.green[500],
        "hover": tzVars.color.green[600],
        "secondary": tzVars.color.green[200],
        "secondaryHover": tzVars.color.green[300],
        "tertiary": tzVars.color.green[100],
        "tertiaryHover": tzVars.color.green[200]
      },
      "warning": {
        "default": tzVars.color.yellow[400],
        "hover": tzVars.color.yellow[500],
        "secondary": tzVars.color.yellow[200],
        "secondaryHover": tzVars.color.yellow[300],
        "tertiary": tzVars.color.yellow[100],
        "tertiaryHover": tzVars.color.yellow[200]
      }
    },
    "border": {
      "brand": {
        "default": tzVars.color.brand[800],
        "secondary": tzVars.color.brand[600],
        "tertiary": tzVars.color.brand[500]
      },
      "danger": {
        "default": tzVars.color.red[700],
        "secondary": tzVars.color.red[600],
        "tertiary": tzVars.color.red[500]
      },
      "default": {
        "default": tzVars.color.gray[300],
        "secondary": tzVars.color.gray[500],
        "tertiary": tzVars.color.gray[700]
      },
      "disabled": {
        "default": tzVars.color.brand[400]
      },
      "neutral": {
        "default": tzVars.color.slate[900],
        "secondary": tzVars.color.slate[600],
        "tertiary": tzVars.color.slate[400]
      },
      "positive": {
        "default": tzVars.color.green[800],
        "secondary": tzVars.color.green[600],
        "tertiary": tzVars.color.green[500]
      },
      "warning": {
        "default": tzVars.color.yellow[900],
        "secondary": tzVars.color.yellow[700],
        "tertiary": tzVars.color.yellow[600]
      }
    },
    "icon": {
      "brand": {
        "default": tzVars.color.brand[800],
        "secondary": tzVars.color.brand[600],
        "tertiary": tzVars.color.brand[500],
        "onBrand": tzVars.color.brand[100],
        "onBrandSecondary": tzVars.color.brand[900],
        "onBrandTertiary": tzVars.color.brand[800]
      },
      "danger": {
        "default": tzVars.color.red[700],
        "secondary": tzVars.color.red[600],
        "tertiary": tzVars.color.red[500],
        "onDanger": tzVars.color.red[100],
        "onDangerSecondary": tzVars.color.red[700],
        "onDangerTertiary": tzVars.color.red[700]
      },
      "default": {
        "default": tzVars.color.gray[900],
        "secondary": tzVars.color.gray[500],
        "tertiary": tzVars.color.gray[400]
      },
      "disabled": {
        "default": tzVars.color.brand[400],
        "onDisabled": tzVars.color.brand[400]
      },
      "neutral": {
        "default": tzVars.color.slate[900],
        "secondary": tzVars.color.slate[700],
        "tertiary": tzVars.color.slate[600],
        "onNeutral": tzVars.color.slate[100],
        "onNeutralSecondary": tzVars.color.slate[900],
        "onNeutralTertiary": tzVars.color.slate[800]
      },
      "positive": {
        "default": tzVars.color.green[800],
        "secondary": tzVars.color.green[600],
        "tertiary": tzVars.color.green[500],
        "onPositive": tzVars.color.green[100],
        "onPositiveSecondary": tzVars.color.green[800],
        "onPositiveTertiary": tzVars.color.green[900]
      },
      "warning": {
        "default": tzVars.color.yellow[900],
        "secondary": tzVars.color.yellow[700],
        "tertiary": tzVars.color.yellow[600],
        "onWarning": tzVars.color.yellow[1000],
        "onWarningSecondary": tzVars.color.yellow[800],
        "onWarningTertiary": tzVars.color.yellow[900]
      }
    },
    "text": {
      "brand": {
        "default": tzVars.color.brand[800],
        "secondary": tzVars.color.brand[600],
        "tertiary": tzVars.color.brand[500],
        "onBrand": tzVars.color.brand[100],
        "onBrandSecondary": tzVars.color.brand[900],
        "onBrandTertiary": tzVars.color.brand[800]
      },
      "danger": {
        "default": tzVars.color.red[700],
        "secondary": tzVars.color.red[600],
        "tertiary": tzVars.color.red[500],
        "onDanger": tzVars.color.red[100],
        "onDangerSecondary": tzVars.color.red[700],
        "onDangerTertiary": tzVars.color.red[700]
      },
      "default": {
        "default": tzVars.color.gray[900],
        "secondary": tzVars.color.gray[500],
        "tertiary": tzVars.color.gray[400]
      },
      "disabled": {
        "default": tzVars.color.brand[400],
        "onDisabled": tzVars.color.brand[400]
      },
      "neutral": {
        "default": tzVars.color.slate[900],
        "onNeutral": tzVars.color.slate[100],
        "onNeutralSecondary": tzVars.color.slate[900],
        "onNeutralTertiary": tzVars.color.slate[800],
        "secondary": tzVars.color.slate[700],
        "tertiary": tzVars.color.slate[600]
      },
      "positive": {
        "default": tzVars.color.green[800],
        "secondary": tzVars.color.green[600],
        "tertiary": tzVars.color.green[500],
        "onPositive": tzVars.color.green[100],
        "onPositiveSecondary": tzVars.color.green[800],
        "onPositiveTertiary": tzVars.color.green[800]
      },
      "warning": {
        "default": tzVars.color.yellow[900],
        "secondary": tzVars.color.yellow[700],
        "tertiary": tzVars.color.yellow[600],
        "onWarning": tzVars.color.yellow[1000],
        "onWarningSecondary": tzVars.color.yellow[800],
        "onWarningTertiary": tzVars.color.yellow[900]
      }
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
      "small": "1.5rem",
      "medium": "2rem",
      "large": "2.5rem"
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
    "titleHero": {
      "font-family": tzVars.typography.family.sans,
      "font-size": tzVars.typography.scale[10],
      "font-weight": tzVars.typography.weight.bold
    },
    "titlePage": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['07'],
        "font-weight": tzVars.typography.weight.bold
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['08'],
        "font-weight": tzVars.typography.weight.bold
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['09'],
        "font-weight": tzVars.typography.weight.bold
      }
    },
    "subtitle": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.regular
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['06'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['07'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "heading": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.semibold
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.semibold
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['06'],
        "font-weight": tzVars.typography.weight.semibold
      }
    },
    "subheading": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "body": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['02'],
        "font-weight": tzVars.typography.weight.regular
      },
      "medium": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "code": {
      "small": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['02'],
        "font-weight": tzVars.typography.weight.regular
      },
      "medium": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "family": {
      "mono": "\"roboto mono\", monospace",
      "sans": "inter, sans-serif",
      "serif": "\"noto serif\", serif"
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
    "weight": {
      "thin": "100",
      "extralight": "200",
      "light": "300",
      "regular": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700",
      "extrabold": "800",
      "black": "900"
    }
  }
});

export const [darkClass, dark] = createTheme({
  "color": {
    "black": {
      "100": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.050980392156862744)",
      "200": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.10196078431372549)",
      "300": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.2)",
      "400": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.4)",
      "500": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.6980392156862745)",
      "600": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8)",
      "700": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8509803921568627)",
      "800": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.8980392156862745)",
      "900": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744 / 0.9490196078431372)",
      "1000": "color(srgb 0.047058823529411764 0.047058823529411764 0.050980392156862744)"
    },
    "brand": {
      "100": "color(srgb 0.9607843137254902 0.9607843137254902 0.9607843137254902)",
      "200": "color(srgb 0.9019607843137255 0.9019607843137255 0.9019607843137255)",
      "300": "color(srgb 0.8509803921568627 0.8509803921568627 0.8509803921568627)",
      "400": "color(srgb 0.7019607843137254 0.7019607843137254 0.7019607843137254)",
      "500": "color(srgb 0.4588235294117647 0.4588235294117647 0.4588235294117647)",
      "600": "color(srgb 0.26666666666666666 0.26666666666666666 0.26666666666666666)",
      "700": "color(srgb 0.2196078431372549 0.2196078431372549 0.2196078431372549)",
      "800": "color(srgb 0.17254901960784313 0.17254901960784313 0.17254901960784313)",
      "900": "color(srgb 0.11764705882352941 0.11764705882352941 0.11764705882352941)",
      "1000": "color(srgb 0.06666666666666667 0.06666666666666667 0.06666666666666667)"
    },
    "gray": {
      "100": "color(srgb 0.9607843137254902 0.9607843137254902 0.9607843137254902)",
      "200": "color(srgb 0.9019607843137255 0.9019607843137255 0.9019607843137255)",
      "300": "color(srgb 0.8509803921568627 0.8509803921568627 0.8509803921568627)",
      "400": "color(srgb 0.7019607843137254 0.7019607843137254 0.7019607843137254)",
      "500": "color(srgb 0.4588235294117647 0.4588235294117647 0.4588235294117647)",
      "600": "color(srgb 0.26666666666666666 0.26666666666666666 0.26666666666666666)",
      "700": "color(srgb 0.2196078431372549 0.2196078431372549 0.2196078431372549)",
      "800": "color(srgb 0.17254901960784313 0.17254901960784313 0.17254901960784313)",
      "900": "color(srgb 0.11764705882352941 0.11764705882352941 0.11764705882352941)",
      "1000": "color(srgb 0.06666666666666667 0.06666666666666667 0.06666666666666667)"
    },
    "green": {
      "100": "color(srgb 0.9215686274509803 1 0.9333333333333333)",
      "200": "color(srgb 0.8117647058823529 0.9686274509803922 0.8274509803921568)",
      "300": "color(srgb 0.6862745098039216 0.9568627450980393 0.7764705882352941)",
      "400": "color(srgb 0.5215686274509804 0.8784313725490196 0.6392156862745098)",
      "500": "color(srgb 0.0784313725490196 0.6823529411764706 0.3607843137254902)",
      "600": "color(srgb 0 0.6 0.3176470588235294)",
      "700": "color(srgb 0 0.5019607843137255 0.2627450980392157)",
      "800": "color(srgb 0.00784313725490196 0.32941176470588235 0.17647058823529413)",
      "900": "color(srgb 0.00784313725490196 0.25098039215686274 0.13725490196078433)",
      "1000": "color(srgb 0.023529411764705882 0.17647058823529413 0.10588235294117647)"
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
      "600": "color(srgb 0.7529411764705882 0.058823529411764705 0.047058823529411764)",
      "700": "color(srgb 0.5647058823529412 0.043137254901960784 0.03529411764705882)",
      "800": "color(srgb 0.4117647058823529 0.03137254901960784 0.027450980392156862)",
      "900": "color(srgb 0.30196078431372547 0.043137254901960784 0.0392156862745098)",
      "1000": "color(srgb 0.18823529411764706 0.023529411764705882 0.011764705882352941)"
    },
    "slate": {
      "100": "color(srgb 0.9529411764705882 0.9529411764705882 0.9529411764705882)",
      "200": "color(srgb 0.8901960784313725 0.8901960784313725 0.8901960784313725)",
      "300": "color(srgb 0.803921568627451 0.803921568627451 0.803921568627451)",
      "400": "color(srgb 0.6980392156862745 0.6980392156862745 0.6980392156862745)",
      "500": "color(srgb 0.5803921568627451 0.5803921568627451 0.5803921568627451)",
      "600": "color(srgb 0.4627450980392157 0.4627450980392157 0.4627450980392157)",
      "700": "color(srgb 0.35294117647058826 0.35294117647058826 0.35294117647058826)",
      "800": "color(srgb 0.2627450980392157 0.2627450980392157 0.2627450980392157)",
      "900": "color(srgb 0.18823529411764706 0.18823529411764706 0.18823529411764706)",
      "1000": "color(srgb 0.1411764705882353 0.1411764705882353 0.1411764705882353)"
    },
    "white": {
      "100": "color(srgb 1 1 1 / 0.050980392156862744)",
      "200": "color(srgb 1 1 1 / 0.10196078431372549)",
      "300": "color(srgb 1 1 1 / 0.2)",
      "400": "color(srgb 1 1 1 / 0.4)",
      "500": "color(srgb 1 1 1 / 0.6980392156862745)",
      "600": "color(srgb 1 1 1 / 0.8)",
      "700": "color(srgb 1 1 1 / 0.8509803921568627)",
      "800": "color(srgb 1 1 1 / 0.8980392156862745)",
      "900": "color(srgb 1 1 1 / 0.9490196078431372)",
      "1000": "color(srgb 1 1 1)"
    },
    "yellow": {
      "100": "color(srgb 1 0.984313725490196 0.9215686274509803)",
      "200": "color(srgb 1 0.9450980392156862 0.7607843137254902)",
      "300": "color(srgb 1 0.9098039215686274 0.6392156862745098)",
      "400": "color(srgb 0.9098039215686274 0.7254901960784313 0.19215686274509805)",
      "500": "color(srgb 0.8980392156862745 0.6274509803921569 0)",
      "600": "color(srgb 0.7490196078431373 0.41568627450980394 0.00784313725490196)",
      "700": "color(srgb 0.592156862745098 0.3176470588235294 0.00784313725490196)",
      "800": "color(srgb 0.40784313725490196 0.17647058823529413 0.011764705882352941)",
      "900": "color(srgb 0.3215686274509804 0.1450980392156863 0.01568627450980392)",
      "1000": "color(srgb 0.25098039215686274 0.10588235294117647 0.00392156862745098)"
    },
    "background": {
      "brand": {
        "default": tzVars.color.white[100],
        "hover": tzVars.color.brand[300],
        "secondary": tzVars.color.brand[600],
        "secondaryHover": tzVars.color.brand[500],
        "tertiary": tzVars.color.brand[600],
        "tertiaryHover": tzVars.color.brand[800]
      },
      "danger": {
        "default": tzVars.color.red[600],
        "hover": tzVars.color.red[700],
        "secondary": tzVars.color.red[800],
        "secondaryHover": tzVars.color.red[900],
        "tertiary": tzVars.color.red[900],
        "tertiaryHover": tzVars.color.red[1000]
      },
      "default": {
        "default": tzVars.color.gray[900],
        "hover": tzVars.color.gray[700],
        "secondary": tzVars.color.gray[800],
        "secondaryHover": tzVars.color.gray[900],
        "tertiary": tzVars.color.gray[600],
        "tertiaryHover": tzVars.color.gray[700]
      },
      "disabled": {
        "default": tzVars.color.brand[700]
      },
      "neutral": {
        "default": tzVars.color.slate[400],
        "hover": tzVars.color.slate[500],
        "secondary": tzVars.color.slate[900],
        "secondaryHover": tzVars.color.slate[1000],
        "tertiary": tzVars.color.slate[900],
        "tertiaryHover": tzVars.color.slate[1000]
      },
      "positive": {
        "default": tzVars.color.green[700],
        "hover": tzVars.color.green[800],
        "secondary": tzVars.color.green[800],
        "secondaryHover": tzVars.color.green[900],
        "tertiary": tzVars.color.green[900],
        "tertiaryHover": tzVars.color.green[1000]
      },
      "warning": {
        "default": tzVars.color.yellow[400],
        "hover": tzVars.color.yellow[500],
        "secondary": tzVars.color.yellow[800],
        "secondaryHover": tzVars.color.yellow[900],
        "tertiary": tzVars.color.yellow[900],
        "tertiaryHover": tzVars.color.yellow[1000]
      }
    },
    "border": {
      "brand": {
        "default": tzVars.color.brand[100],
        "secondary": tzVars.color.brand[300],
        "tertiary": tzVars.color.brand[400]
      },
      "danger": {
        "default": tzVars.color.red[200],
        "secondary": tzVars.color.red[400],
        "tertiary": tzVars.color.red[500]
      },
      "default": {
        "default": tzVars.color.gray[600],
        "secondary": tzVars.color.gray[500],
        "tertiary": tzVars.color.gray[400]
      },
      "disabled": {
        "default": tzVars.color.brand[600]
      },
      "neutral": {
        "default": tzVars.color.slate[100],
        "secondary": tzVars.color.slate[500],
        "tertiary": tzVars.color.slate[600]
      },
      "positive": {
        "default": tzVars.color.green[200],
        "secondary": tzVars.color.green[400],
        "tertiary": tzVars.color.green[600]
      },
      "warning": {
        "default": tzVars.color.yellow[200],
        "secondary": tzVars.color.yellow[400],
        "tertiary": tzVars.color.yellow[600]
      }
    },
    "icon": {
      "brand": {
        "default": tzVars.color.brand[100],
        "secondary": tzVars.color.brand[300],
        "tertiary": tzVars.color.brand[400],
        "onBrand": tzVars.color.brand[900],
        "onBrandSecondary": tzVars.color.brand[100],
        "onBrandTertiary": tzVars.color.brand[100]
      },
      "danger": {
        "default": tzVars.color.red[200],
        "secondary": tzVars.color.red[400],
        "tertiary": tzVars.color.red[500],
        "onDanger": tzVars.color.red[100],
        "onDangerSecondary": tzVars.color.red[100],
        "onDangerTertiary": tzVars.color.red[100]
      },
      "default": {
        "default": tzVars.color.white[1000],
        "secondary": tzVars.color.white[500],
        "tertiary": tzVars.color.white[400]
      },
      "disabled": {
        "default": tzVars.color.brand[500],
        "onDisabled": tzVars.color.brand[400]
      },
      "neutral": {
        "default": tzVars.color.slate[200],
        "secondary": tzVars.color.slate[300],
        "tertiary": tzVars.color.slate[400],
        "onNeutral": tzVars.color.slate[1000],
        "onNeutralSecondary": tzVars.color.slate[100],
        "onNeutralTertiary": tzVars.color.slate[100]
      },
      "positive": {
        "default": tzVars.color.green[200],
        "secondary": tzVars.color.green[400],
        "tertiary": tzVars.color.green[600],
        "onPositive": tzVars.color.green[100],
        "onPositiveSecondary": tzVars.color.green[100],
        "onPositiveTertiary": tzVars.color.green[100]
      },
      "warning": {
        "default": tzVars.color.yellow[200],
        "secondary": tzVars.color.yellow[400],
        "tertiary": tzVars.color.yellow[600],
        "onWarning": tzVars.color.yellow[1000],
        "onWarningSecondary": tzVars.color.yellow[100],
        "onWarningTertiary": tzVars.color.yellow[100]
      }
    },
    "text": {
      "brand": {
        "default": tzVars.color.brand[100],
        "secondary": tzVars.color.brand[300],
        "tertiary": tzVars.color.brand[400],
        "onBrand": tzVars.color.brand[900],
        "onBrandSecondary": tzVars.color.brand[100],
        "onBrandTertiary": tzVars.color.brand[100]
      },
      "danger": {
        "default": tzVars.color.red[200],
        "secondary": tzVars.color.red[400],
        "tertiary": tzVars.color.red[500],
        "onDanger": tzVars.color.red[100],
        "onDangerSecondary": tzVars.color.red[100],
        "onDangerTertiary": tzVars.color.red[100]
      },
      "default": {
        "default": tzVars.color.white[1000],
        "secondary": tzVars.color.white[500],
        "tertiary": tzVars.color.white[400]
      },
      "disabled": {
        "default": tzVars.color.brand[500],
        "onDisabled": tzVars.color.brand[400]
      },
      "neutral": {
        "default": tzVars.color.slate[200],
        "onNeutral": tzVars.color.slate[1000],
        "onNeutralSecondary": tzVars.color.slate[100],
        "onNeutralTertiary": tzVars.color.slate[100],
        "secondary": tzVars.color.slate[300],
        "tertiary": tzVars.color.slate[400]
      },
      "positive": {
        "default": tzVars.color.green[200],
        "secondary": tzVars.color.green[400],
        "tertiary": tzVars.color.green[600],
        "onPositive": tzVars.color.green[100],
        "onPositiveSecondary": tzVars.color.green[100],
        "onPositiveTertiary": tzVars.color.green[100]
      },
      "warning": {
        "default": tzVars.color.yellow[200],
        "secondary": tzVars.color.yellow[400],
        "tertiary": tzVars.color.yellow[600],
        "onWarning": tzVars.color.yellow[1000],
        "onWarningSecondary": tzVars.color.yellow[100],
        "onWarningTertiary": tzVars.color.yellow[100]
      }
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
      "small": "1.5rem",
      "medium": "2rem",
      "large": "2.5rem"
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
    "titleHero": {
      "font-family": tzVars.typography.family.sans,
      "font-size": tzVars.typography.scale[10],
      "font-weight": tzVars.typography.weight.bold
    },
    "titlePage": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['07'],
        "font-weight": tzVars.typography.weight.bold
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['08'],
        "font-weight": tzVars.typography.weight.bold
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['09'],
        "font-weight": tzVars.typography.weight.bold
      }
    },
    "subtitle": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.regular
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['06'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['07'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "heading": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.semibold
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.semibold
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['06'],
        "font-weight": tzVars.typography.weight.semibold
      }
    },
    "subheading": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "base": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['05'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "body": {
      "small": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['02'],
        "font-weight": tzVars.typography.weight.regular
      },
      "medium": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.sans,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "code": {
      "small": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['02'],
        "font-weight": tzVars.typography.weight.regular
      },
      "medium": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['03'],
        "font-weight": tzVars.typography.weight.regular
      },
      "large": {
        "font-family": tzVars.typography.family.mono,
        "font-size": tzVars.typography.scale['04'],
        "font-weight": tzVars.typography.weight.regular
      }
    },
    "family": {
      "mono": "\"roboto mono\", monospace",
      "sans": "inter, sans-serif",
      "serif": "\"noto serif\", serif"
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
    "weight": {
      "thin": "100",
      "extralight": "200",
      "light": "300",
      "regular": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700",
      "extrabold": "800",
      "black": "900"
    }
  }
});

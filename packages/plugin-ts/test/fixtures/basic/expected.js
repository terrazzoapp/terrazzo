export const tokens = {
    color: {
        'black-120': '#0d0300',
        'black-110': '#1d1008',
        'black-100': '#2e2119',
        'black-90': '#41342c',
        'black-80': '#544741',
        'black-70': '#675c56',
        'black-60': '#7b716c',
        'black-50': '#908783',
        'black-40': '#a59e9a',
        'black-30': '#bbb6b3',
        'black-20': '#d1cecc',
        'black-10': '#e8e6e5',
        'black-05': '#f3f2f2',
        'black-00': '#ffffff',
    },
};
export const tokensFlat = {
    'color.black-120': '#0d0300',
    'color.black-110': '#1d1008',
    'color.black-100': '#2e2119',
    'color.black-90': '#41342c',
    'color.black-80': '#544741',
    'color.black-70': '#675c56',
    'color.black-60': '#7b716c',
    'color.black-50': '#908783',
    'color.black-40': '#a59e9a',
    'color.black-30': '#bbb6b3',
    'color.black-20': '#d1cecc',
    'color.black-10': '#e8e6e5',
    'color.black-05': '#f3f2f2',
    'color.black-00': '#ffffff',
};
export const modes = {
    'color.black-120': {
        light: '#0d0300',
        dark: '#ffffff',
    },
    'color.black-110': {
        light: '#1d1008',
        dark: '#f3f2f2',
    },
    'color.black-100': {
        light: '#2e2119',
        dark: '#e8e6e5',
    },
    'color.black-90': {
        light: '#41342c',
        dark: '#d1cecc',
    },
    'color.black-80': {
        light: '#544741',
        dark: '#bbb6b3',
    },
    'color.black-70': {
        light: '#675c56',
        dark: '#a59e9a',
    },
    'color.black-60': {
        light: '#7b716c',
        dark: '#908783',
    },
    'color.black-50': {
        light: '#908783',
        dark: '#908783',
    },
    'color.black-40': {
        light: '#a59e9a',
        dark: '#675c56',
    },
    'color.black-30': {
        light: '#bbb6b3',
        dark: '#544741',
    },
    'color.black-20': {
        light: '#d1cecc',
        dark: '#41342c',
    },
    'color.black-10': {
        light: '#e8e6e5',
        dark: '#2e2119',
    },
    'color.black-05': {
        light: '#f3f2f2',
        dark: '#1d1008',
    },
    'color.black-00': {
        light: '#ffffff',
        dark: '#0d0300',
    },
};
/** Get mode value */
export function mode(tokenID, modeName) {
    return modes[tokenID][modeName];
}

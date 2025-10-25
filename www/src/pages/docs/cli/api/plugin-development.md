---
title: Plugin Development
layout: ../../../../layouts/docs.astro
---

# Plugin Development

Terrazzo plugins are inspired by [Rollup](https://rollupjs.org/), and the philosophy that token management should be as easy as possible. Though making a Terrazzo plugin doesn’t require any knowledge of Rollup, those familiar with Rollup will find a quick ramp-up.

## Getting Started

Terrazzo’s plugin system revolves around 2 key steps: **transform**, then **build**. In the transform step, you are generating possible values for a <b>format</b>, e.g. `css` or `js`, almost as if you’re populating a database. In the build step, you <b>query</b> those values, and assemble the output format however you’d like. In other words, **transform is for generating values,** and **build is for assembling those values.**

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 849 351" role="img" aria-label="Diagram of transform–build pipeline">
  <defs>
    <style class="style-fonts">@font-face {font-family:"Virgil";src:url("https://excalidraw.com/Virgil.woff2");}@font-face{font-family:"Cascadia";src:url("https://excalidraw.com/Cascadia.woff2");}@font-face{font-family:"Assistant";src:url("https://excalidraw.com/Assistant-Regular.woff2");}</style>
  </defs>
  <g stroke-linecap="round" transform="translate(195 10) rotate(0 65 17.5)"><path d="M8.75 0 C52.48 -1.67, 94.87 0.86, 121.25 0 M8.75 0 C40.97 0.76, 73.95 -0.11, 121.25 0 M121.25 0 C127.7 -1.54, 131.44 2.28, 130 8.75 M121.25 0 C125.61 -2.02, 130.3 0.77, 130 8.75 M130 8.75 C131.68 14.25, 130.73 15.57, 130 26.25 M130 8.75 C129.8 12.3, 129.22 15.18, 130 26.25 M130 26.25 C129.24 30.4, 127.05 33.59, 121.25 35 M130 26.25 C128.07 32.42, 129.09 33.92, 121.25 35 M121.25 35 C99.61 32.37, 75.06 32.58, 8.75 35 M121.25 35 C82.55 35.08, 45.66 35.54, 8.75 35 M8.75 35 C3.64 33.55, -0.06 32.25, 0 26.25 M8.75 35 C1.17 35.98, 2.25 30.22, 0 26.25 M0 26.25 C0.57 20.89, -0.89 14.95, 0 8.75 M0 26.25 C0.41 20.94, 0.02 14.95, 0 8.75 M0 8.75 C-0.01 4.36, 2.69 1.09, 8.75 0 M0 8.75 C0.75 3.11, 3.91 0.05, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(222.1500015258789 15) rotate(0 37.849998474121094 12.5)"><text x="37.849998474121094" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token a</text></g><g stroke-linecap="round" transform="translate(10 148) rotate(0 68 26)"><path d="M13 0 C50.21 -1.89, 87.8 0.95, 123 0 M13 0 C42.75 -0.41, 71.8 -1.64, 123 0 M123 0 C130.1 1.41, 138 2.91, 136 13 M123 0 C133.91 0.39, 134.96 2.63, 136 13 M136 13 C137.47 22.35, 136.47 29.53, 136 39 M136 13 C136.7 20.65, 135.84 27.62, 136 39 M136 39 C135.22 45.86, 130.32 51.29, 123 52 M136 39 C138.26 49.24, 130.64 51.23, 123 52 M123 52 C84.09 54.66, 46.84 54.44, 13 52 M123 52 C80.05 52.37, 37.4 53.02, 13 52 M13 52 C6.3 52.78, -0.06 47.09, 0 39 M13 52 C2.43 53.28, -1.43 49.25, 0 39 M0 39 C-1.15 33.45, -1.25 24.9, 0 13 M0 39 C0.07 29.41, 0.66 20.26, 0 13 M0 13 C-1.72 4.31, 2.84 -1, 13 0 M0 13 C0.29 5.88, 3.45 0.76, 13 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(30.25 161.5) rotate(0 47.75 12.5)"><text x="47.75" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">transform</text></g><g stroke-linecap="round" transform="translate(148 10) rotate(0 29.5 17.5)"><path d="M8.75 0 C18.87 3.07, 26.33 -0.89, 50.25 0 C57.56 0.21, 60.9 1.35, 59 8.75 C56.51 11.44, 60.68 14.19, 59 26.25 C58.71 30.16, 56.74 37.1, 50.25 35 C40.69 34.57, 27.53 36.16, 8.75 35 C5.05 36.44, -2.96 30.12, 0 26.25 C1.79 19.42, -0.89 16.53, 0 8.75 C1.84 6.05, 3.13 0.55, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C19.55 -0.34, 29.8 -1.7, 50.25 0 M8.75 0 C22.7 -0.53, 36.75 -0.07, 50.25 0 M50.25 0 C54.8 -1.76, 59.26 1.05, 59 8.75 M50.25 0 C54.71 2.18, 57.3 4.9, 59 8.75 M59 8.75 C57.32 13.58, 58.17 21.77, 59 26.25 M59 8.75 C58.55 13.34, 58.86 18.79, 59 26.25 M59 26.25 C57.32 32.37, 57.83 34.06, 50.25 35 M59 26.25 C56.84 30.79, 54.07 36.77, 50.25 35 M50.25 35 C41.97 36.17, 31.74 33.24, 8.75 35 M50.25 35 C36.76 34.61, 22.5 35.41, 8.75 35 M8.75 35 C1.4 35.86, 1.96 30.46, 0 26.25 M8.75 35 C2.78 34.21, 0.22 32.75, 0 26.25 M0 26.25 C0.43 20.94, 1.74 16.96, 0 8.75 M0 26.25 C0 21.08, -0.1 15.12, 0 8.75 M0 8.75 C0.65 3.08, 3.78 0.04, 8.75 0 M0 8.75 C-2.23 2.24, 2.73 -0.24, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(161.61666679382324 15) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round"><g transform="translate(81.4302031324807 146) rotate(0 29.78489843375965 -54.867397137745996)"><path d="M0.35 -0.5 C3.72 -8.59, 11.36 -29.28, 21.19 -47.58 C31.01 -65.88, 52.8 -99.94, 59.32 -110.28 M-0.92 -1.81 C2.16 -10.34, 10.15 -31.58, 20.04 -49.48 C29.92 -67.39, 51.61 -99.42, 58.42 -109.25" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(81.4302031324807 146) rotate(0 29.78489843375965 -54.867397137745996)"><path d="M52.28 -85.02 C53.61 -94.98, 57.5 -104.07, 58.42 -109.25 M52.28 -85.02 C53.62 -90.54, 55.6 -96.54, 58.42 -109.25" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(81.4302031324807 146) rotate(0 29.78489843375965 -54.867397137745996)"><path d="M38.14 -94.63 C44.98 -100.95, 54.3 -106.34, 58.42 -109.25 M38.14 -94.63 C43.13 -97.72, 48.71 -101.28, 58.42 -109.25" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(505 139) rotate(0 68 26)"><path d="M13 0 C48.88 0.53, 82.25 1.44, 123 0 M13 0 C52.24 -0.29, 92.14 -0.6, 123 0 M123 0 C132.05 1.78, 134.41 6.07, 136 13 M123 0 C129.5 0.73, 135.76 6.57, 136 13 M136 13 C137.44 22.17, 137.65 28.89, 136 39 M136 13 C135.3 23.56, 136.34 32.27, 136 39 M136 39 C134.89 45.76, 133.52 51.68, 123 52 M136 39 C135.66 46.81, 133.2 51.36, 123 52 M123 52 C91.45 51.07, 58.12 49.84, 13 52 M123 52 C80.21 50.9, 38.77 50.16, 13 52 M13 52 C3.64 53.69, 0.43 48.44, 0 39 M13 52 C4.15 51.95, 0.62 47.09, 0 39 M0 39 C-0.4 35.2, -1.45 28.51, 0 13 M0 39 C0.96 31.07, -0.8 23.39, 0 13 M0 13 C-0.35 3.59, 3.21 -1.26, 13 0 M0 13 C-1.73 3.13, 5.62 0.38, 13 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(551.7333335876465 152.5) rotate(0 21.266666412353516 12.5)"><text x="21.266666412353516" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">build</text></g><g stroke-linecap="round" transform="translate(728 80) rotate(0 55.5 73)"><path d="M27.75 0 C42.59 -1.29, 57.34 -0.79, 83.25 0 M27.75 0 C48.52 0.38, 70.91 -0.4, 83.25 0 M83.25 0 C101.75 -0.85, 110 7.28, 111 27.75 M83.25 0 C103.21 1.73, 111.68 8.76, 111 27.75 M111 27.75 C110.78 49.56, 111.26 70.68, 111 118.25 M111 27.75 C111.71 62.73, 111.34 96.94, 111 118.25 M111 118.25 C110.6 136.75, 101.16 146.39, 83.25 146 M111 118.25 C111.21 136.69, 102.11 145.76, 83.25 146 M83.25 146 C72.66 144.56, 57.31 147.15, 27.75 146 M83.25 146 C68.45 145.41, 53.23 146.34, 27.75 146 M27.75 146 C8.32 145.43, -1.6 136.46, 0 118.25 M27.75 146 C7.62 146.87, 0.17 138.29, 0 118.25 M0 118.25 C-0.6 88.78, -0.08 58.94, 0 27.75 M0 118.25 C-0.1 91.82, -0.17 66.9, 0 27.75 M0 27.75 C0.92 8.88, 10.45 1.19, 27.75 0 M0 27.75 C1.1 8.87, 9.6 2.27, 27.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g stroke-linecap="round"><g transform="translate(745.7617494667368 111) rotate(0 37 0)"><path d="M-1.09 0.22 C11.09 0.31, 61.2 -0.64, 73.54 -0.59 M0.54 -0.71 C12.48 -0.37, 59.89 0.78, 72.35 0.64" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(745.2356148386796 124.58586520405902) rotate(0 37 0)"><path d="M-0.4 0.52 C12.02 0.42, 61.55 -0.4, 73.91 -0.39 M1.58 -0.26 C13.89 -0.2, 61.03 1.14, 72.91 0.94" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(744.2539332357746 139.0882849548916) rotate(0 37 0)"><path d="M0.73 0.03 C12.82 0.15, 61.12 0.1, 73.41 0.1 M-0.35 -1 C12.07 -0.61, 63.43 1.29, 75.81 1.69" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(744.4015259466321 154.31812565976475) rotate(0 37 0)"><path d="M1.16 -1 C13.61 -0.79, 62.79 0.8, 74.87 1.12 M0.3 1.09 C12.67 1.01, 62.31 -0.08, 74.37 -0.41" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(745.8109224386512 169.29810473475317) rotate(0 37 0)"><path d="M0.25 -0.18 C12.32 -0.29, 61.33 -0.04, 73.43 0.06 M-1.08 -1.32 C10.69 -1.28, 59.48 1.7, 72.18 1.62" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(745.3882337654429 184.33911225378318) rotate(0 37 0)"><path d="M-1.17 0.11 C11.2 -0.01, 62 -0.59, 74.36 -0.52 M0.42 -0.88 C12.65 -0.85, 61.12 0.86, 73.61 0.74" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(745.4976692900807 198.7163464066341) rotate(0 37 0)"><path d="M0.14 -0.03 C12.59 -0.33, 61.74 -0.65, 74.22 -0.6 M-1.24 -1.09 C11.11 -0.74, 60.72 0.16, 73.39 0.62" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g transform="translate(734 239) rotate(0 51.75 12.5)"><text x="0" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">output.css</text></g><g stroke-linecap="round" transform="translate(235 68) rotate(0 65 17.5)"><path d="M8.75 0 C54.97 1.76, 97.65 0.02, 121.25 0 M8.75 0 C48.61 -0.79, 88.99 -1.15, 121.25 0 M121.25 0 C128.92 1.4, 130.47 3.26, 130 8.75 M121.25 0 C127.93 -0.35, 129.67 3.93, 130 8.75 M130 8.75 C131.29 14.42, 128.72 21.89, 130 26.25 M130 8.75 C130.69 14.73, 129.32 22.62, 130 26.25 M130 26.25 C130.47 32.75, 126.85 35.33, 121.25 35 M130 26.25 C130.17 31.44, 125.72 33.94, 121.25 35 M121.25 35 C89.51 34.58, 57.34 33.39, 8.75 35 M121.25 35 C88.54 35.53, 57.65 35.53, 8.75 35 M8.75 35 C2.86 33.9, -1.48 30.57, 0 26.25 M8.75 35 C1.03 36.27, -1.99 34.36, 0 26.25 M0 26.25 C1.28 21.83, 0.13 13.85, 0 8.75 M0 26.25 C-0.01 22.61, -0.28 18.62, 0 8.75 M0 8.75 C-0.59 4.81, 1.06 0.12, 8.75 0 M0 8.75 C-0.57 4.08, 4.55 0.5, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(263.7333335876465 73) rotate(0 36.266666412353516 12.5)"><text x="36.266666412353516" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token b</text></g><g stroke-linecap="round" transform="translate(188 68) rotate(0 29.5 17.5)"><path d="M8.75 0 C17.42 -3.12, 31.96 -3.48, 50.25 0 C52.9 -2.2, 60.02 4, 59 8.75 C61.18 14.57, 56.77 19.2, 59 26.25 C59.38 32.01, 57.39 33.28, 50.25 35 C33.68 38.36, 22.21 31.85, 8.75 35 C2.79 37.11, -1.73 30.94, 0 26.25 C2.97 17.68, -1.63 14.45, 0 8.75 C-0.65 3.35, 5.46 -1.7, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C18.8 -0.83, 30.28 0.06, 50.25 0 M8.75 0 C25.45 -0.2, 42.49 0.58, 50.25 0 M50.25 0 C56.56 0.35, 59.74 2.61, 59 8.75 M50.25 0 C55.75 1.01, 59.93 0.93, 59 8.75 M59 8.75 C58.02 14.59, 60.55 18.13, 59 26.25 M59 8.75 C58.44 15.76, 59.34 21.93, 59 26.25 M59 26.25 C58.76 32.42, 56.23 34.44, 50.25 35 M59 26.25 C57.64 31.02, 55.84 35.85, 50.25 35 M50.25 35 C40.24 33.69, 27.45 33.17, 8.75 35 M50.25 35 C37.68 35.39, 23.43 34.56, 8.75 35 M8.75 35 C1.44 33.49, -1.64 33.19, 0 26.25 M8.75 35 C0.92 37.28, 0.42 32.37, 0 26.25 M0 26.25 C0.02 20.08, -1.7 18, 0 8.75 M0 26.25 C-0.15 21.23, -0.29 17.56, 0 8.75 M0 8.75 C-1.86 3.03, 2.42 1.01, 8.75 0 M0 8.75 C1.64 3.42, 4.78 1.93, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(201.61666679382324 73) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round" transform="translate(265 126) rotate(0 65 17.5)"><path d="M8.75 0 C54.74 -0.14, 96.86 -1.42, 121.25 0 M8.75 0 C42.6 0.3, 77.19 0.33, 121.25 0 M121.25 0 C128.42 1.89, 129.84 4.87, 130 8.75 M121.25 0 C127.72 2.07, 128.01 2.06, 130 8.75 M130 8.75 C130.21 16.58, 128.31 22.59, 130 26.25 M130 8.75 C130.17 14.38, 129.1 20.39, 130 26.25 M130 26.25 C130.19 31.97, 127.58 35.95, 121.25 35 M130 26.25 C130.58 32.28, 127.26 33.25, 121.25 35 M121.25 35 C86.42 36.84, 49.76 34.38, 8.75 35 M121.25 35 C96.81 34.68, 73.2 34.65, 8.75 35 M8.75 35 C3.22 36.38, -0.9 31.13, 0 26.25 M8.75 35 C3.08 33.79, -1.15 30.49, 0 26.25 M0 26.25 C-1.34 20.96, 1.16 15.89, 0 8.75 M0 26.25 C-0.36 20.35, 0.64 15.34, 0 8.75 M0 8.75 C-0.69 2.09, 1.21 -1.72, 8.75 0 M0 8.75 C-1.6 5.1, 5.18 1.93, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(293.79999923706055 131) rotate(0 36.20000076293945 12.5)"><text x="36.20000076293945" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token c</text></g><g stroke-linecap="round" transform="translate(218 126) rotate(0 29.5 17.5)"><path d="M8.75 0 C18.12 -3.89, 27.7 -1.72, 50.25 0 C55.74 -0.4, 59.15 4.96, 59 8.75 C57 13.82, 58.35 22.59, 59 26.25 C57.96 30.72, 55.57 33.04, 50.25 35 C37.25 39, 21.92 32.73, 8.75 35 C3.78 33.78, -2.37 30.95, 0 26.25 C-0.75 22.38, -0.47 13.66, 0 8.75 C0.65 4.69, -0.21 3.33, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C22.51 -0.98, 37.51 -0.22, 50.25 0 M8.75 0 C23.59 0.5, 37.95 0.62, 50.25 0 M50.25 0 C55.93 1.95, 59.56 4.72, 59 8.75 M50.25 0 C54.09 -0.86, 60.39 2.26, 59 8.75 M59 8.75 C57.39 16.55, 59.95 21.35, 59 26.25 M59 8.75 C58.2 11.99, 59.13 16.58, 59 26.25 M59 26.25 C59.5 33.03, 56.59 35.17, 50.25 35 M59 26.25 C59.18 30.33, 56.43 35.69, 50.25 35 M50.25 35 C34.64 33.92, 18.43 34.62, 8.75 35 M50.25 35 C36.77 34.49, 25.35 35.55, 8.75 35 M8.75 35 C2.02 34.04, 0.14 31.03, 0 26.25 M8.75 35 C1.76 33.41, -0.37 31.96, 0 26.25 M0 26.25 C1.29 19.61, 0.4 13.33, 0 8.75 M0 26.25 C0.68 19.74, -0.22 12.63, 0 8.75 M0 8.75 C-1.71 1.19, 1.52 1.9, 8.75 0 M0 8.75 C2.27 4.84, 0.65 -2.24, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(231.61666679382324 131) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round" transform="translate(266 185) rotate(0 65 17.5)"><path d="M8.75 0 C46.01 0.37, 87.38 0.65, 121.25 0 M8.75 0 C53.68 -0.78, 96.42 -1.33, 121.25 0 M121.25 0 C128 1.29, 128.8 3.04, 130 8.75 M121.25 0 C128.35 -1.29, 128.16 2.06, 130 8.75 M130 8.75 C130.25 15.28, 130.45 18.88, 130 26.25 M130 8.75 C129.37 12.42, 129.69 17.19, 130 26.25 M130 26.25 C129.03 31.97, 127.56 33.3, 121.25 35 M130 26.25 C131.89 31.04, 125.59 32.85, 121.25 35 M121.25 35 C92.58 36.61, 64.05 36.1, 8.75 35 M121.25 35 C91.99 34.89, 61.08 34.3, 8.75 35 M8.75 35 C2.97 36.62, 0.31 34.04, 0 26.25 M8.75 35 C3.81 34.07, 0.87 34.17, 0 26.25 M0 26.25 C0.53 22.43, 0.9 15.93, 0 8.75 M0 26.25 C0.67 20.89, 0.27 15.66, 0 8.75 M0 8.75 C1.35 2.27, 2.3 1.97, 8.75 0 M0 8.75 C-0.18 2.39, 1.33 -0.34, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(294.1333351135254 190) rotate(0 36.86666488647461 12.5)"><text x="36.86666488647461" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token d</text></g><g stroke-linecap="round" transform="translate(219 185) rotate(0 29.5 17.5)"><path d="M8.75 0 C22.83 2.48, 43.95 -3.35, 50.25 0 C53.9 0.58, 61.27 4.59, 59 8.75 C60.51 12.75, 58.71 22.23, 59 26.25 C57.96 30.94, 53.86 34.19, 50.25 35 C41.57 33.54, 29.74 32.42, 8.75 35 C4.86 35.9, 2.68 33.29, 0 26.25 C-2.59 20.8, 2 16.46, 0 8.75 C-0.22 -0.65, 4.39 0.24, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C24.42 1.08, 40.27 -1.13, 50.25 0 M8.75 0 C22.64 -0.63, 38.77 0.71, 50.25 0 M50.25 0 C54.88 0.12, 60.1 1.79, 59 8.75 M50.25 0 C54.25 -0.85, 59.11 2.23, 59 8.75 M59 8.75 C59.53 13.38, 57.69 20.53, 59 26.25 M59 8.75 C58.39 13.62, 58.42 17.18, 59 26.25 M59 26.25 C59.47 30.38, 57.72 34.1, 50.25 35 M59 26.25 C57.51 29.93, 55.13 34.04, 50.25 35 M50.25 35 C40.04 36.86, 27.28 37.05, 8.75 35 M50.25 35 C37.38 34.27, 25.48 35.77, 8.75 35 M8.75 35 C3.23 36.96, 0.78 31.28, 0 26.25 M8.75 35 C3.79 37.09, -0.75 34.08, 0 26.25 M0 26.25 C0.98 19.16, 0.08 14.15, 0 8.75 M0 26.25 C0.15 20.95, 0.45 14.94, 0 8.75 M0 8.75 C-0.61 4.89, 2.76 -0.45, 8.75 0 M0 8.75 C-1.59 2.58, 2.83 1.15, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(232.61666679382324 190) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round" transform="translate(238 246) rotate(0 65 17.5)"><path d="M8.75 0 C45.07 -0.36, 86.05 0.98, 121.25 0 M8.75 0 C49.11 1.2, 89.65 0.37, 121.25 0 M121.25 0 C126.41 -1.61, 128.27 4.52, 130 8.75 M121.25 0 C125.92 2.15, 128.83 2.39, 130 8.75 M130 8.75 C129.33 13.27, 130.88 17.42, 130 26.25 M130 8.75 C129.7 12.08, 130.33 17.96, 130 26.25 M130 26.25 C130.42 33.87, 127.71 35.48, 121.25 35 M130 26.25 C130.39 32.23, 125.58 34.62, 121.25 35 M121.25 35 C79.83 34.58, 38.76 32.9, 8.75 35 M121.25 35 C81.96 33.6, 42.04 34.74, 8.75 35 M8.75 35 C3.16 35.87, 0.48 31.9, 0 26.25 M8.75 35 C3.48 34.78, -0.5 31.97, 0 26.25 M0 26.25 C0.1 21.82, -1.13 17.62, 0 8.75 M0 26.25 C-0.11 19.9, 0.29 14.19, 0 8.75 M0 8.75 C1.78 1.73, 1.23 -0.46, 8.75 0 M0 8.75 C1.1 0.72, 2.49 -0.98, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(266.3499984741211 251) rotate(0 36.650001525878906 12.5)"><text x="36.650001525878906" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token e</text></g><g stroke-linecap="round" transform="translate(191 246) rotate(0 29.5 17.5)"><path d="M8.75 0 C23.5 0.79, 28.8 -3.03, 50.25 0 C56.83 2.48, 56.38 5.05, 59 8.75 C60.99 10.58, 61.23 17.08, 59 26.25 C56.78 34.4, 56.77 32.04, 50.25 35 C39.05 37.68, 25.32 32.97, 8.75 35 C5.96 36.51, 2.23 30.79, 0 26.25 C-1.12 23.07, 0.52 17.04, 0 8.75 C-3.46 0.18, 0.43 1.8, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C22.68 1.13, 33.88 0.05, 50.25 0 M8.75 0 C24.79 -0.85, 40.65 0.75, 50.25 0 M50.25 0 C55.07 1.87, 57.98 2.46, 59 8.75 M50.25 0 C54.56 0.92, 58.91 1.94, 59 8.75 M59 8.75 C58.02 15.5, 60.15 19.27, 59 26.25 M59 8.75 C59.23 13.07, 59.32 16.04, 59 26.25 M59 26.25 C59.34 32.21, 54.78 34.67, 50.25 35 M59 26.25 C60.45 32.55, 54.4 34.36, 50.25 35 M50.25 35 C37.99 36.47, 22.11 35.34, 8.75 35 M50.25 35 C40.13 35.68, 30.01 35.16, 8.75 35 M8.75 35 C3.41 34.81, -0.43 31.99, 0 26.25 M8.75 35 C1.67 37.3, 0.18 32.44, 0 26.25 M0 26.25 C1.11 19.72, -0.54 15.51, 0 8.75 M0 26.25 C0.75 20.67, -0.77 15.92, 0 8.75 M0 8.75 C0.96 1.01, 2.55 -0.85, 8.75 0 M0 8.75 C1.93 1.45, 1.04 1.88, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(204.61666679382324 251) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round" transform="translate(196 306) rotate(0 65 17.5)"><path d="M8.75 0 C45.94 1.17, 86.37 0.57, 121.25 0 M8.75 0 C41.72 0.6, 74.18 0.57, 121.25 0 M121.25 0 C129.07 -1.91, 128.55 1.19, 130 8.75 M121.25 0 C128.46 0.24, 131.64 0.89, 130 8.75 M130 8.75 C128.83 16.8, 130.75 21.38, 130 26.25 M130 8.75 C129.92 15.24, 130.74 21.61, 130 26.25 M130 26.25 C130.04 32.14, 126.38 36.29, 121.25 35 M130 26.25 C130.43 29.97, 127.55 34.56, 121.25 35 M121.25 35 C94.59 36.34, 66.4 33.58, 8.75 35 M121.25 35 C89.61 35.59, 58.1 36.09, 8.75 35 M8.75 35 C1.55 35.9, 1.35 34.04, 0 26.25 M8.75 35 C3.11 35.85, 0.42 30.14, 0 26.25 M0 26.25 C1.65 21.64, 1.76 14.06, 0 8.75 M0 26.25 C-0.35 20.48, 0.62 15.61, 0 8.75 M0 8.75 C-1.25 4.71, 2.13 -1.81, 8.75 0 M0 8.75 C0.11 1.87, 4.43 -0.93, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(224.95000076293945 311) rotate(0 36.04999923706055 12.5)"><text x="36.04999923706055" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token f</text></g><g stroke-linecap="round" transform="translate(149 306) rotate(0 29.5 17.5)"><path d="M8.75 0 C14.33 -2.48, 27.23 1.37, 50.25 0 C59.35 0.3, 61.55 4.07, 59 8.75 C61.22 16.86, 61.68 18.76, 59 26.25 C62.24 29.99, 56.41 36.16, 50.25 35 C37.49 33.56, 26.36 36.02, 8.75 35 C4.27 38.44, -3.13 34.66, 0 26.25 C-2.68 20.17, 2.27 13.42, 0 8.75 C2.94 0.15, 1.62 -0.8, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C21.2 0.98, 33.44 -2.17, 50.25 0 M8.75 0 C25.53 0.3, 41.81 0.97, 50.25 0 M50.25 0 C57.65 -0.5, 57.23 2.15, 59 8.75 M50.25 0 C55.26 -1.96, 60.66 3.49, 59 8.75 M59 8.75 C59.5 15.08, 59.7 18.96, 59 26.25 M59 8.75 C58.81 15.8, 59.8 22.39, 59 26.25 M59 26.25 C59.56 32.35, 55.71 34.53, 50.25 35 M59 26.25 C57.2 31.26, 58.14 33.85, 50.25 35 M50.25 35 C35.72 33.96, 21.51 34.75, 8.75 35 M50.25 35 C34.54 35.79, 18.87 35.06, 8.75 35 M8.75 35 C3.72 34.76, -0.45 33.22, 0 26.25 M8.75 35 C0.69 35.82, -1.4 32.19, 0 26.25 M0 26.25 C-1.14 22.65, -1.06 16.88, 0 8.75 M0 26.25 C0.58 19.3, -0.88 12.47, 0 8.75 M0 8.75 C-1.66 3.83, 3.16 -1.52, 8.75 0 M0 8.75 C-0.96 2.94, 3.66 -0.27, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(162.61666679382324 311) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round"><g transform="translate(118.88077634011091 146) rotate(0 30.059611829944544 -28)"><path d="M0.71 -0.51 C4.11 -4.04, 10.37 -12.1, 20.27 -21.26 C30.16 -30.42, 53.58 -49.69, 60.08 -55.47 M-0.37 -1.82 C3.41 -5.69, 12.59 -13.7, 22.53 -22.99 C32.48 -32.27, 53.21 -52.23, 59.3 -57.53" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(118.88077634011091 146) rotate(0 30.059611829944544 -28)"><path d="M47.79 -35.33 C50.31 -43.3, 55.75 -48.42, 59.3 -57.53 M47.79 -35.33 C51.85 -42.11, 55.57 -51.16, 59.3 -57.53" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(118.88077634011091 146) rotate(0 30.059611829944544 -28)"><path d="M36.22 -47.92 C42.12 -52.28, 50.93 -53.73, 59.3 -57.53 M36.22 -47.92 C44.17 -50.37, 51.89 -55.08, 59.3 -57.53" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(147 159.99661284600586) rotate(0 31 -8.900402236791393)"><path d="M1.03 0.14 C11.46 -3.07, 51.83 -15.99, 61.97 -19 M0.12 -0.84 C10.43 -3.97, 50.85 -15.46, 61 -18.09" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(147 159.99661284600586) rotate(0 31 -8.900402236791393)"><path d="M40.6 -3.63 C45.94 -7.51, 48.86 -11.37, 61 -18.09 M40.6 -3.63 C45.77 -7.08, 52.38 -12.67, 61 -18.09" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(147 159.99661284600586) rotate(0 31 -8.900402236791393)"><path d="M36.08 -20.13 C42.59 -19.88, 46.65 -19.59, 61 -18.09 M36.08 -20.13 C42.7 -18.71, 50.62 -19.47, 61 -18.09" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(147 177) rotate(0 31 13.5)"><path d="M-0.11 -0.64 C10.14 3.71, 52.15 21.9, 62.43 26.5 M-1.63 1.64 C8.43 6.11, 51.34 23.34, 61.71 27.78" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(147 177) rotate(0 31 13.5)"><path d="M36.73 26.71 C45 27.85, 54.57 26.84, 61.71 27.78 M36.73 26.71 C44.9 27.43, 50.8 26.75, 61.71 27.78" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(147 177) rotate(0 31 13.5)"><path d="M43.26 10.91 C49.15 17.94, 56.28 22.83, 61.71 27.78 M43.26 10.91 C49.35 16.33, 53.31 20.33, 61.71 27.78" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(107 205) rotate(0 38 32.5)"><path d="M-0.05 0.06 C4.66 4.77, 15.37 17.8, 28.03 28.61 C40.68 39.41, 67.78 58.64, 75.87 64.89 M-1.54 -0.96 C3.13 3.37, 14.86 15.62, 27.62 26.81 C40.38 37.99, 66.79 59.93, 75.03 66.14" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(107 205) rotate(0 38 32.5)"><path d="M51.32 58.2 C57.99 62.12, 65.47 62.38, 75.03 66.14 M51.32 58.2 C57.34 59.63, 66.06 63.55, 75.03 66.14" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(107 205) rotate(0 38 32.5)"><path d="M61.97 44.82 C65.73 52.43, 70.27 56.4, 75.03 66.14 M61.97 44.82 C64.96 50.23, 70.58 58.04, 75.03 66.14" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(72 204) rotate(0 34.5 63)"><path d="M-0.49 0.38 C3.28 11.11, 10.07 43.79, 21.81 64.87 C33.55 85.95, 61.92 116.87, 69.96 126.88 M1.45 -0.46 C5.2 9.89, 9.91 42.29, 21.29 63.2 C32.66 84.11, 62.04 114.63, 69.69 125" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(72 204) rotate(0 34.5 63)"><path d="M48.07 112.46 C53.79 116.82, 59.64 119.99, 69.69 125 M48.07 112.46 C56.07 118.34, 64.02 122.77, 69.69 125" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(72 204) rotate(0 34.5 63)"><path d="M61.19 101.5 C63.91 108.35, 66.7 114.08, 69.69 125 M61.19 101.5 C64.38 111.35, 67.43 119.88, 69.69 125" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(335 27) rotate(0 90.58938814531547 51.5)"><path d="M-0.77 1.04 C19.39 5.5, 90.17 9.1, 120.44 25.93 C150.71 42.75, 170.79 89.22, 180.88 101.99 M1.03 0.54 C21.02 5.18, 89.38 9.86, 119.2 26.9 C149.02 43.94, 169.64 90.02, 179.95 102.77" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(335 27) rotate(0 90.58938814531547 51.5)"><path d="M160.08 87.6 C166.86 90.72, 168.48 95.08, 179.95 102.77 M160.08 87.6 C164.75 90.71, 168.58 95.09, 179.95 102.77" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(335 27) rotate(0 90.58938814531547 51.5)"><path d="M174.48 78.38 C177.47 83.8, 175.36 90.54, 179.95 102.77 M174.48 78.38 C176.03 83.42, 176.75 89.79, 179.95 102.77" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(372 83) rotate(0 64 34.62191892240395)"><path d="M0.71 -0.18 C12.18 2.7, 47.59 5.91, 68.85 17.54 C90.11 29.16, 118.42 60.74, 128.28 69.56 M-0.38 -1.32 C11.45 1.18, 49.62 3.63, 70.96 15.69 C92.3 27.76, 118.11 62.24, 127.67 71.04" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(372 83) rotate(0 64 34.62191892240395)"><path d="M105.49 59.5 C111.83 60.9, 119.65 66.74, 127.67 71.04 M105.49 59.5 C113.21 63.54, 119.08 66.36, 127.67 71.04" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(372 83) rotate(0 64 34.62191892240395)"><path d="M118.09 47.95 C120.69 52.87, 124.75 62.16, 127.67 71.04 M118.09 47.95 C121.7 55.88, 123.46 62.47, 127.67 71.04" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(650 160.45393912717157) rotate(0 34.5 -1.0974840738246598)"><path d="M-0.61 0.22 C10.84 -0.09, 56.97 -1.88, 68.64 -2.26 M1.26 -0.71 C12.53 -0.79, 56.24 -0.77, 67.5 -0.75" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(650 160.45393912717157) rotate(0 34.5 -1.0974840738246598)"><path d="M44 7.78 C51.32 4.78, 57.78 3.53, 67.5 -0.75 M44 7.78 C51.73 4.71, 58.36 1.43, 67.5 -0.75" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(650 160.45393912717157) rotate(0 34.5 -1.0974840738246598)"><path d="M44.01 -9.32 C51.27 -7.28, 57.73 -3.49, 67.5 -0.75 M44.01 -9.32 C51.84 -7.02, 58.47 -4.94, 67.5 -0.75" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(401 146.70763882372995) rotate(0 48 7.746218642436219)"><path d="M-0.06 -0.69 C15.62 2.1, 78.95 13.98, 94.94 16.68 M-1.56 1.56 C14.41 4.06, 81 12.64, 97.09 15.18" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(401 146.70763882372995) rotate(0 48 7.746218642436219)"><path d="M72.63 20.36 C80.57 16.68, 92.79 16.27, 97.09 15.18 M72.63 20.36 C79.82 19.72, 86.98 17.55, 97.09 15.18" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(401 146.70763882372995) rotate(0 48 7.746218642436219)"><path d="M75.03 3.42 C82.07 6.03, 93.4 11.91, 97.09 15.18 M75.03 3.42 C81.42 7.87, 87.86 10.78, 97.09 15.18" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(405 204.20037092821235) rotate(0 45 -14.697180884233944)"><path d="M1.17 1.2 C16.35 -3.51, 75.53 -23.35, 90.29 -28.47 M0.33 0.78 C15.44 -4.22, 74.75 -25.26, 89.49 -30.1" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(405 204.20037092821235) rotate(0 45 -14.697180884233944)"><path d="M70.05 -14.39 C76.66 -17.81, 80.8 -22.49, 89.49 -30.1 M70.05 -14.39 C75.11 -18.88, 81.54 -24.29, 89.49 -30.1" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(405 204.20037092821235) rotate(0 45 -14.697180884233944)"><path d="M64.5 -30.56 C72.38 -30.22, 77.83 -31.08, 89.49 -30.1 M64.5 -30.56 C71 -30.38, 79.03 -31.14, 89.49 -30.1" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(378 271) rotate(0 60 -41.5)"><path d="M0.49 -0.94 C10.84 -5.52, 41.13 -14.23, 61.04 -27.89 C80.94 -41.55, 109.94 -73.64, 119.94 -82.87 M-0.72 1.18 C9.57 -3.66, 40.13 -15.65, 60.11 -29.43 C80.08 -43.21, 108.86 -72.67, 119.14 -81.49" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(378 271) rotate(0 60 -41.5)"><path d="M107.73 -59.25 C108.66 -63.94, 114.49 -68.8, 119.14 -81.49 M107.73 -59.25 C110.42 -66.82, 113.9 -73.71, 119.14 -81.49" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(378 271) rotate(0 60 -41.5)"><path d="M96.1 -71.79 C99.45 -73.87, 107.73 -76.08, 119.14 -81.49 M96.1 -71.79 C102.51 -75.44, 109.6 -78.44, 119.14 -81.49" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(331 332) rotate(0 95.5 -65.5)"><path d="M-0.11 0.87 C19.86 -7.39, 87.13 -27.03, 119.09 -49.12 C151.06 -71.22, 179.69 -117.89, 191.67 -131.68 M-1.63 0.28 C18.34 -8.35, 86.57 -28.95, 118.72 -50.78 C150.86 -72.62, 179.18 -117.32, 191.25 -130.73" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(331 332) rotate(0 95.5 -65.5)"><path d="M183.5 -106.96 C186.73 -110.85, 188.6 -117.27, 191.25 -130.73 M183.5 -106.96 C185.79 -111.81, 187.95 -118.72, 191.25 -130.73" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(331 332) rotate(0 95.5 -65.5)"><path d="M170.04 -117.5 C176.54 -118.84, 181.65 -122.73, 191.25 -130.73 M170.04 -117.5 C175.59 -119.7, 181.02 -124.04, 191.25 -130.73" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask></svg>

“Why the need for two steps? Why not one?” Transformations happen in a shared space, so that means that multiple plugins can see what the transformed values are for usage. For example, consider [plugin-css](/docs/integrations/css) and [plugin-sass](/docs/integrations/sass):

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 904 483" role="img" aria-label="Diagram illustrating 2 plugins can read from one’s `transform` step">
  <defs>
    <style class="style-fonts">@font-face {font-family:"Virgil";src:url("https://excalidraw.com/Virgil.woff2");}@font-face{font-family:"Cascadia";src:url("https://excalidraw.com/Cascadia.woff2");}@font-face{font-family:"Assistant";src:url("https://excalidraw.com/Assistant-Regular.woff2");}</style>
  </defs>
  <g stroke-linecap="round" transform="translate(282 70) rotate(0 65 17.5)"><path d="M8.75 0 C52.48 -1.67, 94.87 0.86, 121.25 0 M8.75 0 C40.97 0.76, 73.95 -0.11, 121.25 0 M121.25 0 C127.7 -1.54, 131.44 2.28, 130 8.75 M121.25 0 C125.61 -2.02, 130.3 0.77, 130 8.75 M130 8.75 C131.68 14.25, 130.73 15.57, 130 26.25 M130 8.75 C129.8 12.3, 129.22 15.18, 130 26.25 M130 26.25 C129.24 30.4, 127.05 33.59, 121.25 35 M130 26.25 C128.07 32.42, 129.09 33.92, 121.25 35 M121.25 35 C99.61 32.37, 75.06 32.58, 8.75 35 M121.25 35 C82.55 35.08, 45.66 35.54, 8.75 35 M8.75 35 C3.64 33.55, -0.06 32.25, 0 26.25 M8.75 35 C1.17 35.98, 2.25 30.22, 0 26.25 M0 26.25 C0.57 20.89, -0.89 14.95, 0 8.75 M0 26.25 C0.41 20.94, 0.02 14.95, 0 8.75 M0 8.75 C-0.01 4.36, 2.69 1.09, 8.75 0 M0 8.75 C0.75 3.11, 3.91 0.05, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(309.1500015258789 75) rotate(0 37.849998474121094 12.5)"><text x="37.849998474121094" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token a</text></g><g stroke-linecap="round" transform="translate(23 114) rotate(0 68 26)"><path d="M13 0 C50.21 -1.89, 87.8 0.95, 123 0 M13 0 C42.75 -0.41, 71.8 -1.64, 123 0 M123 0 C130.1 1.41, 138 2.91, 136 13 M123 0 C133.91 0.39, 134.96 2.63, 136 13 M136 13 C137.47 22.35, 136.47 29.53, 136 39 M136 13 C136.7 20.65, 135.84 27.62, 136 39 M136 39 C135.22 45.86, 130.32 51.29, 123 52 M136 39 C138.26 49.24, 130.64 51.23, 123 52 M123 52 C84.09 54.66, 46.84 54.44, 13 52 M123 52 C80.05 52.37, 37.4 53.02, 13 52 M13 52 C6.3 52.78, -0.06 47.09, 0 39 M13 52 C2.43 53.28, -1.43 49.25, 0 39 M0 39 C-1.15 33.45, -1.25 24.9, 0 13 M0 39 C0.07 29.41, 0.66 20.26, 0 13 M0 13 C-1.72 4.31, 2.84 -1, 13 0 M0 13 C0.29 5.88, 3.45 0.76, 13 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(43.25 127.5) rotate(0 47.75 12.5)"><text x="47.75" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">transform</text></g><g stroke-linecap="round" transform="translate(235 70) rotate(0 29.5 17.5)"><path d="M8.75 0 C18.87 3.07, 26.33 -0.89, 50.25 0 C57.56 0.21, 60.9 1.35, 59 8.75 C56.51 11.44, 60.68 14.19, 59 26.25 C58.71 30.16, 56.74 37.1, 50.25 35 C40.69 34.57, 27.53 36.16, 8.75 35 C5.05 36.44, -2.96 30.12, 0 26.25 C1.79 19.42, -0.89 16.53, 0 8.75 C1.84 6.05, 3.13 0.55, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C19.55 -0.34, 29.8 -1.7, 50.25 0 M8.75 0 C22.7 -0.53, 36.75 -0.07, 50.25 0 M50.25 0 C54.8 -1.76, 59.26 1.05, 59 8.75 M50.25 0 C54.71 2.18, 57.3 4.9, 59 8.75 M59 8.75 C57.32 13.58, 58.17 21.77, 59 26.25 M59 8.75 C58.55 13.34, 58.86 18.79, 59 26.25 M59 26.25 C57.32 32.37, 57.83 34.06, 50.25 35 M59 26.25 C56.84 30.79, 54.07 36.77, 50.25 35 M50.25 35 C41.97 36.17, 31.74 33.24, 8.75 35 M50.25 35 C36.76 34.61, 22.5 35.41, 8.75 35 M8.75 35 C1.4 35.86, 1.96 30.46, 0 26.25 M8.75 35 C2.78 34.21, 0.22 32.75, 0 26.25 M0 26.25 C0.43 20.94, 1.74 16.96, 0 8.75 M0 26.25 C0 21.08, -0.1 15.12, 0 8.75 M0 8.75 C0.65 3.08, 3.78 0.04, 8.75 0 M0 8.75 C-2.23 2.24, 2.73 -0.24, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(248.61666679382324 75) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round"><g transform="translate(145 108.325986063004) rotate(0 39.5 -10.030390169247994)"><path d="M0.35 -0.5 C4.79 -3.81, 14.55 -15.56, 27.62 -18.91 C40.68 -22.26, 70.07 -20.44, 78.75 -20.61 M-0.92 -1.81 C3.23 -5.57, 13.34 -17.85, 26.47 -20.81 C39.59 -23.77, 68.87 -19.92, 77.85 -19.58" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(145 108.325986063004) rotate(0 39.5 -10.030390169247994)"><path d="M53.76 -12.87 C62.13 -16.16, 72.91 -18.52, 77.85 -19.58 M53.76 -12.87 C59.77 -13.95, 66.31 -15.49, 77.85 -19.58" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(145 108.325986063004) rotate(0 39.5 -10.030390169247994)"><path d="M55.09 -29.92 C63.07 -26.66, 73.35 -22.47, 77.85 -19.58 M55.09 -29.92 C60.85 -26.66, 67.06 -23.87, 77.85 -19.58" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(493 96) rotate(0 68 26)"><path d="M13 0 C56.1 -0.53, 98.12 -1.44, 123 0 M13 0 C48.92 -1.52, 85.4 -0.35, 123 0 M123 0 C133.46 -1.34, 134.1 4.01, 136 13 M123 0 C130.9 0.31, 136.45 6.51, 136 13 M136 13 C137.74 17.77, 134.89 24.5, 136 39 M136 13 C135.49 17.92, 136.35 23.04, 136 39 M136 39 C136.87 47.03, 133.03 52.83, 123 52 M136 39 C137.13 48.58, 133.11 50.06, 123 52 M123 52 C83.91 53.71, 45.74 50.08, 13 52 M123 52 C85.39 52.31, 46.24 53.53, 13 52 M13 52 C5.94 52.11, 1.21 48.81, 0 39 M13 52 C3.96 52.92, -0.36 49.1, 0 39 M0 39 C1.73 30.85, -0.71 22.98, 0 13 M0 39 C-1.14 32.12, 0.18 25.32, 0 13 M0 13 C1.71 5.21, 6.18 0.33, 13 0 M0 13 C1.89 4.6, 3.68 -0.73, 13 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(539.7333335876465 109.5) rotate(0 21.266666412353516 12.5)"><text x="21.266666412353516" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">build</text></g><g stroke-linecap="round" transform="translate(710 28) rotate(0 55.5 73)"><path d="M27.75 0 C44.26 1.93, 61.16 -0.78, 83.25 0 M27.75 0 C41.91 -0.98, 53.33 -0.48, 83.25 0 M83.25 0 C101.08 0.27, 111.39 11.14, 111 27.75 M83.25 0 C99.57 0.93, 112.99 11.13, 111 27.75 M111 27.75 C108.47 51.77, 112.37 76.1, 111 118.25 M111 27.75 C111.82 51.84, 112.07 76.98, 111 118.25 M111 118.25 C111.98 137.54, 103.01 144.31, 83.25 146 M111 118.25 C112.35 136.49, 101.32 146.44, 83.25 146 M83.25 146 C62.29 143.93, 40.41 147.36, 27.75 146 M83.25 146 C69.01 146.57, 53.76 147.09, 27.75 146 M27.75 146 C8.92 146.8, -0.31 137.99, 0 118.25 M27.75 146 C10.25 146.54, -2.02 138.81, 0 118.25 M0 118.25 C-0.08 89.32, -0.78 55.09, 0 27.75 M0 118.25 C0.49 87.59, 0.56 56.22, 0 27.75 M0 27.75 C1.65 9.48, 8.68 -0.64, 27.75 0 M0 27.75 C2.24 10.19, 7.96 1.74, 27.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g stroke-linecap="round"><g transform="translate(727.7617494667368 59) rotate(0 37 0)"><path d="M0.96 0.99 C13.3 0.81, 61.27 -0.68, 73.34 -0.73 M0.01 0.47 C12.8 0.39, 63.66 0.72, 75.7 0.42" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.2356148386796 72.58586520405902) rotate(0 37 0)"><path d="M-0.66 -0.73 C11.4 -0.78, 60.72 0.69, 73.35 0.68 M1.19 1.5 C13.56 1.01, 63.43 -0.85, 75.71 -1.09" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(726.2539332357746 87.0882849548916) rotate(0 37 0)"><path d="M-0.65 0.68 C11.97 0.67, 62.82 -0.66, 75.07 -0.8 M1.2 -0.01 C13.82 0.18, 62.36 0.14, 74.69 0.32" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(726.4015259466321 102.31812565976475) rotate(0 37 0)"><path d="M1.07 -0.8 C13.33 -0.95, 60.77 -0.36, 72.86 -0.2 M0.18 1.39 C12.84 1.37, 62.9 1.21, 74.98 1.24" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.8109224386512 117.29810473475317) rotate(0 37 0)"><path d="M-1.14 -0.2 C10.95 -0.04, 61.04 -0.06, 73.6 0.16 M0.47 -1.35 C12.27 -0.9, 60.25 1.66, 72.44 1.78" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.3882337654429 132.33911225378318) rotate(0 37 0)"><path d="M-0.4 0.16 C12.16 0.38, 62.02 1.08, 74.23 1.13 M1.59 -0.8 C14.12 -0.87, 61.15 -0.26, 73.41 -0.39" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.4976692900807 146.7163464066341) rotate(0 37 0)"><path d="M0.23 1.13 C12.45 1.19, 60.4 0.51, 72.86 0.49 M-1.1 0.68 C11.5 0.36, 62.33 -1.12, 74.98 -1.38" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g transform="translate(716 187) rotate(0 51.75 12.5)"><text x="0" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">output.css</text></g><g stroke-linecap="round" transform="translate(286 123) rotate(0 65 17.5)"><path d="M8.75 0 C54.97 1.76, 97.65 0.02, 121.25 0 M8.75 0 C48.61 -0.79, 88.99 -1.15, 121.25 0 M121.25 0 C128.92 1.4, 130.47 3.26, 130 8.75 M121.25 0 C127.93 -0.35, 129.67 3.93, 130 8.75 M130 8.75 C131.29 14.42, 128.72 21.89, 130 26.25 M130 8.75 C130.69 14.73, 129.32 22.62, 130 26.25 M130 26.25 C130.47 32.75, 126.85 35.33, 121.25 35 M130 26.25 C130.17 31.44, 125.72 33.94, 121.25 35 M121.25 35 C89.51 34.58, 57.34 33.39, 8.75 35 M121.25 35 C88.54 35.53, 57.65 35.53, 8.75 35 M8.75 35 C2.86 33.9, -1.48 30.57, 0 26.25 M8.75 35 C1.03 36.27, -1.99 34.36, 0 26.25 M0 26.25 C1.28 21.83, 0.13 13.85, 0 8.75 M0 26.25 C-0.01 22.61, -0.28 18.62, 0 8.75 M0 8.75 C-0.59 4.81, 1.06 0.12, 8.75 0 M0 8.75 C-0.57 4.08, 4.55 0.5, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(314.7333335876465 128) rotate(0 36.266666412353516 12.5)"><text x="36.266666412353516" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token b</text></g><g stroke-linecap="round" transform="translate(240 123) rotate(0 29.5 17.5)"><path d="M8.75 0 C17.42 -3.12, 31.96 -3.48, 50.25 0 C52.9 -2.2, 60.02 4, 59 8.75 C61.18 14.57, 56.77 19.2, 59 26.25 C59.38 32.01, 57.39 33.28, 50.25 35 C33.68 38.36, 22.21 31.85, 8.75 35 C2.79 37.11, -1.73 30.94, 0 26.25 C2.97 17.68, -1.63 14.45, 0 8.75 C-0.65 3.35, 5.46 -1.7, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C18.8 -0.83, 30.28 0.06, 50.25 0 M8.75 0 C25.45 -0.2, 42.49 0.58, 50.25 0 M50.25 0 C56.56 0.35, 59.74 2.61, 59 8.75 M50.25 0 C55.75 1.01, 59.93 0.93, 59 8.75 M59 8.75 C58.02 14.59, 60.55 18.13, 59 26.25 M59 8.75 C58.44 15.76, 59.34 21.93, 59 26.25 M59 26.25 C58.76 32.42, 56.23 34.44, 50.25 35 M59 26.25 C57.64 31.02, 55.84 35.85, 50.25 35 M50.25 35 C40.24 33.69, 27.45 33.17, 8.75 35 M50.25 35 C37.68 35.39, 23.43 34.56, 8.75 35 M8.75 35 C1.44 33.49, -1.64 33.19, 0 26.25 M8.75 35 C0.92 37.28, 0.42 32.37, 0 26.25 M0 26.25 C0.02 20.08, -1.7 18, 0 8.75 M0 26.25 C-0.15 21.23, -0.29 17.56, 0 8.75 M0 8.75 C-1.86 3.03, 2.42 1.01, 8.75 0 M0 8.75 C1.64 3.42, 4.78 1.93, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(253.61666679382324 128) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round" transform="translate(286 177) rotate(0 65 17.5)"><path d="M8.75 0 C54.74 -0.14, 96.86 -1.42, 121.25 0 M8.75 0 C42.6 0.3, 77.19 0.33, 121.25 0 M121.25 0 C128.42 1.89, 129.84 4.87, 130 8.75 M121.25 0 C127.72 2.07, 128.01 2.06, 130 8.75 M130 8.75 C130.21 16.58, 128.31 22.59, 130 26.25 M130 8.75 C130.17 14.38, 129.1 20.39, 130 26.25 M130 26.25 C130.19 31.97, 127.58 35.95, 121.25 35 M130 26.25 C130.58 32.28, 127.26 33.25, 121.25 35 M121.25 35 C86.42 36.84, 49.76 34.38, 8.75 35 M121.25 35 C96.81 34.68, 73.2 34.65, 8.75 35 M8.75 35 C3.22 36.38, -0.9 31.13, 0 26.25 M8.75 35 C3.08 33.79, -1.15 30.49, 0 26.25 M0 26.25 C-1.34 20.96, 1.16 15.89, 0 8.75 M0 26.25 C-0.36 20.35, 0.64 15.34, 0 8.75 M0 8.75 C-0.69 2.09, 1.21 -1.72, 8.75 0 M0 8.75 C-1.6 5.1, 5.18 1.93, 8.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(314.79999923706055 182) rotate(0 36.20000076293945 12.5)"><text x="36.20000076293945" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">token c</text></g><g stroke-linecap="round" transform="translate(239 177) rotate(0 29.5 17.5)"><path d="M8.75 0 C18.12 -3.89, 27.7 -1.72, 50.25 0 C55.74 -0.4, 59.15 4.96, 59 8.75 C57 13.82, 58.35 22.59, 59 26.25 C57.96 30.72, 55.57 33.04, 50.25 35 C37.25 39, 21.92 32.73, 8.75 35 C3.78 33.78, -2.37 30.95, 0 26.25 C-0.75 22.38, -0.47 13.66, 0 8.75 C0.65 4.69, -0.21 3.33, 8.75 0" stroke="none" stroke-width="0" fill="#a5d8ff"></path><path d="M8.75 0 C22.51 -0.98, 37.51 -0.22, 50.25 0 M8.75 0 C23.59 0.5, 37.95 0.62, 50.25 0 M50.25 0 C55.93 1.95, 59.56 4.72, 59 8.75 M50.25 0 C54.09 -0.86, 60.39 2.26, 59 8.75 M59 8.75 C57.39 16.55, 59.95 21.35, 59 26.25 M59 8.75 C58.2 11.99, 59.13 16.58, 59 26.25 M59 26.25 C59.5 33.03, 56.59 35.17, 50.25 35 M59 26.25 C59.18 30.33, 56.43 35.69, 50.25 35 M50.25 35 C34.64 33.92, 18.43 34.62, 8.75 35 M50.25 35 C36.77 34.49, 25.35 35.55, 8.75 35 M8.75 35 C2.02 34.04, 0.14 31.03, 0 26.25 M8.75 35 C1.76 33.41, -0.37 31.96, 0 26.25 M0 26.25 C1.29 19.61, 0.4 13.33, 0 8.75 M0 26.25 C0.68 19.74, -0.22 12.63, 0 8.75 M0 8.75 C-1.71 1.19, 1.52 1.9, 8.75 0 M0 8.75 C2.27 4.84, 0.65 -2.24, 8.75 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(252.61666679382324 182) rotate(0 15.883333206176758 12.5)"><text x="15.883333206176758" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">css</text></g><g stroke-linecap="round"><g transform="translate(165 127.9099526066351) rotate(0 33 5.549007063118893)"><path d="M0.71 -0.51 C5.42 0.47, 17.27 3.81, 28.15 5.83 C39.02 7.86, 59.8 10.74, 65.97 11.63 M-0.37 -1.82 C4.72 -1.18, 19.49 2.2, 30.41 4.1 C41.34 6, 59.42 8.2, 65.18 9.57" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(165 127.9099526066351) rotate(0 33 5.549007063118893)"><path d="M46.72 12.79 C51.32 10.41, 58.66 10.74, 65.18 9.57 M46.72 12.79 C53.04 12.49, 59.18 10.07, 65.18 9.57" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(165 127.9099526066351) rotate(0 33 5.549007063118893)"><path d="M48.97 0.16 C52.91 1.48, 59.59 5.5, 65.18 9.57 M48.97 0.16 C54.43 4.22, 59.79 6.15, 65.18 9.57" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(165 148.73783807131764) rotate(0 30.529355644521274 21.82948524727587)"><path d="M1.03 0.14 C11.3 7.17, 51.05 35.23, 61.02 42.46 M0.12 -0.84 C10.27 6.27, 50.07 35.76, 60.06 43.37" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(165 148.73783807131764) rotate(0 30.529355644521274 21.82948524727587)"><path d="M36.13 36.13 C42.4 37.69, 46.21 39.3, 60.06 43.37 M36.13 36.13 C42.5 39.05, 50.13 39.82, 60.06 43.37" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(165 148.73783807131764) rotate(0 30.529355644521274 21.82948524727587)"><path d="M46.38 22.44 C50.1 27.54, 51.33 32.6, 60.06 43.37 M46.38 22.44 C49.85 29.28, 54.49 34.04, 60.06 43.37" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(422 88.00000000000003) rotate(0 29.118181546919004 8.154006361263868)"><path d="M-0.77 1.04 C2.39 1.5, 8.66 -0.45, 18.44 1.93 C28.22 4.3, 51.34 12.98, 57.93 15.29 M1.03 0.54 C4.02 1.18, 7.87 0.31, 17.2 2.9 C26.53 5.49, 50.19 13.78, 57.01 16.08" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(422 88.00000000000003) rotate(0 29.118181546919004 8.154006361263868)"><path d="M36.3 16.48 C43.4 15.57, 45.24 15.9, 57.01 16.08 M36.3 16.48 C41.18 16.23, 45.18 17.26, 57.01 16.08" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(422 88.00000000000003) rotate(0 29.118181546919004 8.154006361263868)"><path d="M40.89 3.07 C46.71 5.61, 47.36 9.41, 57.01 16.08 M40.89 3.07 C44.75 5.7, 47.77 9.61, 57.01 16.08" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(424 138.0929965556831) rotate(0 29.85374020468305 -9.656964142691294)"><path d="M0.71 -0.18 C4.85 -1.31, 14.97 -3.42, 24.85 -6.56 C34.73 -9.69, 54.18 -17.07, 59.99 -19 M-0.38 -1.32 C4.11 -2.83, 17 -5.7, 26.96 -8.4 C36.92 -11.1, 53.87 -15.57, 59.38 -17.52" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(424 138.0929965556831) rotate(0 29.85374020468305 -9.656964142691294)"><path d="M45.07 -6.71 C49.05 -11.74, 54.4 -12.83, 59.38 -17.52 M45.07 -6.71 C50.16 -9.93, 53.61 -14.3, 59.38 -17.52" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(424 138.0929965556831) rotate(0 29.85374020468305 -9.656964142691294)"><path d="M41.47 -18.44 C46.55 -19.99, 52.97 -17.57, 59.38 -17.52 M41.47 -18.44 C47.74 -17.87, 52.36 -18.42, 59.38 -17.52" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(638 113.89740810380061) rotate(0 31.5 -2.368547215786606)"><path d="M1.04 0.98 C11.67 -0.01, 52.25 -4.31, 62.66 -5.47 M0.12 0.45 C10.67 -0.44, 51.06 -3.36, 61.54 -4.31" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(638 113.89740810380061) rotate(0 31.5 -2.368547215786606)"><path d="M38.81 6.09 C45.07 3.2, 46.88 2.45, 61.54 -4.31 M38.81 6.09 C42.97 3.48, 48.4 1.29, 61.54 -4.31" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(638 113.89740810380061) rotate(0 31.5 -2.368547215786606)"><path d="M37.44 -10.95 C44.05 -10.36, 46.14 -7.61, 61.54 -4.31 M37.44 -10.95 C41.83 -10.15, 47.53 -8.92, 61.54 -4.31" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(424.6677073478204 198.14404138785824) rotate(0 29.882544289129783 -29.57825779936013)"><path d="M-0.06 -0.69 C4.51 -5.01, 18.33 -16.21, 28.27 -25.96 C38.22 -35.7, 54.46 -53.58, 59.61 -59.15 M-1.56 1.56 C3.3 -3.05, 20.37 -17.56, 30.43 -27.46 C40.48 -37.35, 53.98 -52.67, 58.76 -57.83" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(424.6677073478204 198.14404138785824) rotate(0 29.882544289129783 -29.57825779936013)"><path d="M50.4 -37.4 C52.37 -46.75, 58.6 -52.84, 58.76 -57.83 M50.4 -37.4 C52.82 -42.65, 55.15 -49.41, 58.76 -57.83" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(424.6677073478204 198.14404138785824) rotate(0 29.882544289129783 -29.57825779936013)"><path d="M39.22 -47.55 C45.33 -53.13, 55.73 -55.44, 58.76 -57.83 M39.22 -47.55 C44.95 -49.73, 50.64 -53.44, 58.76 -57.83" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(10 10) rotate(0 442 112.5)"><path d="M32 0 C298.85 -3.95, 566.77 -3.26, 852 0 M32 0 C319.85 -0.61, 608.36 -0.26, 852 0 M852 0 C871.69 -0.45, 882.01 11.94, 884 32 M852 0 C872.12 -0.49, 886.02 10.01, 884 32 M884 32 C883.25 70.07, 882.5 104.59, 884 193 M884 32 C884.11 81.68, 883.89 131.34, 884 193 M884 193 C885.68 214.8, 871.92 226.04, 852 225 M884 193 C884.21 216.19, 871.32 225.33, 852 225 M852 225 C628.65 224.57, 405.45 225.11, 32 225 M852 225 C545.16 223.07, 237.78 222.82, 32 225 M32 225 C11.34 226.58, -1.19 212.62, 0 193 M32 225 C10.82 222.85, -2.27 216.43, 0 193 M0 193 C0.41 142.57, -1.32 91.76, 0 32 M0 193 C1.09 158.24, 0.78 125.58, 0 32 M0 32 C-0.62 10.92, 12.44 1.61, 32 0 M0 32 C0.43 12.34, 11.49 0.69, 32 0" stroke="#1971c2" stroke-width="2" fill="none"></path></g><g transform="translate(27 22) rotate(0 45.11666488647461 12.5)"><text x="0" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#1971c2" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">plugin-css</text></g><g stroke-linecap="round" transform="translate(10 256) rotate(0 442 108.5)"><path d="M32 0 C278.68 -2.91, 525.24 -2.78, 852 0 M32 0 C288.74 -2.85, 546.3 -2.95, 852 0 M852 0 C872.36 0.04, 883.45 9.2, 884 32 M852 0 C874.29 -0.28, 884.65 10.22, 884 32 M884 32 C885.67 85.39, 885.47 135.71, 884 185 M884 32 C883.9 80.77, 884.57 130.38, 884 185 M884 185 C882.7 204.59, 874.62 218.52, 852 217 M884 185 C885.22 206.38, 872.21 219.13, 852 217 M852 217 C544.8 219.96, 237.6 219.02, 32 217 M852 217 C669.26 217.18, 486.74 216.82, 32 217 M32 217 C10.07 217.11, -0.29 205.5, 0 185 M32 217 C11.4 217.07, 0.34 208.01, 0 185 M0 185 C-1.51 150.81, 0.17 114.2, 0 32 M0 185 C-0.51 140.36, -0.46 94.66, 0 32 M0 32 C-0.07 10.65, 9.9 1.89, 32 0 M0 32 C-1.94 12.67, 12.81 -0.73, 32 0" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(27 268) rotate(0 52.20000076293945 12.5)"><text x="0" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="#2f9e44" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">plugin-sass</text></g><g stroke-linecap="round" transform="translate(493 343) rotate(0 68 26)"><path d="M13 0 C48.88 0.53, 82.25 1.44, 123 0 M13 0 C52.24 -0.29, 92.14 -0.6, 123 0 M123 0 C132.05 1.78, 134.41 6.07, 136 13 M123 0 C129.5 0.73, 135.76 6.57, 136 13 M136 13 C137.44 22.17, 137.65 28.89, 136 39 M136 13 C135.3 23.56, 136.34 32.27, 136 39 M136 39 C134.89 45.76, 133.52 51.68, 123 52 M136 39 C135.66 46.81, 133.2 51.36, 123 52 M123 52 C91.45 51.07, 58.12 49.84, 13 52 M123 52 C80.21 50.9, 38.77 50.16, 13 52 M13 52 C3.64 53.69, 0.43 48.44, 0 39 M13 52 C4.15 51.95, 0.62 47.09, 0 39 M0 39 C-0.4 35.2, -1.45 28.51, 0 13 M0 39 C0.96 31.07, -0.8 23.39, 0 13 M0 13 C-0.35 3.59, 3.21 -1.26, 13 0 M0 13 C-1.73 3.13, 5.62 0.38, 13 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(539.7333335876465 356.5) rotate(0 21.266666412353516 12.5)"><text x="21.266666412353516" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="middle" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">build</text></g><g stroke-linecap="round" transform="translate(710 275) rotate(0 55.5 73)"><path d="M27.75 0 C42.59 -1.29, 57.34 -0.79, 83.25 0 M27.75 0 C48.52 0.38, 70.91 -0.4, 83.25 0 M83.25 0 C101.75 -0.85, 110 7.28, 111 27.75 M83.25 0 C103.21 1.73, 111.68 8.76, 111 27.75 M111 27.75 C110.78 49.56, 111.26 70.68, 111 118.25 M111 27.75 C111.71 62.73, 111.34 96.94, 111 118.25 M111 118.25 C110.6 136.75, 101.16 146.39, 83.25 146 M111 118.25 C111.21 136.69, 102.11 145.76, 83.25 146 M83.25 146 C72.66 144.56, 57.31 147.15, 27.75 146 M83.25 146 C68.45 145.41, 53.23 146.34, 27.75 146 M27.75 146 C8.32 145.43, -1.6 136.46, 0 118.25 M27.75 146 C7.62 146.87, 0.17 138.29, 0 118.25 M0 118.25 C-0.6 88.78, -0.08 58.94, 0 27.75 M0 118.25 C-0.1 91.82, -0.17 66.9, 0 27.75 M0 27.75 C0.92 8.88, 10.45 1.19, 27.75 0 M0 27.75 C1.1 8.87, 9.6 2.27, 27.75 0" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g stroke-linecap="round"><g transform="translate(727.7617494667368 306) rotate(0 37 0)"><path d="M-1.09 0.22 C11.09 0.31, 61.2 -0.64, 73.54 -0.59 M0.54 -0.71 C12.48 -0.37, 59.89 0.78, 72.35 0.64" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.2356148386796 319.585865204059) rotate(0 37 0)"><path d="M-0.4 0.52 C12.02 0.42, 61.55 -0.4, 73.91 -0.39 M1.58 -0.26 C13.89 -0.2, 61.03 1.14, 72.91 0.94" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(726.2539332357746 334.0882849548916) rotate(0 37 0)"><path d="M0.73 0.03 C12.82 0.15, 61.12 0.1, 73.41 0.1 M-0.35 -1 C12.07 -0.61, 63.43 1.29, 75.81 1.69" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(726.4015259466321 349.31812565976475) rotate(0 37 0)"><path d="M1.16 -1 C13.61 -0.79, 62.79 0.8, 74.87 1.12 M0.3 1.09 C12.67 1.01, 62.31 -0.08, 74.37 -0.41" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.8109224386512 364.29810473475317) rotate(0 37 0)"><path d="M0.25 -0.18 C12.32 -0.29, 61.33 -0.04, 73.43 0.06 M-1.08 -1.32 C10.69 -1.28, 59.48 1.7, 72.18 1.62" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.3882337654429 379.33911225378324) rotate(0 37 0)"><path d="M-1.17 0.11 C11.2 -0.01, 62 -0.59, 74.36 -0.52 M0.42 -0.88 C12.65 -0.85, 61.12 0.86, 73.61 0.74" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(727.4976692900807 393.7163464066341) rotate(0 37 0)"><path d="M0.14 -0.03 C12.59 -0.33, 61.74 -0.65, 74.22 -0.6 M-1.24 -1.09 C11.11 -0.74, 60.72 0.16, 73.39 0.62" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g transform="translate(711 434) rotate(0 57.18333435058594 12.5)"><text x="0" y="17.52" font-family="Virgil, Segoe UI Emoji" font-size="20px" fill="currentColor" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">output.scss</text></g><g stroke-linecap="round"><g transform="translate(638 360.8974081038006) rotate(0 31.5 -2.368547215786606)"><path d="M-0.61 0.22 C9.84 -0.51, 51.97 -4, 62.64 -4.8 M1.26 -0.71 C11.53 -1.21, 51.24 -2.88, 61.5 -3.29" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(638 360.8974081038006) rotate(0 31.5 -2.368547215786606)"><path d="M38.38 6.22 C45.59 2.93, 51.94 1.39, 61.5 -3.29 M38.38 6.22 C45.99 2.84, 52.5 -0.75, 61.5 -3.29" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g><g transform="translate(638 360.8974081038006) rotate(0 31.5 -2.368547215786606)"><path d="M37.68 -10.87 C45.03 -9.12, 51.59 -5.63, 61.5 -3.29 M37.68 -10.87 C45.6 -8.89, 52.34 -7.11, 61.5 -3.29" stroke="var(--tz-color-border-1)" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(424 198.00000000000023) rotate(0 29 92.65314477112008)"><path d="M-0.62 -0.05 C1.75 24.02, 4.31 113.1, 14.02 143.92 C23.73 174.75, 50.26 178.17, 57.64 184.93 M1.26 -1.12 C3.48 23.11, 3.84 113.7, 13.08 144.9 C22.32 176.09, 49.08 179.34, 56.68 186.05" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(424 198.00000000000023) rotate(0 29 92.65314477112008)"><path d="M31.95 182.42 C38.92 183.61, 44.27 184.01, 56.68 186.05 M31.95 182.42 C38.69 182.74, 44.84 183.55, 56.68 186.05" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(424 198.00000000000023) rotate(0 29 92.65314477112008)"><path d="M40.07 167.37 C44.66 172.81, 47.69 177.52, 56.68 186.05 M40.07 167.37 C44.66 171.67, 48.64 176.52, 56.68 186.05" stroke="#2f9e44" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(427 135.00000000000034) rotate(0 27.5 108.69204785362416)"><path d="M-1.08 -0.08 C1.91 12.54, 9.52 38.56, 18.81 74.97 C28.11 111.37, 48.51 194.42, 54.69 218.32 M0.56 -1.17 C3.29 11.72, 8.9 40.21, 17.76 76.48 C26.63 112.76, 47.28 193.17, 53.77 216.47" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(427 135.00000000000034) rotate(0 27.5 108.69204785362416)"><path d="M39.46 195.97 C44.58 203.51, 50.05 211.03, 53.77 216.47 M39.46 195.97 C44.4 204.06, 50.11 212.07, 53.77 216.47" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(427 135.00000000000034) rotate(0 27.5 108.69204785362416)"><path d="M55.99 191.57 C54.85 200.62, 54.1 209.8, 53.77 216.47 M55.99 191.57 C54.71 201.46, 54.17 211.14, 53.77 216.47" stroke="#2f9e44" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(424 91.00000000000006) rotate(0 42.75798622758043 121)"><path d="M-0.2 -0.16 C7.67 18.5, 32.58 72.69, 46.67 112.93 C60.75 153.16, 77.76 219.74, 84.33 241.22 M-1.77 -1.3 C5.97 17.48, 30.81 73.85, 45.54 114.42 C60.27 155, 79.75 220.73, 86.6 242.13" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(424 91.00000000000006) rotate(0 42.75798622758043 121)"><path d="M71.47 222.23 C75.16 226.7, 79.11 230.29, 86.6 242.13 M71.47 222.23 C74.3 226.34, 78.19 232.42, 86.6 242.13" stroke="#2f9e44" stroke-width="2" fill="none"></path></g><g transform="translate(424 91.00000000000006) rotate(0 42.75798622758043 121)"><path d="M87.81 217.16 C87.42 222.88, 87.27 227.74, 86.6 242.13 M87.81 217.16 C86.82 222.44, 86.86 229.72, 86.6 242.13" stroke="#2f9e44" stroke-width="2" fill="none"></path></g></g><mask></mask></svg>

When using the Sass plugin, we want to use CSS variables to get cascading and automatic mode switching. And with a shared transform step, only one plugin has to generate values for a format.

To see what this looks like in code, we’ll look at a simplified version of the CSS plugin:

:::code-group

```js [my-css-plugin.js]
import { formatCss } from "culori";
import { kebabCase } from "scule";

export default function clampColor(userOptions) {
  return {
    name: "my-css-plugin",
    async transform({ tokens, setTransform }) {
      for (const [id, token] of Object.entries(tokens)) {
        switch (token.$type) {
          case "color": {
            setTransform(id, {
              format: "css",
              localID: `--${kebabCase(id)}`,
              value: formatCss(token.$value), // convert original format into CSS-friendly value
            });
            break;
          }

          // … other $types here
        }
      }
    },
    async build({ getTransforms, outputFile }) {
      const output = [];
      output.push(":root {");
      for (const token of getTransforms({ format: "css", id: "*" })) {
        // renders "--my-token-id: color(srgb 0.6 0 0.3);"
        output.push(`  ${token.localID ?? token.token.id}: ${token.value};`);
      }
      output.push("}", "");
      outputFile("my-file.css", output.join("\n"));
    },
  };
}
```

:::

In the **transform** step we’re:

1. Iterating over the `tokens` object with [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
2. Splitting apart the tokens by `$type` (only [color](/docs/tokens/color) is shown for brevity)
3. Calling `setTransform()` which takes the token `id`, and an object with:
   - **format**: Format can be any string, but prefer matching file extensions whenever possible (e.g. `css`, `js`, `json`, etc).
   - **localID**: What this token is referred to within the format (e.g. `color.base.blue.500` becomes `--color-base-blue-500` in CSS)
   - **value**: The transformed value for this format.
     - _Note: values can be either a `string` for simple values, or `Record<string, string>` if a token stores multiple values (needed for [typography](/docs/json/tokens/typography), [border](/docs/json/tokens/border), etc.)_
   - **mode**: (not shown) Configures the value to show up for a certain [mode](/docs/tokens/mode) (if omitted, it’s the default or “global” mode)

All of this creates a “database” for the `css` format that can be queried in the next step. Inside the **build** step, we query those with `getTransforms()` which accepts an object as its param with the keys:

1. **format**: the same Format produced in the previous step
2. **id**: (optional) a glob or array of glob patterns to filter tokens
3. **$type**: (optional) [Token type(s)](/docs/tokens) to filter by (if omitted, it will return all modes)
4. **mode**: (not shown) Query only for specific modes (also accepts globs)

The build step can run as many queries as it wants, requesting the tokens in any order, so that the output file can be built in any order. When the file is complete, calling `buildFile(filename, contents)` will save the file and Terrazzo will write the file to disk. The build step can output as many files as it wants.

Lastly, you can test your own plugin out locally! Simply add it to `terrazzo.config.js`:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import myCssPlugin from "./my-css-plugin.js";

export default defineConfig({
  plugins: [myCssPlugin()],
});
```

:::

## FAQ

:::details{title="What are the formats Terrazzo supports?"}

Anything! When we talk about a “format,” it’s up to the plugin to name that format, and it can be any name it wants. A format is merely a query key that `build()` steps will query tokens by, so make it predictable and intuitive (file extensions are encouraged, e.g. `css`, `js`, `json`).

:::

:::details{title="Can my plugin read from another plugin’s transform() step?"}

Yup! Just be sure you know what **format** that plugin is generating so you can query it. Also set [enforce: "post"](#enforce) to run your plugin last so it can be sure the other plugin already ran.

:::

:::details{title="Can I use any JavaScript in a plugin?"}

Yes, although you’ll get the most mileage out of avoiding Node.js code (such as reading from the filesystem). Terrazzo’s Plugin API is designed to work in any environment, including in a browser (like the [Token Lab](/lab)!). While there’s nothing stopping you from using Node.js behavior, by avoiding it you’ll have a more portable plugin that can run in any environment (e.g. a browser or a serverless function).

:::

## API

The full build process consists of the following steps, in order:

1. **[config](#config)**: Terrazzo finalizes the user config, and lets the plugin know the final settings (token location, lint options, user config, etc.)
2. **[lint](#lint)**: the plugin lints the original tokens file and checks for errors
3. **[transform](#transform)**: the token values are converted to **formats** (e.g. `css`, `js`, `scss`, `json`)
4. **[build](#build)**: gather relevant transforms to assemble output file(s)
5. **[buildEnd](#buildend)**: run after all other steps (in case plugins want to introspect the final output).

In addition to the following steps, each plugin can also set additional options:

1. **[name](#name)**: This plugin’s name (useful for errors and debugging)
2. **[enforce](#enforce)**: When this plugin runs. Set to `"pre"` to run _before_ all other plugins, `"post"` to run _after_ all other plugins, or leave blank to run in the default order (array order).

### name

The plugin provides its own name (useful for error messages and debugging).

:::code-group

```js [my-plugin.js]
export default function myPlugin() {
  return {
    name: "my-plugin",
  };
}
```

:::

### enforce

Set to `"pre"` if this plugin should run before all other plugins, `"post"` to run at the end, or `undefined` for it to run in the [plugins](/docs/cli/config) array order. This is useful if this plugin relies on the output of other plugins (such as needing a [transform](#transform) it doesn’t generate).

:::code-group

```js [my-plugin.js]
export default function myPlugin() {
  return {
    name: "my-plugin",
    enforce: "pre", // run before all other plugins
  };
}
```

:::

### config

| Quality       | Notes                         |
| :------------ | :---------------------------- |
| Description   | Read the user’s final config. |
| Previous step |                               |
| Next step     | [lint](#lint)                 |

The `config()` hook fires after all plugins have been registered and the final config is resolved. This is handy when you need to grab a value from `terrazzo.config.js` (but note you can’t modify anything!).

:::code-group

```js [my-plugin.js]
export default function myPlugin() {
  let outDir;

  return {
    name: "my-plugin",
    config(userConfig) {
      outDir = userConfig.outDir;
    },
  };
}
```

:::

:::note
`config()` is **read-only**.
:::

### lint

| Quality       | Notes                   |
| :------------ | :---------------------- |
| Kind          | async, sequential       |
| Description   | Run linters.            |
| Previous step | [config](#config)       |
| Next step     | [transform](#transform) |

A plugin may register lint rules (similar to [ESLint](https://eslint.org/)) to warn or throw errors on your design tokens. Terrazzo ships with the [core linter plugin](/linting).

:::warn
If upgrading from Cobalt, the API has changed! Now it matches ESLint far more closely than before for an easier experience.
:::

The `lint()` hook returns an object where the key is the rule name, and the value is a rule.

:::code-group

```js [my-plugin/rule-primary.js]
export default {
  meta: {
    docs: {
      description: "Don’t use the words “primary” or “secondary” in names.",
      url: "https://my-docs.com/rule-primary",
    },
  },
  defaultOptions: [],
  create(context) {
    for (const [id, token] of Object.entries(context.tokens)) {
      if (["primary", "secondary"].includes(id.toLowerCase())) {
        context.report({
          message: `Invalid token name: "${id}"`, // Error message to display to the user
          node: token.source.node, // this will point to the precise token in source code
        });
      }
    }
  },
};
```

```js [my-plugin/index.js]
import primary from "./rule-primary.js";

export default function myPlugin() {
  return {
    name: "my-plugin",
    lint() {
      return {
        primary,
      };
    },
  };
}
```

:::

Like ESLint, every rule must have a `create(context)` callback. In there, you can iterate over the tokens, and call `context.report()` to surface violations. If a user wanted to opt in, they’d just add the following to their [config](/docs/cli/config):

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import myPlugin from "./my-plugin/index.js";

export default defineConfig({
  plugin: [myPlugin()],
  lint: {
    rules: {
      primary: "error", // error on the "primary" rule violation
    },
  },
});
```

:::

Like ESLint:

- **Rules don’t care about severity.** A rule’s only job is to report a _potential problem_, and doesn’t need to worry about whether something is an error, warning, or ignored. The config determines the severity.

Unlike ESLint, there are a few notable differences:

- **Namespacing isn’t provided by default.** Your rules declared in your plugin will match the user’s config. If you think your rules may conflict with other plugins, then namespace them yourself (e.g. `my-plugin/rule-foo`).
- **There’s no AST visitor.** Linting tokens is much simpler than linting an actual programming language. For that reason, there’s no AST visitor. Most token linters will simply iterate over `context.tokens` for everything they need. However, if you _really_ want to traverse an AST, you can do so by parsing and traversing `context.src` yourself.
- **There’s no auto-fixing.** Linting tokens is also a bit different, in that the source of truth may not even be source code (it was likely generated from Figma, etc.). So the APIs around fixing aren’t there yet; we’re only concerned with raising issues.

### transform

| Quality       | Notes                          |
| :------------ | :----------------------------- |
| Kind          | async, sequential              |
| Description   | Populate initial token values. |
| Previous step | [lint](#lint)                  |
| Next step     | [build](#build)                |

The **transform** hook can populate a format with transformed values. A **format** is a **language** that tokens will be written to, such as, but not limited to: `css`, `scss`, `json`, `js`, `ts`, and more.

:::code-group

```js [my-plugin.js]
import { rgb } from "culori";

export default function myPlugin() {
  name: "my-plugin",
  return {
    async transform({ tokens, setTransform }) {
      setTransform("color.base.blue.500", {
        format: "js",
        localID: "color.base.blue.500",
        value: rgb(tokens["color.base.blue.500"].$value),
        mode: ".",
      });
      setTransform("color.base.blue.500", {
        format: "ts",
        localID: "color.base.blue.500",
        value: "ReturnType<typeof rgb>",
        mode: ".",
      });
    }
  };
}
```

:::

#### Options

`transform()` takes a single object as its only parameter with the following options:

| Option          | Type                                                                                                             | Description                                                                                                                                                                                                         |
| :-------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens`        | `Object`                                                                                                         | A shallow, read-only object of all tokens with IDs as keys.                                                                                                                                                         |
| `setTransform`  | `(string, { format: string, localID?: string, value: string \| Record<string, string>, mode?: string }) => void` | Set a token value for an output format. Accepts a token ID along with **format**, **localID**, **value**, and **mode** that can all be queried for with `getTransforms()`.                                          |
| `getTransforms` | `({ format: string, id?: string \| string[], $type?: string \| string[], mode?: string \| string[] }) => void`   | Get current token transforms (note that formats may be empty in this step if your plugin [runs first](#enforce))                                                                                                    |
| `ast`           | `Object`                                                                                                         | A [JSON AST](https://github.com/humanwhocodes/momoa/tree/main/js) that represents the original tokens file (good for pointing to a specific line in the source file in case of an error, but otherwise not useful). |

### build

| Quality       | Notes                                                              |
| :------------ | :----------------------------------------------------------------- |
| Kind          | async, parallel                                                    |
| Description   | Assemble token values into built file(s) that get written to disk. |
| Previous step | [transform](#transform)                                            |
| Next step     | [buildEnd](#buildend)                                              |

The build step is where a format’s values are read and converted into output file(s). Note that the build step does always have access to the original `tokens`, however, it’s advantageous to take advantage of any [transforms](#transform) that could save some work in this step.

:::code-group

```js [my-plugin.js]
export default function myPlugin() {
  return {
    name: "my-plugin",
    async build({ tokens, getTransforms, outputFile }) {
      const output = [];

      output.push("const tokens = {");

      const colorTokens = getTransforms({
        format: "js",
        id: "color.*",
        mode: ".",
      });
      for (const token of colorTokens) {
        output.push(`  ${token.localID ?? token.token.id}: ${token.value},`);
      }
      output.push("};", "", "export default tokens;", "");

      outputFile("tokens.css", output.join("\n"));
    },
  };
}
```

:::

Though `outputFile()` takes a string, you are free to use an [AST](https://astexplorer.net/) and/or build your file(s) in any way you choose. Because Terrazzo supports any possible file output, it’s up to you to decide how you’d like to generate the file, so long as it’s a `string` at the end.

#### Options

`build()` takes a single object as its only parameter with the following options:

| Option          | Type                                                                                                            | Description                                                                                                                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens`        | `Object`                                                                                                        | A shallow, read-only object of all tokens with IDs as keys.                                                                                                                                                         |
| `getTransforms` | `({ format: string, id?: string \| string[], $type?: string \| string[],  mode?: string \| string[] }) => void` | Get final token transforms. Note that unlike [transform()](#transform), when called in this step this list is complete and read-only.                                                                               |
| `outputFile`    | `(name: string, contents: string) => void`                                                                      | A callback to create an output file. This can be called multiple times if creating multiple files.                                                                                                                  |
| `ast`           | `Object`                                                                                                        | A [JSON AST](https://github.com/humanwhocodes/momoa/tree/main/js) that represents the original tokens file (good for pointing to a specific line in the source file in case of an error, but otherwise not useful). |

:::tip

- `getTransforms()` will return all modes unless you filter with `"mode": "."`. You might see “duplicates” that aren’t really duplicates!
- `outputFile()`’s name is **relative to `outDir` in [config](/docs/cli/config)**. Prefer simple filenames when possible, though if your plugin works by creating directories, use POSIX-style paths (`"my-dir/my-file.json"`) and Terrazzo will create directories for you.

:::

### buildEnd

| Quality       | Notes                                        |
| :------------ | :------------------------------------------- |
| Kind          | async, parallel                              |
| Description   | Inspect the final build and all built files. |
| Previous step | [build](#build)                              |
| Next step     |                                              |

**buildEnd** is an optional step that is only useful for introspecting the files that were built. Though it’s too late to modify any tokens or output, you can see the final result of the build process.

##### Options

| Option          | Type                                                                                                            | Description                                                                                                                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens`        | `Object`                                                                                                        | A shallow, read-only object of all tokens with IDs as keys.                                                                                                                                                         |
| `outputFiles`   | `{name: string, contents: string, plugin: string, time: number}[]`                                              | A read-only array of all the files generated, along with the **plugin** that made it and **time** of how long the build() step took.                                                                                |
| `getTransforms` | `({ format: string, id?: string \| string[], $type?: string \| string[],  mode?: string \| string[] }) => void` | Get final token transforms.                                                                                                                                                                                         |
| `ast`           | `Object`                                                                                                        | A [JSON AST](https://github.com/humanwhocodes/momoa/tree/main/js) that represents the original tokens file (good for pointing to a specific line in the source file in case of an error, but otherwise not useful). |

### Normalized Token

The [Terrazzo parser](/docs/cli/api/node) will create **normalized tokens** that have lots of additional metadata. Each normalized token has the following:

| Property        | Type                                   | Description                                                                                                                                       |
| :-------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`            | `string`                               | This token’s global ID.                                                                                                                           |
| `$type`         | `TokenType`                            | A valid token `$type` ([docs](/docs/tokens)).                                                                                                     |
| `$description`  | `string \| undefined`                  | The token `$description`, if provided.                                                                                                            |
| `$value`        | `TokenValue`                           | The token `$value` ([docs](/docs/tokens)). This will always be the final value (even if this is an [alias](/docs/tokens/alias) of another token). |
| `aliasOf`       | `TokenNormalized \| undefined`         | The token this aliases, if any (or `undefined` if this is its original value).                                                                    |
| `group`         | `Group`                                | Information about this token’s immediate parent group (including sibling tokens).                                                                 |
| `mode`          | `Record<string, TokenNormalized>`      | A key–value map of mode name → mode value. _Note: the mode `"."` will always exist, and will always point to the default value._                  |
| `originalValue` | `Token`                                | This token’s original value from the source file.                                                                                                 |
| `source`        | `{ node: ObjectNode, filename?: URL }` | Points to a file on disk as well as a [Momoa](https://www.npmjs.com/package/@humanwhocodes/momoa) AST node (including line number).               |

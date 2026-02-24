import type { ComponentProps } from 'react';

export interface IconProps extends ComponentProps<'svg'> {
  /** default: "currentColor" */
  color?: string;
  /** default: 15 */
  size?: number | string;
}

/** Custom */
export function Token({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M10.5 1.86603C11.4282 1.33013 12.5718 1.33013 13.5 1.86603L20.0263 5.63397C20.9545 6.16987 21.5263 7.16025 21.5263 8.23205V15.7679C21.5263 16.8397 20.9545 17.8301 20.0263 18.366L13.5 22.134C12.5718 22.6699 11.4282 22.6699 10.5 22.134L3.97372 18.366C3.04552 17.8301 2.47372 16.8397 2.47372 15.7679V8.23205C2.47372 7.16025 3.04552 6.16987 3.97372 5.63397L10.5 1.86603Z' />
      <circle cx='12' cy='12' r='4' fill={color} stroke='none' strokeWidth='0' />
      <path d='M3 7L12 11.9075' />
      <path d='M21 7L12 12' />
      <path d='M12 23V12' />
    </svg>
  );
}

/** Custom */
export function Transition({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      stroke={color}
      strokeWidth='2'
      fill='none'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M8.22504 20.244C8.07674 20.4782 7.89004 20.6674 7.67827 20.7981C7.4665 20.9288 7.23489 20.9977 7 21C6.53199 21 6.08597 20.7249 5.77496 20.244L1.41382 13.4966C1.14615 13.0737 1 12.5452 1 12C1 11.4548 1.14615 10.9263 1.41382 10.5034L5.77496 3.756C5.92326 3.52179 6.10996 3.33258 6.32173 3.20189C6.5335 3.0712 6.76511 3.00226 7 3C7.46801 3 7.91403 3.27514 8.22504 3.756L12.5862 10.5034C12.8539 10.9263 13 11.4548 13 12C13 12.5452 12.8539 13.0737 12.5862 13.4966L8.22504 20.244Z' />
      <path
        d='M18 3L22.5862 10.5034C22.8539 10.9263 23 11.4548 23 12C23 12.5452 22.8539 13.0737 22.5862 13.4966L18 21'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13 3L17.5862 10.5034C17.8539 10.9263 18 11.4548 18 12C18 12.5452 17.8539 13.0737 17.5862 13.4966L13 21'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

// Ionicons
//
// The MIT License (MIT)
//
// Copyright (c) 2015-present Ionic (http://ionic.io/)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export function ColorFilterOutline({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      fill='none'
      stroke={color}
      strokeLinejoin='round'
      strokeWidth='32'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <circle cx='256' cy='184' r='120' />
      <circle cx='344' cy='328' r='120' />
      <circle cx='168' cy='328' r='120' />
    </svg>
  );
}

export function Document({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      fill='none'
      stroke={color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='32'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62z' />
      <path d='M256 56v120a32 32 0 0 0 32 32h120m-232 80h160m-160 80h160' />
    </svg>
  );
}

// Lucide Icons
// ISC License
//
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2026 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2026.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
//
// ---
//
// The MIT License (MIT) (for portions derived from Feather)
//
// Copyright (c) 2013-2026 Cole Bemis
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
export function Bold({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M6 12H15C16.0609 12 17.0783 12.4214 17.8284 13.1716C18.5786 13.9217 19 14.9391 19 16C19 17.0609 18.5786 18.0783 17.8284 18.8284C17.0783 19.5786 16.0609 20 15 20H7C6.73478 20 6.48043 19.8946 6.29289 19.7071C6.10536 19.5196 6 19.2652 6 19V5C6 4.73478 6.10536 4.48043 6.29289 4.29289C6.48043 4.10536 6.73478 4 7 4H14C15.0609 4 16.0783 4.42143 16.8284 5.17157C17.5786 5.92172 18 6.93913 18 8C18 9.06087 17.5786 10.0783 16.8284 10.8284C16.0783 11.5786 15.0609 12 14 12' />
    </svg>
  );
}

export function BookOpen({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M12 7V21M12 7C12 5.93913 11.5786 4.92172 10.8284 4.17157C10.0783 3.42143 9.06087 3 8 3H3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4V17C2 17.2652 2.10536 17.5196 2.29289 17.7071C2.48043 17.8946 2.73478 18 3 18H9C9.79565 18 10.5587 18.3161 11.1213 18.8787C11.6839 19.4413 12 20.2044 12 21M12 7C12 5.93913 12.4214 4.92172 13.1716 4.17157C13.9217 3.42143 14.9391 3 16 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V17C22 17.2652 21.8946 17.5196 21.7071 17.7071C21.5196 17.8946 21.2652 18 21 18H15C14.2044 18 13.4413 18.3161 12.8787 18.8787C12.3161 19.4413 12 20.2044 12 21' />
    </svg>
  );
}

export function Cog({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M11 10.27L7 3.34M11 13.73L7 20.66M12 22V20M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4M12 20C7.58172 20 4 16.4183 4 12M12 2V4M12 4C7.58172 4 4 7.58172 4 12M14 12H22M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12ZM17 20.66L16 18.93M17 3.34L16 5.07M2 12H4M20.66 17L18.93 16M20.66 7L18.93 8M3.34 17L5.07 16M3.34 7L5.07 8' />
    </svg>
  );
}

export function Contrast({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z' />
      <path d='M12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12C18 10.4087 17.3679 8.88258 16.2426 7.75736C15.1174 6.63214 13.5913 6 12 6V18Z' />
    </svg>
  );
}

export function DraftingCompass({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      fill='none'
      strokeWidth='2'
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      height={size}
      width={size}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='m12.99 6.74 1.93 3.44'></path>
      <path d='M19.136 12a10 10 0 0 1-14.271 0'></path>
      <path d='m21 21-2.16-3.84'></path>
      <path d='m3 21 8.02-14.26'></path>
      <circle cx='12' cy='5' r='2'></circle>
    </svg>
  );
}

export function FolderImport({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M2 9V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7.9C8.23449 2.99672 8.56445 3.07739 8.8597 3.23462C9.15495 3.39185 9.40604 3.62062 9.59 3.9L10.4 5.1C10.5821 5.37653 10.83 5.60352 11.1215 5.7606C11.413 5.91769 11.7389 5.99995 12.07 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V17M2 13H12M12 13L9 16M12 13L9 10' />
    </svg>
  );
}

export function Hash({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      fill='none'
      strokeWidth='2'
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      height={size}
      width={size}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <line x1='4' x2='20' y1='9' y2='9'></line>
      <line x1='4' x2='20' y1='15' y2='15'></line>
      <line x1='10' x2='8' y1='3' y2='21'></line>
      <line x1='16' x2='14' y1='3' y2='21'></line>
    </svg>
  );
}

export function Link({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0436 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33398 21.9434 7.023C21.932 5.71201 21.4061 4.45795 20.4791 3.53091C19.5521 2.60387 18.298 2.07803 16.987 2.06663C15.676 2.05524 14.413 2.55921 13.47 3.47L11.75 5.18M14 11C13.5705 10.4259 13.0226 9.95082 12.3935 9.60706C11.7643 9.26331 11.0685 9.05889 10.3534 9.00767C9.63821 8.95645 8.92041 9.05964 8.24866 9.31022C7.5769 9.56081 6.96689 9.95293 6.46 10.46L3.46 13.46C2.54921 14.403 2.04524 15.666 2.05663 16.977C2.06802 18.288 2.59387 19.5421 3.52091 20.4691C4.44795 21.3961 5.70201 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82' />
    </svg>
  );
}

export function Network({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M5 16V13C5 12.7348 5.10536 12.4804 5.29289 12.2929C5.48043 12.1054 5.73478 12 6 12H18C18.2652 12 18.5196 12.1054 18.7071 12.2929C18.8946 12.4804 19 12.7348 19 13V16M12 12V8M17 16H21C21.5523 16 22 16.4477 22 17V21C22 21.5523 21.5523 22 21 22H17C16.4477 22 16 21.5523 16 21V17C16 16.4477 16.4477 16 17 16ZM3 16H7C7.55228 16 8 16.4477 8 17V21C8 21.5523 7.55228 22 7 22H3C2.44772 22 2 21.5523 2 21V17C2 16.4477 2.44772 16 3 16ZM10 2H14C14.5523 2 15 2.44772 15 3V7C15 7.55228 14.5523 8 14 8H10C9.44772 8 9 7.55228 9 7V3C9 2.44772 9.44772 2 10 2Z' />
    </svg>
  );
}

export function Pilcrow({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      fill='none'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      height={size}
      width={size}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M13 4v16'></path>
      <path d='M17 4v16'></path>
      <path d='M19 4H9.5a4.5 4.5 0 0 0 0 9H13'></path>
    </svg>
  );
}

export function Rainbow({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M22 17C22 14.3478 20.9464 11.8043 19.0711 9.92893C17.1957 8.05357 14.6522 7 12 7C9.34784 7 6.8043 8.05357 4.92893 9.92893C3.05357 11.8043 2 14.3478 2 17M6 17C6 15.4087 6.63214 13.8826 7.75736 12.7574C8.88258 11.6321 10.4087 11 12 11C13.5913 11 15.1174 11.6321 16.2426 12.7574C17.3679 13.8826 18 15.4087 18 17M10 17C10 16.4696 10.2107 15.9609 10.5858 15.5858C10.9609 15.2107 11.4696 15 12 15C12.5304 15 13.0391 15.2107 13.4142 15.5858C13.7893 15.9609 14 16.4696 14 17' />
    </svg>
  );
}

export function SearchAlert({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M21 21L16.7 16.7M11 7V11M11 15H11.01M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z' />
    </svg>
  );
}

export function SquareDashedTopSolid({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      stroke={color}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M14 21H15M21 14V15M21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21M21 9V10M3 14V15M3 5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5M3 9V10M5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19M9 21H10'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function Spline({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M17 5C17 6.10457 17.8954 7 19 7C20.1046 7 21 6.10457 21 5C21 3.89543 20.1046 3 19 3C17.8954 3 17 3.89543 17 5ZM17 5C13.8174 5 10.7652 6.26428 8.51472 8.51472C6.26428 10.7652 5 13.8174 5 17M5 17C3.89543 17 3 17.8954 3 19C3 20.1046 3.89543 21 5 21C6.10457 21 7 20.1046 7 19C7 17.8954 6.10457 17 5 17Z'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function SwatchBook({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M7 21C8.06087 21 9.07828 20.5786 9.82843 19.8284C10.5786 19.0783 11 18.0609 11 17V5C11 4.46957 10.7893 3.96086 10.4142 3.58579C10.0391 3.21071 9.53043 3 9 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V17C3 18.0609 3.42143 19.0783 4.17157 19.8284C4.92172 20.5786 5.93913 21 7 21ZM7 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15C21 14.4696 20.7893 13.9609 20.4142 13.5858C20.0391 13.2107 19.5304 13 19 13H16.7M7 17H7.01M11 8L13.3 5.7C13.5233 5.47592 13.7887 5.29819 14.0809 5.17705C14.3732 5.0559 14.6865 4.99373 15.0028 4.9941C15.3192 4.99447 15.6323 5.05738 15.9243 5.17921C16.2162 5.30104 16.4812 5.47939 16.704 5.704L18.6 7.6C18.8306 7.82181 19.0145 8.08749 19.1409 8.38141C19.2674 8.67534 19.3337 8.99157 19.3362 9.31152C19.3386 9.63147 19.277 9.94868 19.155 10.2445C19.0331 10.5403 18.8532 10.8087 18.626 11.034L9.9 19.8'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function Timer({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M10 2H14M12 14L15 11M20 14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14C4 9.58172 7.58172 6 12 6C16.4183 6 20 9.58172 20 14Z' />
    </svg>
  );
}

export function ToggleRight({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M15 15C16.6569 15 18 13.6569 18 12C18 10.3431 16.6569 9 15 9C13.3431 9 12 10.3431 12 12C12 13.6569 13.3431 15 15 15Z' />
      <path d='M15 5H9C5.13401 5 2 8.13401 2 12C2 15.866 5.13401 19 9 19H15C18.866 19 22 15.866 22 12C22 8.13401 18.866 5 15 5Z' />
    </svg>
  );
}

export function Type({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      fill='none'
      strokeWidth='2'
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      height={size}
      width={size}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <polyline points='4 7 4 4 20 4 20 7'></polyline>
      <line x1='9' x2='15' y1='20' y2='20'></line>
      <line x1='12' x2='12' y1='4' y2='20'></line>
    </svg>
  );
}

export function VectorSquare({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      stroke={color}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M19.5 7C20.2021 10.2964 20.2021 13.7036 19.5 17M4.5 7C3.79785 10.2964 3.79785 13.7036 4.5 17M7 19.5C10.2964 20.2021 13.7036 20.2021 17 19.5M7 4.5C10.2964 3.79785 13.7036 3.79785 17 4.5M18 17H21C21.5523 17 22 17.4477 22 18V21C22 21.5523 21.5523 22 21 22H18C17.4477 22 17 21.5523 17 21V18C17 17.4477 17.4477 17 18 17ZM18 2H21C21.5523 2 22 2.44772 22 3V6C22 6.55228 21.5523 7 21 7H18C17.4477 7 17 6.55228 17 6V3C17 2.44772 17.4477 2 18 2ZM3 17H6C6.55228 17 7 17.4477 7 18V21C7 21.5523 6.55228 22 6 22H3C2.44772 22 2 21.5523 2 21V18C2 17.4477 2.44772 17 3 17ZM3 2H6C6.55228 2 7 2.44772 7 3V6C7 6.55228 6.55228 7 6 7H3C2.44772 7 2 6.55228 2 6V3C2 2.44772 2.44772 2 3 2Z'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

// Radix Icons
//
// MIT License
//
// Copyright (c) 2022 WorkOS
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export function CaretSort({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Check({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function ChevronDown({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function ChevronUp({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z'
        fill={color}
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Code({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.96424 2.68571C10.0668 2.42931 9.94209 2.13833 9.6857 2.03577C9.4293 1.93322 9.13832 2.05792 9.03576 2.31432L5.03576 12.3143C4.9332 12.5707 5.05791 12.8617 5.3143 12.9642C5.5707 13.0668 5.86168 12.9421 5.96424 12.6857L9.96424 2.68571ZM3.85355 5.14646C4.04882 5.34172 4.04882 5.6583 3.85355 5.85356L2.20711 7.50001L3.85355 9.14646C4.04882 9.34172 4.04882 9.6583 3.85355 9.85356C3.65829 10.0488 3.34171 10.0488 3.14645 9.85356L1.14645 7.85356C0.951184 7.6583 0.951184 7.34172 1.14645 7.14646L3.14645 5.14646C3.34171 4.9512 3.65829 4.9512 3.85355 5.14646ZM11.1464 5.14646C11.3417 4.9512 11.6583 4.9512 11.8536 5.14646L13.8536 7.14646C14.0488 7.34172 14.0488 7.6583 13.8536 7.85356L11.8536 9.85356C11.6583 10.0488 11.3417 10.0488 11.1464 9.85356C10.9512 9.6583 10.9512 9.34172 11.1464 9.14646L12.7929 7.50001L11.1464 5.85356C10.9512 5.6583 10.9512 5.34172 11.1464 5.14646Z'
      />
    </svg>
  );
}

export function ComponentInstance({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M7.1465 1.48959C7.34176 1.29432 7.65835 1.29432 7.85361 1.48959L13.5105 7.14644C13.7057 7.3417 13.7057 7.65829 13.5105 7.85355L7.85361 13.5104C7.65835 13.7057 7.34176 13.7057 7.1465 13.5104L1.48965 7.85355C1.29439 7.65829 1.29439 7.3417 1.48965 7.14644L7.1465 1.48959ZM7.50005 2.55025L2.55031 7.49999L7.50005 12.4497L12.4498 7.49999L7.50005 2.55025Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Copy({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Cross({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z'
      />
    </svg>
  );
}

export function DiscordLogo({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.07451 1.82584C5.03267 1.81926 4.99014 1.81825 4.94803 1.82284C4.10683 1.91446 2.82673 2.36828 2.07115 2.77808C2.02106 2.80525 1.97621 2.84112 1.93869 2.88402C1.62502 3.24266 1.34046 3.82836 1.11706 4.38186C0.887447 4.95076 0.697293 5.55032 0.588937 5.98354C0.236232 7.39369 0.042502 9.08728 0.0174948 10.6925C0.0162429 10.7729 0.0351883 10.8523 0.0725931 10.9234C0.373679 11.496 1.02015 12.027 1.66809 12.4152C2.32332 12.8078 3.08732 13.1182 3.70385 13.1778C3.85335 13.1922 4.00098 13.1358 4.10282 13.0255C4.2572 12.8581 4.5193 12.4676 4.71745 12.1643C4.80739 12.0267 4.89157 11.8953 4.95845 11.7901C5.62023 11.9106 6.45043 11.9801 7.50002 11.9801C8.54844 11.9801 9.37796 11.9107 10.0394 11.7905C10.1062 11.8957 10.1903 12.0269 10.2801 12.1643C10.4783 12.4676 10.7404 12.8581 10.8947 13.0255C10.9966 13.1358 11.1442 13.1922 11.2937 13.1778C11.9102 13.1182 12.6742 12.8078 13.3295 12.4152C13.9774 12.027 14.6239 11.496 14.925 10.9234C14.9624 10.8523 14.9813 10.7729 14.9801 10.6925C14.9551 9.08728 14.7613 7.39369 14.4086 5.98354C14.3003 5.55032 14.1101 4.95076 13.8805 4.38186C13.6571 3.82836 13.3725 3.24266 13.0589 2.88402C13.0214 2.84112 12.9765 2.80525 12.9264 2.77808C12.1708 2.36828 10.8907 1.91446 10.0495 1.82284C10.0074 1.81825 9.96489 1.81926 9.92305 1.82584C9.71676 1.85825 9.5391 1.96458 9.40809 2.06355C9.26977 2.16804 9.1413 2.29668 9.0304 2.42682C8.86968 2.61544 8.71437 2.84488 8.61428 3.06225C8.27237 3.03501 7.90138 3.02 7.5 3.02C7.0977 3.02 6.72593 3.03508 6.38337 3.06244C6.28328 2.84501 6.12792 2.61549 5.96716 2.42682C5.85626 2.29668 5.72778 2.16804 5.58947 2.06355C5.45846 1.96458 5.2808 1.85825 5.07451 1.82584ZM11.0181 11.5382C11.0395 11.5713 11.0615 11.6051 11.0838 11.6392C11.2169 11.843 11.3487 12.0385 11.4508 12.1809C11.8475 12.0916 12.352 11.8818 12.8361 11.5917C13.3795 11.2661 13.8098 10.8918 14.0177 10.5739C13.9852 9.06758 13.7993 7.50369 13.4773 6.21648C13.38 5.82759 13.2038 5.27021 12.9903 4.74117C12.7893 4.24326 12.5753 3.82162 12.388 3.5792C11.7376 3.24219 10.7129 2.88582 10.0454 2.78987C10.0308 2.79839 10.0113 2.81102 9.98675 2.82955C9.91863 2.881 9.84018 2.95666 9.76111 3.04945C9.71959 3.09817 9.68166 3.1471 9.64768 3.19449C9.953 3.25031 10.2253 3.3171 10.4662 3.39123C11.1499 3.6016 11.6428 3.89039 11.884 4.212C12.0431 4.42408 12.0001 4.72494 11.788 4.884C11.5759 5.04306 11.2751 5.00008 11.116 4.788C11.0572 4.70961 10.8001 4.4984 10.1838 4.30877C9.58933 4.12585 8.71356 3.98 7.5 3.98C6.28644 3.98 5.41067 4.12585 4.81616 4.30877C4.19988 4.4984 3.94279 4.70961 3.884 4.788C3.72494 5.00008 3.42408 5.04306 3.212 4.884C2.99992 4.72494 2.95694 4.42408 3.116 4.212C3.35721 3.89039 3.85011 3.6016 4.53383 3.39123C4.77418 3.31727 5.04571 3.25062 5.35016 3.19488C5.31611 3.14738 5.27808 3.09831 5.23645 3.04945C5.15738 2.95666 5.07893 2.881 5.01081 2.82955C4.98628 2.81102 4.96674 2.79839 4.95217 2.78987C4.28464 2.88582 3.25999 3.24219 2.60954 3.5792C2.42226 3.82162 2.20825 4.24326 2.00729 4.74117C1.79376 5.27021 1.61752 5.82759 1.52025 6.21648C1.19829 7.50369 1.01236 9.06758 0.97986 10.5739C1.18772 10.8918 1.61807 11.2661 2.16148 11.5917C2.64557 11.8818 3.15003 12.0916 3.5468 12.1809C3.64885 12.0385 3.78065 11.843 3.9138 11.6392C3.93626 11.6048 3.95838 11.5708 3.97996 11.5375C3.19521 11.2591 2.77361 10.8758 2.50064 10.4664C2.35359 10.2458 2.4132 9.94778 2.63377 9.80074C2.85435 9.65369 3.15236 9.71329 3.29941 9.93387C3.56077 10.3259 4.24355 11.0201 7.50002 11.0201C10.7565 11.0201 11.4392 10.326 11.7006 9.93386C11.8477 9.71329 12.1457 9.65369 12.3663 9.80074C12.5869 9.94779 12.6465 10.2458 12.4994 10.4664C12.2262 10.8762 11.8041 11.2598 11.0181 11.5382ZM4.08049 7.01221C4.32412 6.74984 4.65476 6.60162 5.00007 6.59998C5.34538 6.60162 5.67603 6.74984 5.91966 7.01221C6.16329 7.27459 6.30007 7.62974 6.30007 7.99998C6.30007 8.37021 6.16329 8.72536 5.91966 8.98774C5.67603 9.25011 5.34538 9.39833 5.00007 9.39998C4.65476 9.39833 4.32412 9.25011 4.08049 8.98774C3.83685 8.72536 3.70007 8.37021 3.70007 7.99998C3.70007 7.62974 3.83685 7.27459 4.08049 7.01221ZM9.99885 6.59998C9.65354 6.60162 9.3229 6.74984 9.07926 7.01221C8.83563 7.27459 8.69885 7.62974 8.69885 7.99998C8.69885 8.37021 8.83563 8.72536 9.07926 8.98774C9.3229 9.25011 9.65354 9.39833 9.99885 9.39998C10.3442 9.39833 10.6748 9.25011 10.9184 8.98774C11.1621 8.72536 11.2989 8.37021 11.2989 7.99998C11.2989 7.62974 11.1621 7.27459 10.9184 7.01221C10.6748 6.74984 10.3442 6.60162 9.99885 6.59998Z'
      />
    </svg>
  );
}

export function ExclamationTriangle({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function ExternalLink({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function FontFamily({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M2.5 4.5C2.5 3.09886 3.59886 2 5 2H12.499C12.7752 2 13 2.22386 13 2.5C13 2.77614 12.7761 3 12.5 3H8.69244L8.40509 3.85458C8.18869 4.49752 7.89401 5.37197 7.58091 6.29794C7.50259 6.52956 7.42308 6.76453 7.34332 7H8.5C8.77614 7 9 7.22386 9 7.5C9 7.77614 8.77614 8 8.5 8H7.00407C6.56724 9.28543 6.16435 10.4613 5.95799 11.0386C5.63627 11.9386 5.20712 12.4857 4.66741 12.7778C4.16335 13.0507 3.64154 13.0503 3.28378 13.05L3.25 13.05C2.94624 13.05 2.7 12.8037 2.7 12.5C2.7 12.1962 2.94624 11.95 3.25 11.95C3.64182 11.95 3.9035 11.9405 4.14374 11.8105C4.36443 11.691 4.65532 11.4148 4.92217 10.6683C5.10695 10.1514 5.45375 9.14134 5.8422 8H4.5C4.22386 8 4 7.77614 4 7.5C4 7.22386 4.22386 7 4.5 7H6.18187C6.30127 6.64785 6.42132 6.29323 6.53887 5.94559C6.85175 5.02025 7.14627 4.14631 7.36256 3.50368L7.53192 3H5C4.15114 3 3.5 3.65114 3.5 4.5C3.5 4.77614 3.27614 5 3 5C2.72386 5 2.5 4.77614 2.5 4.5Z' />
    </svg>
  );
}

export function GitHubLogo({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Half2({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      stroke='none'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM7.49988 1.82689C4.36688 1.8269 1.82707 4.36672 1.82707 7.49972C1.82707 10.6327 4.36688 13.1725 7.49988 13.1726V1.82689Z'
      />
    </svg>
  );
}

export function Heading({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      stroke='none'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8.75432 2.0502C8.50579 2.0502 8.30432 2.25167 8.30432 2.5002C8.30432 2.74873 8.50579 2.9502 8.75432 2.9502H9.94997V7.05004H5.04997V2.9502H6.25432C6.50285 2.9502 6.70432 2.74873 6.70432 2.5002C6.70432 2.25167 6.50285 2.0502 6.25432 2.0502H2.75432C2.50579 2.0502 2.30432 2.25167 2.30432 2.5002C2.30432 2.74873 2.50579 2.9502 2.75432 2.9502H3.94997V12.0502H2.75432C2.50579 12.0502 2.30432 12.2517 2.30432 12.5002C2.30432 12.7487 2.50579 12.9502 2.75432 12.9502H6.25432C6.50285 12.9502 6.70432 12.7487 6.70432 12.5002C6.70432 12.2517 6.50285 12.0502 6.25432 12.0502H5.04997V7.95004H9.94997V12.0502H8.75432C8.50579 12.0502 8.30432 12.2517 8.30432 12.5002C8.30432 12.7487 8.50579 12.9502 8.75432 12.9502H12.2543C12.5028 12.9502 12.7043 12.7487 12.7043 12.5002C12.7043 12.2517 12.5028 12.0502 12.2543 12.0502H11.05V2.9502H12.2543C12.5028 2.9502 12.7043 2.74873 12.7043 2.5002C12.7043 2.25167 12.5028 2.0502 12.2543 2.0502H8.75432Z'
      />
    </svg>
  );
}

export function InfoCircled({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function LightningBolt({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width='15'
      height='15'
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M8.69667 0.0403541C8.90859 0.131038 9.03106 0.354857 8.99316 0.582235L8.0902 6.00001H12.5C12.6893 6.00001 12.8625 6.10701 12.9472 6.27641C13.0319 6.4458 13.0136 6.6485 12.8999 6.80001L6.89997 14.8C6.76167 14.9844 6.51521 15.0503 6.30328 14.9597C6.09135 14.869 5.96888 14.6452 6.00678 14.4178L6.90974 9H2.49999C2.31061 9 2.13748 8.893 2.05278 8.72361C1.96809 8.55422 1.98636 8.35151 2.09999 8.2L8.09997 0.200038C8.23828 0.0156255 8.48474 -0.0503301 8.69667 0.0403541ZM3.49999 8.00001H7.49997C7.64695 8.00001 7.78648 8.06467 7.88148 8.17682C7.97648 8.28896 8.01733 8.43723 7.99317 8.5822L7.33027 12.5596L11.5 7.00001H7.49997C7.353 7.00001 7.21347 6.93534 7.11846 6.8232C7.02346 6.71105 6.98261 6.56279 7.00678 6.41781L7.66968 2.44042L3.49999 8.00001Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function MagnifyingGlass({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Moon({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.89998 0.499976C2.89998 0.279062 2.72089 0.0999756 2.49998 0.0999756C2.27906 0.0999756 2.09998 0.279062 2.09998 0.499976V1.09998H1.49998C1.27906 1.09998 1.09998 1.27906 1.09998 1.49998C1.09998 1.72089 1.27906 1.89998 1.49998 1.89998H2.09998V2.49998C2.09998 2.72089 2.27906 2.89998 2.49998 2.89998C2.72089 2.89998 2.89998 2.72089 2.89998 2.49998V1.89998H3.49998C3.72089 1.89998 3.89998 1.72089 3.89998 1.49998C3.89998 1.27906 3.72089 1.09998 3.49998 1.09998H2.89998V0.499976ZM5.89998 3.49998C5.89998 3.27906 5.72089 3.09998 5.49998 3.09998C5.27906 3.09998 5.09998 3.27906 5.09998 3.49998V4.09998H4.49998C4.27906 4.09998 4.09998 4.27906 4.09998 4.49998C4.09998 4.72089 4.27906 4.89998 4.49998 4.89998H5.09998V5.49998C5.09998 5.72089 5.27906 5.89998 5.49998 5.89998C5.72089 5.89998 5.89998 5.72089 5.89998 5.49998V4.89998H6.49998C6.72089 4.89998 6.89998 4.72089 6.89998 4.49998C6.89998 4.27906 6.72089 4.09998 6.49998 4.09998H5.89998V3.49998ZM1.89998 6.49998C1.89998 6.27906 1.72089 6.09998 1.49998 6.09998C1.27906 6.09998 1.09998 6.27906 1.09998 6.49998V7.09998H0.499976C0.279062 7.09998 0.0999756 7.27906 0.0999756 7.49998C0.0999756 7.72089 0.279062 7.89998 0.499976 7.89998H1.09998V8.49998C1.09998 8.72089 1.27906 8.89997 1.49998 8.89997C1.72089 8.89997 1.89998 8.72089 1.89998 8.49998V7.89998H2.49998C2.72089 7.89998 2.89998 7.72089 2.89998 7.49998C2.89998 7.27906 2.72089 7.09998 2.49998 7.09998H1.89998V6.49998ZM8.54406 0.98184L8.24618 0.941586C8.03275 0.917676 7.90692 1.1655 8.02936 1.34194C8.17013 1.54479 8.29981 1.75592 8.41754 1.97445C8.91878 2.90485 9.20322 3.96932 9.20322 5.10022C9.20322 8.37201 6.82247 11.0878 3.69887 11.6097C3.45736 11.65 3.20988 11.6772 2.96008 11.6906C2.74563 11.702 2.62729 11.9535 2.77721 12.1072C2.84551 12.1773 2.91535 12.2458 2.98667 12.3128L3.05883 12.3795L3.31883 12.6045L3.50684 12.7532L3.62796 12.8433L3.81491 12.9742L3.99079 13.089C4.11175 13.1651 4.23536 13.2375 4.36157 13.3059L4.62496 13.4412L4.88553 13.5607L5.18837 13.6828L5.43169 13.7686C5.56564 13.8128 5.70149 13.8529 5.83857 13.8885C5.94262 13.9155 6.04767 13.9401 6.15405 13.9622C6.27993 13.9883 6.40713 14.0109 6.53544 14.0298L6.85241 14.0685L7.11934 14.0892C7.24637 14.0965 7.37436 14.1002 7.50322 14.1002C11.1483 14.1002 14.1032 11.1453 14.1032 7.50023C14.1032 7.25044 14.0893 7.00389 14.0623 6.76131L14.0255 6.48407C13.991 6.26083 13.9453 6.04129 13.8891 5.82642C13.8213 5.56709 13.7382 5.31398 13.6409 5.06881L13.5279 4.80132L13.4507 4.63542L13.3766 4.48666C13.2178 4.17773 13.0353 3.88295 12.8312 3.60423L12.6782 3.40352L12.4793 3.16432L12.3157 2.98361L12.1961 2.85951L12.0355 2.70246L11.8134 2.50184L11.4925 2.24191L11.2483 2.06498L10.9562 1.87446L10.6346 1.68894L10.3073 1.52378L10.1938 1.47176L9.95488 1.3706L9.67791 1.2669L9.42566 1.1846L9.10075 1.09489L8.83599 1.03486L8.54406 0.98184ZM10.4032 5.30023C10.4032 4.27588 10.2002 3.29829 9.83244 2.40604C11.7623 3.28995 13.1032 5.23862 13.1032 7.50023C13.1032 10.593 10.596 13.1002 7.50322 13.1002C6.63646 13.1002 5.81597 12.9036 5.08355 12.5522C6.5419 12.0941 7.81081 11.2082 8.74322 10.0416C8.87963 10.2284 9.10028 10.3497 9.34928 10.3497C9.76349 10.3497 10.0993 10.0139 10.0993 9.59971C10.0993 9.24256 9.84965 8.94373 9.51535 8.86816C9.57741 8.75165 9.63653 8.63334 9.6926 8.51332C9.88358 8.63163 10.1088 8.69993 10.35 8.69993C11.0403 8.69993 11.6 8.14028 11.6 7.44993C11.6 6.75976 11.0406 6.20024 10.3505 6.19993C10.3853 5.90487 10.4032 5.60464 10.4032 5.30023Z'
      />
    </svg>
  );
}

export function Stack({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        d='M7.75432 1.81954C7.59742 1.72682 7.4025 1.72682 7.24559 1.81954L1.74559 5.06954C1.59336 5.15949 1.49996 5.32317 1.49996 5.5C1.49996 5.67683 1.59336 5.84051 1.74559 5.93046L7.24559 9.18046C7.4025 9.27318 7.59742 9.27318 7.75432 9.18046L13.2543 5.93046C13.4066 5.84051 13.5 5.67683 13.5 5.5C13.5 5.32317 13.4066 5.15949 13.2543 5.06954L7.75432 1.81954ZM7.49996 8.16923L2.9828 5.5L7.49996 2.83077L12.0171 5.5L7.49996 8.16923ZM2.25432 8.31954C2.01658 8.17906 1.70998 8.2579 1.56949 8.49564C1.42901 8.73337 1.50785 9.03998 1.74559 9.18046L7.24559 12.4305C7.4025 12.5232 7.59742 12.5232 7.75432 12.4305L13.2543 9.18046C13.4921 9.03998 13.5709 8.73337 13.4304 8.49564C13.2899 8.2579 12.9833 8.17906 12.7456 8.31954L7.49996 11.4192L2.25432 8.31954Z'
        fillRule='evenodd'
        clipRule='evenodd'
      />
    </svg>
  );
}

export function Sun({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z'
      />
    </svg>
  );
}

export function TriangleRight({ color = 'currentColor', size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 15 15'
      fill={color}
      fillRule='evenodd'
      clipRule='evenodd'
      xmlns='http://www.w3.org/2000/svg'
      role='graphics-symbol img'
      aria-hidden={(!props['aria-label'] && !props['aria-labelledby']) || undefined}
      {...props}
    >
      <path d='M6 11L6 4L10.5 7.5L6 11Z' />
    </svg>
  );
}

// Terrazzo Semantic Aliases
type TokenType =
  | 'boolean'
  | 'border'
  | 'color'
  | 'cubicBezier'
  | 'dimension'
  | 'duration'
  | 'fontFamily'
  | 'fontWeight'
  | 'gradient'
  | 'link'
  | 'number'
  | 'shadow'
  | 'strokeStyle'
  | 'transition'
  | 'typography';

// Aliases
export const BooleanToken = ToggleRight;
export const BorderToken = VectorSquare;
export const ColorToken = SwatchBook;
export const Config = Cog;
export const CubicBezierToken = Spline;
export const DimensionToken = DraftingCompass;
export const Docs = BookOpen;
export const DurationToken = Timer;
export const Export = FolderImport;
export const FontFamilyToken = FontFamily;
export const FontWeightToken = Bold;
export const GradientToken = Rainbow;
export const LinkToken = Link;
export const Lint = SearchAlert;
export const NumberToken = Hash;
export const Output = FolderImport;
export const Resolver = Network;
export const Settings = Cog;
export const ShadowToken = Contrast;
export const StrokeStyleToken = SquareDashedTopSolid;
export const TransitionToken = Transition;
export const TypographyToken = Type;

export interface TokenIconProps extends IconProps {
  type: TokenType;
}

export function TokenIcon({ type, ...rest }: TokenIconProps) {
  switch (type) {
    case 'border': {
      return <BorderToken {...rest} />;
    }
    case 'boolean': {
      return <BooleanToken {...rest} />;
    }
    case 'color': {
      return <ColorToken {...rest} />;
    }
    case 'cubicBezier': {
      return <CubicBezierToken {...rest} />;
    }
    case 'dimension': {
      return <DimensionToken {...rest} />;
    }
    case 'duration': {
      return <DurationToken {...rest} />;
    }
    case 'fontFamily': {
      return <FontFamilyToken {...rest} />;
    }
    case 'fontWeight': {
      return <FontFamilyToken {...rest} />;
    }
    case 'gradient': {
      return <GradientToken {...rest} />;
    }
    case 'link': {
      return <LinkToken {...rest} />;
    }
    case 'number': {
      return <NumberToken {...rest} />;
    }
    case 'shadow': {
      return <ShadowToken {...rest} />;
    }
    case 'strokeStyle': {
      return <StrokeStyleToken {...rest} />;
    }
    case 'transition': {
      return <TransitionToken {...rest} />;
    }
    case 'typography': {
      return <TypographyToken {...rest} />;
    }
    default: {
      return <ColorToken {...rest} />;
    }
  }
}

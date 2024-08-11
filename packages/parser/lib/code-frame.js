// This is copied from @babel/code-frame package but without the heavyweight color highlighting
// (note: Babel loads both chalk AND picocolors, and doesn’t treeshake well)
// Babel is MIT-licensed and unaffiliated with this project.

// MIT License
//
// Copyright (c) 2014-present Sebastian McKenzie and other contributors
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Extract what lines should be marked and highlighted.
 */

function getMarkerLines(loc, source, opts = {}) {
  const startLoc = {
    column: 0,
    line: -1,
    ...loc.start,
  };
  const endLoc = {
    ...startLoc,
    ...loc.end,
  };
  const { linesAbove = 2, linesBelow = 3 } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;

  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;

        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;

        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return { start, end, markerLines };
}

/**
 * RegExp to test for newlines in terminal.
 */

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

export function codeFrameColumns(rawLines, loc, opts = {}) {
  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === 'number';

  const numberMaxWidth = String(end).length;

  let frame = rawLines
    .split(NEWLINE, end)
    .slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} |`;
      const hasMarker = markerLines[number];
      const lastMarkerLine = !markerLines[number + 1];
      if (hasMarker) {
        let markerLine = '';
        if (Array.isArray(hasMarker)) {
          const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, ' ');
          const numberOfMarkers = hasMarker[1] || 1;

          markerLine = ['\n ', gutter.replace(/\d/g, ' '), ' ', markerSpacing, '^'.repeat(numberOfMarkers)].join('');

          if (lastMarkerLine && opts.message) {
            markerLine += ` ${opts.message}`;
          }
        }
        return ['>', gutter, line.length > 0 ? ` ${line}` : '', markerLine].join('');
      } else {
        return ` ${gutter}${line.length > 0 ? ` ${line}` : ''}`;
      }
    })
    .join('\n');

  if (opts.message && !hasColumns) {
    frame = `${' '.repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  return frame;
}

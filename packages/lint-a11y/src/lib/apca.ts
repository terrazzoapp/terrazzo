import { dimensionToPx } from './index.js';

// https://github.com/Myndex/apca-w3
//
// Code and documentation in this repository is copyright © 2019-2023 by Andrew Somers and/or Myndex™. All Rights Reserved.
//
// Patent(s) pending.
//
// # — LICENSE —
//
// ## _W3 License for Compliant Code Only_
// IMPORTANT: please see the [APCA integration compliance doc.](https://git.apcacontrast.com/documentation/minimum_compliance)
// ### The Short Summary, TL;DR:
// Files in this repository are licensed to the W3/AGWG under their cooperative agreement for use with WCAG accessibility guidelines for web-delivered and web-based content only, and not for any other use. Certain limitations do apply.
//
// Use of the terms "SAPC", "SACAM", "APCA", "Advanced Perceptual Contrast Algorithm", "Accessible Perceptual Contrast Algorithm", to describe any contrast method, app, or device, is only permitted for code that is correctly implemented, maintained, and up to date, per the [APCA integration compliance](https://git.apcacontrast.com/documentation/minimum_compliance) page.
//
// Code or implementations found to be non-compliant with APCA, meaning they are incorrect in operation or methodology as defined for APCA contrast, including but not limited to the indication of polarity, and use of the current approved constants, **shall be deemed in breech of license and a copyright violation.**
//
// All code instantiations where are public facing in any way are required to follow the base algorithm as defined. Current base reference algorithm is 0.0.98G-4g WITH an output clamp at approximately ±Lc10 (for reference, this is the underlying algorithm for apca-w3 versions 0.1.9)
//
// ## DEPENDENCIES
// Any dependencies created by and provided by Myndex Research or Andrew Somers as part of the apca-w3 package @ npm, or this repository, are hereby included by reference within this license, including but not limited to the Color Parsley package, when these dependencies are used with APCA–W3.
// ______________
//
// ## W3 VERSION LICENSE:
//
// Files in this Repository are licensed to the W3.org under their cooperative license agreement(s), but subject to the further limitations as defined in this license agreement.
//
// - Reports in this Repository are licensed under the
// [W3C Software and Document License](http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
// [LOCAL COPY](https://github.com/Myndex/apca-w3/blob/master/LICENSE.md#w3c-software-and-document-notice-and-license)
//
// - Contributions to Specifications are made under the
// [W3C CLA](https://www.w3.org/community/about/agreements/cla/).
//
// - Contributions to Test Suites are made under the
// [W3C 3-clause BSD License](https://www.w3.org/Consortium/Legal/2008/03-bsd-license.html)
//
// Any files, or use cases of files, not under the W3 cooperative agreement are licensed under the AGPU v3 License, subject to limitations as cited in the disclaimers.
//
// -----
// ## W3/AGWG/WCAG VERSION DISCLAIMER AND RESTRICTIONS
//
// _**DISCLAIMER AND LIMITATIONS OF USE:**_
// **apca-w3** is an embodiment of certain supra-threshold contrast
// prediction technologies and it is licensed to the W3 on a
// limited basis for use in WCAG accessibility guidelines
// for web content only. **apca-w3**  may be used for
// predicting contrast for web content used for that
// specific purpose without royalty.
//
// Said license excludes other use cases
// not related to web content. Prohibited uses include
// medical, clinical evaluation, human safety related,
// aerospace, transportation, military applications,
// and uses which are not specific to web-based content
// presented on self-illuminated displays or devices.
//
// _**RIGHT TO AUDIT CODE**_
// Any integration of APCA, SAPC, or SACAM which is in a commercial app or behind a paywall, free access must be provided to Myndex Research, or their assigns, on request, for the purpose of evaluating and verifying correct operations and implementation of the APCA/SAPC/SACAM functions.
//
// _**NO ALTERATION; KEEP CURRENT**_
// Any **apca-w3** files in this repository may be used or incorporated only in tools for web-based content or web related content in support of the WCAG accessibility guidelines, and such use must be without modification to the essential elements of the code or specific approved constants, except as required to port to a given language.
//
// - Developers are highly encouraged to use the npm package(s) when possible:  ` npm i apca-w3 `
//
// - Developers incorporating this code into their applications, widgets, or other tools, have a duty to ensure that the most recent version of this code is used in their current or any future release.
//
// - Breaking change exception:
//     - developers do not need to incorporate future versions of **apca-w3** that have breaking changes when their release is only a minor or patch version per semantic versioning.
//     - developers with minor or patch revisions are still obligated to use the latest non-breaking branch of **apca-w3**.
//     - developers with a major revision per semantic versioning are obligated to use the most recent stable **apca-w3**.
//
// _**USE OF APCA TERMINOLOGY**_
// - Use of the acronyms APCA™, SAPC™, or SACAM, or the terms "Advanced Perceptual Contrast Algorithm"™, "Accessible Perceptual Contrast Algorithm"™, or "Readability Contrast"™, to describe any embodiment, integration, or instantiation of contrast determination, method, or math, including the APCA code base or libraries, **is only permitted for code that is properly implementing the APCA algorithm, and maintaining sync with the current version. At this writing, current base algorithm formula is version 0.0.98G-4g or later.**
//
// _**USE OF THE APCA LOGO AND TRADEMARK**_
// - Use of the APCA logo as shown at this repo to describe any contrast app, use, or method, or the "Powered by APCA" logo, and/or any related official logos or trademarks, **are prohibited without written consent** from Myndex™ Technologies, Myndex™ Research, Andrew Somers, and/or the authorized agents or assigns.
// - Developers wishing to use the APCA or "Powered by APCA" logos or trademarks **must submit their application or tools for qualification** to be granted a limited license to use the APCA or "Powered by APCA" logos or trademarks in association with their tools.
// - Formal details on the APCA and "Powered by APCA" qualification process are pending. In the interim, make a qualification request in the discussion tab of this repo.
//
//
// ## GENERAL DISCLAIMER
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// **_DISCLAIMER AND LIMITATIONS OF USE:_**
//
// APCA is an embodiment of certain supra-threshold contrast
// prediction technologies. Versions marked as licensed to
// the W3 are strictly limited to web content use only for
// supporting certain accessibility guidelines.
//
// APCA code listed here is provided as is, with no
// warrantees expressed nor implied. We accept no
// liability for any use or misuse of the code.
// Suitability of  purpose resides with the
// integrator or end user.
//
// Commercial use is prohibited without a written
// and signed commercial license agreement, except
// as provided by the W3 cooperative agreement for
// web content only.
//
// Non-commercial use is permitted only for
// predicting contrast for web content, no
// other use case is authorized.
//
// License excludes other use cases not related to web
// content. Prohibited uses include and are not limited
// to medical, clinical evaluation, human safety related,
// aerospace, transportation, military applications, and
// uses which are not specific to web-based content
// presented on self-illuminated displays or devices.
//
// ### Other licensing information
//
// All Files _in this Repository_ that do not fall under the W3 cooperative agreement, if they exist, may have different license terms. Files, code, or other assets related to SAPC, APCA, Perceptex, or Myndex Perception Research, that are not _currently_ in this repository are not available for license or use without a written agreement.
//
// ## WITHDRAWN ASSETS
// ONLY files that are currently in this repository are available for use under these license terms.
//
// As some code herein is early beta, and there is a clear interest to prevent obsolete versions from propagating, license for use is revoked when any such asset is removed from this repository. Prior to revocation, files will be placed in the OBSOLETE/PENDING_DELETE folder for a limited period to allow time for revision. Please replace any stale assets with the revised assets herein as soon as practical.
//
// #### The current assets shall be in:
//     /dist/
//     /src/
// #### Non breaking earlier versions shall be placed in:
//     /LEGACY/
// #### Breaking and deprecated versions shall be placed in:
//     /DEPRECATED/
// #### Breaking, invalid, and revoked versions shall be placed in:
//     /OBSOLETE/
//     /OBSOLETE/PENDING_DELETE/
//
// ### Misc Licensing
// Any files that do not fall under the above categories are per the license as indicated in each file.
//
//
// -----
// ## THE FOLLOWING LIMITED LICENSE IS SUBJECT TO THE ABOVE LISTED LIMITATIONS AND EXCLUSIONS.
//
// ## W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE
// This work is being provided by the copyright holders under the following license.
//
// ### License
// By obtaining and/or copying this work, you (the licensee) agree that you have read, understood, and will comply with the following terms and conditions.
// Permission to copy this work without modification, except as needed for integration to a specific language or environment, for any purpose other than those specifically excluded, and thereafter without fee or royalty is hereby granted, provided that you include the following on ALL copies of the work or portions thereof, including modifications:
// - The full text of this NOTICE in a location viewable to users of the redistributed or derivative work.
// - Any pre-existing intellectual property disclaimers, notices, or terms and conditions. If none exist, the W3C Software and Document Short Notice should be included.
// - Notice of any changes or modifications, through a copyright statement on the new code or document such as "This software or document includes material copied from or derived from [title and URI of the W3C document]. Copyright © [YEAR] W3C® (MIT, ERCIM, Keio, Beihang)."
//
// ### Disclaimers
// THIS WORK IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE OR DOCUMENT WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.
//
// COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENT.
//
// The name and trademarks of copyright holders may NOT be used in advertising or publicity pertaining to the work without specific, written prior permission. Title to copyright in this work will at all times remain with copyright holders.

/**
 * Table indexed by font size, then by weight ([100,200,300,400,500,600,700,800,900]).
 * @see https://www.myndex.com/APCA/
 */
export const APCA_FONT_LOOKUP_TABLE: [
  number,
  [number, number, number, number, number, number, number, number, number],
][] = [
  // size   100   200   300   400   500   600   700   800   900
  [120,   [  40,   35,   25,   25,  999,  999,  999,  999,  999]], // biome-ignore format: these are aligned
  [108,   [ 999,  999,   35,   30,   30,   25,  999,  999,  999]], // biome-ignore format: these are aligned
  [ 96,   [  50,   45,   35,   33,   30,   30,   30,   30,   30]], // biome-ignore format: these are aligned
  [ 72,   [  60,   50,   40,   35,   33,   30,   30,   30,   30]], // biome-ignore format: these are aligned
  [ 60,   [  75,   55,   45,   38,   35,   33,   30,   30,   30]], // biome-ignore format: these are aligned
  [ 48,   [  90,   60,   50,   40,   38,   35,   33,   33,   33]], // biome-ignore format: these are aligned
  [ 42,   [ 100,   70,   55,   43,   40,   38,   35,   35,   35]], // biome-ignore format: these are aligned
  [ 36,   [ 999,   75,   60,   45,   43,   40,   38,   38,   38]], // biome-ignore format: these are aligned
  [ 32,   [ 999,   90,   65,   50,   45,   43,   40,   40,   40]], // biome-ignore format: these are aligned
  [ 28,   [ 999,  100,   70,   55,   50,   45,   43,   43,   43]], // biome-ignore format: these are aligned
  [ 24,   [ 999,  777,   75,   60,   55,   50,   45,   45,   45]], // biome-ignore format: these are aligned
  [ 21,   [ 999,  777,   90,   70,   60,   55,   50,   50,   50]], // biome-ignore format: these are aligned
  [ 18,   [ 999,  777,  100,   75,   70,   60,   55,   55,   55]], // biome-ignore format: these are aligned
  [ 16,   [ 999,  999,  777,   90,   75,   70,   60,   60,  999]], // biome-ignore format: these are aligned
  [ 15,   [ 999,  999,  777,  100,   90,   75,   70,  999,  999]], // biome-ignore format: these are aligned
  [ 14,   [ 999,  999,  777,  100,  100,   90,   75,  999,  999]], // biome-ignore format: these are aligned
  [ 12,   [ 999,  999,  999,  777,  777,  777,  777,  999,  999]], // biome-ignore format: these are aligned
  [ 10,   [ 999,  999,  999,  999,  999,  999,  999,  999,  999]], // biome-ignore format: these are aligned
];

/**
 * 0 - 100: actual Lc
 *     777: non-text
 *     999: unacceptable
 */
export function getMinimumSilverLc(fontSize: string | number, fontWeight: number, bodyText = true): number {
  if (!(fontWeight > 0 && fontWeight < 1000)) {
    throw new Error(`Invalid font weight: ${fontWeight}`);
  }

  const sizePx = dimensionToPx(fontSize);
  const sizeRowI = APCA_FONT_LOOKUP_TABLE.findIndex(([size]) => sizePx >= size);
  if (sizeRowI === -1) {
    return 999;
  }

  const weightColI = Math.round(fontWeight / 100) - 1; // round weight
  const sizeDelta =
    sizeRowI > 0
      ? (sizePx - APCA_FONT_LOOKUP_TABLE[sizeRowI]![0]) /
        (APCA_FONT_LOOKUP_TABLE[sizeRowI - 1]![0] - APCA_FONT_LOOKUP_TABLE[sizeRowI]![0] || 1)
      : 0;
  const baseLc = APCA_FONT_LOOKUP_TABLE[sizeRowI]![1][weightColI];
  if (baseLc === undefined || baseLc === 999) {
    return 999;
  }

  // with baseLc calculated, we may need to interpolate between font sizes; do so with simple linear interpolation
  const stepUpLc = sizeDelta > 0 ? APCA_FONT_LOOKUP_TABLE[sizeRowI - 1]![1][weightColI]! : baseLc;
  const finalLc = sizeDelta > 0 ? baseLc + sizeDelta * (stepUpLc - baseLc) : baseLc;

  // note; the “add 15 Lc to body text” requirement is hard
  return finalLc + (bodyText && finalLc <= 70 ? 15 : 0);
}

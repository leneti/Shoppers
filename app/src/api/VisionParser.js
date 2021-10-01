const MARKETS = ["LIDL", "TESCO"];
const SKIPWORDS = [
  "£",
  "dundee",
  "vat",
  "no.",
  "no:",
  "соpy" /*Weird version of 'c' and 'o'*/,
  "copy",
  "gb350396892",
  "card",
  "*customer",
  "copy*",
  "please",
  "retain",
  "receipt",
  "date:",
  "time:",
  "===",
  "total",
  "тоtal",
  "toial",
  "t0tal",
  "a",
  "b",
  "mid:",
  "trns",
  "visa",
  "prepaid",
  "a0000000031010",
  "***16872",
  "dun",
  "-city",
  "centre",
];
const STOPWORDS = ["tid:", "sale"];

/**
 * @param {string} val
 * @returns `true` if the input string parses to an integer, and `false` otherwise
 */
function isInteger(val) {
  if (!/^-?\d+$/.test(val)) return false;
  let intVal = parseInt(val);
  return parseFloat(val) === intVal && !isNaN(intVal);
}

/**
 * @param {string} dateStr
 * @returns The date `string` if the input matches a date format, or `null`
 */
function parseDate(dateStr) {
  const parsedDate = dateStr.match(/[0-3][0-9][./-][0-1][0-9][./-][0-9][0-9]/); // Matches the UK date locale
  return parsedDate ? parsedDate[0] : null;
}

/**
 * @param {string} timeStr
 * @returns The time `string` if the input parses to a specific time, otherwise `null`
 */
function parseTime(timeStr) {
  const parsedTime = timeStr.match(/[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/);
  return parsedTime ? parsedTime[0] : null;
}

/**
 * Checks whether the input string is the price of an item
 * @param {string} str
 * @returns The price, if the input string can be parsed into a float or null
 */
function checkPrice(str) {
  let pr = str.includes(" ") ? str.split(" ")[0] : str;
  pr.replace("A", "").replace("B", "");
  return /^[£-]*\d+[.]\d{2}$/.test(pr) ? pr : null;
}

/**
 * Checks whether the given string is a name of a market
 * @param {string} str
 * @returns Market name if the input string is a market, or null
 */
function checkMarket(str) {
  const mStr = str.toLowerCase().split(" ");
  for (const market of MARKETS) if (mStr.includes(market)) return market;

  if (
    (str[0] === "L" && str.substr(2, 2) === "DL" && str.length < 7) ||
    (str.substr(0, 3) === "LID" && str.length < 7) ||
    (str.substr(0, 3) === "LDL" && str.length < 6) ||
    str.substr(0, 4) === "LinL"
  )
    return "LIDL";
  return null;
}

/**
 * @param {string} str
 * @returns The annotation type of the input string
 */
function checkAnnotationType(str) {
  if (str[str.length - 1] === ",") return "hanging";
  if (parseDate(str)) return "date";
  if (parseTime(str)) return "time";
  if (checkMarket(str)) return "market";
  if (checkPrice(str)) return "number";
  if (isInteger(str)) return "int";
  return "text";
}

/**
 * @param {string} str
 * @returns `true` if the input string is a name of an item and `false` otherwise
 */
function checkItemName(str) {
  let numAlpha = 0;
  for (const ch of str) if (/[a-zA-Z]/.test(ch)) numAlpha++;
  return numAlpha > 2;
}

/**
 * @param {{x:number, y:number}[]} vertices
 * @returns The minimum and max `x` and `y` values of the given vertices
 */
function getMinMaxes(vertices) {
  return vertices.reduce(
    (a, c) => ({
      xmin: Math.min(c.x, a.xmin),
      xmax: Math.max(c.x, a.xmax),
      ymin: Math.min(c.y, a.ymin),
      ymax: Math.max(c.y, a.ymax),
    }),
    { xmin: 99999, xmax: 0, ymin: 99999, ymax: 0 }
  );
}
/* #endregion */

/**
 * Parses the Google Cloud Vision API's response.
 * @param {{locale: string, description: string, boundingPoly: {vertices: {x: number, y: number}[]}}[]} textAnnotations googleResponseJson.responses[0].textAnnotations
 * @returns {{date: string, market: string, items: {discount?: string, name: string, price: string}[], time: string, total: number}} An object of the dates, markets and items bought
 */
export function parseResponse(
  textAnnotations,
  debug = false,
  shortenDebugInfo = false
) {
  /* #region  Variables */
  let shortened = shortenDebugInfo;
  let date = null,
    time = null,
    market = null,
    items = [],
    parsedToY = 0,
    baseAnn = textAnnotations[0],
    minmaxes = getMinMaxes(baseAnn.boundingPoly.vertices),
    g_xmin = minmaxes.xmin,
    g_xmax = minmaxes.xmax,
    g_ymin = minmaxes.ymin,
    g_ymax = minmaxes.ymax,
    sortedAnnotations = textAnnotations.slice(1).sort((a, b) => {
      const aMinMax = getMinMaxes(a.boundingPoly.vertices);
      const bMinMax = getMinMaxes(b.boundingPoly.vertices);
      const tLineOverlap =
        Math.min(bMinMax.ymax - aMinMax.ymin, aMinMax.ymax - bMinMax.ymin) /
        Math.max(bMinMax.ymax - bMinMax.ymin, aMinMax.ymax - aMinMax.ymin);

      if (tLineOverlap < 0.4)
        return aMinMax.ymin < bMinMax.ymin
          ? -1
          : aMinMax.ymin > bMinMax.ymin
          ? 1
          : 0;

      return aMinMax.xmin < bMinMax.xmin
        ? -1
        : aMinMax.xmin > bMinMax.xmin
        ? 1
        : 0;
    }),
    currentName = "",
    currentPrice = null,
    skipThis = false,
    seenPrices = [],
    seenIndexes = [],
    annotation,
    type,
    lineHeight,
    currentPriceY,
    currentPriceX,
    isHanging,
    cDescription,
    cAnno,
    cMinMax,
    lineOverlap,
    cType,
    usedIdx = [],
    usedPr = [],
    cSkipThis = false;
  /* #endregion */

  for (let i = 0; i < sortedAnnotations.length; i++) {
    if (seenIndexes.includes(i) || seenPrices.includes(i)) continue;
    // if (i > 10) shortened = true;
    annotation = sortedAnnotations[i];
    skipThis = false;

    for (const stopword of STOPWORDS) {
      if (annotation.description.toLowerCase().split(" ").includes(stopword)) {
        if (debug && !shortened)
          console.log(`Stopping: "${annotation.description}"`);
        skipThis = true;
        i = sortedAnnotations.length;
        break;
      }
    }

    for (const skipword of SKIPWORDS) {
      if (annotation.description.toLowerCase().split(" ").includes(skipword)) {
        if (debug && !shortened)
          console.log(`Skipping: "${annotation.description}"`);
        currentName = "";
        skipThis = true;
        break;
      }
    }

    if (skipThis) continue;

    if (
      annotation.description === "L" &&
      sortedAnnotations[i + 1].description === "DL"
    ) {
      if (debug) console.log(`"L DL" type: market`);
      seenIndexes.push(i, i + 1);
      market = "LIDL";
      continue;
    }

    type = checkAnnotationType(annotation.description);
    if (debug) console.log(`"${annotation.description}" type: ${type}`);
    if (type === "date") {
      date = parseDate(annotation.description);
    } else if (type === "time") {
      time = parseTime(annotation.description);
    } else if (type === "market") {
      market = checkMarket(annotation.description);
    } /* if (type === "text" || type === "int") */ else {
      minmaxes = getMinMaxes(annotation.boundingPoly.vertices);
      let xmin = minmaxes.xmin,
        xmax = minmaxes.xmax,
        ymin = minmaxes.ymin,
        ymax = minmaxes.ymax;

      usedIdx = [];
      usedPr = [];

      if (xmax > g_xmax / 2 || (ymax + ymin) / 2 < parsedToY) continue;

      lineHeight = ymax - ymin;
      currentName += annotation.description;
      currentPrice = null;
      currentPriceY = 0;
      currentPriceX = 0;
      isHanging = false;
      cDescription = "";

      if (debug) console.log(`Comparing ${annotation.description}:`);
      for (let j = 0; j < sortedAnnotations.length; j++) {
        if (i === j) continue;
        cAnno = sortedAnnotations[j];
        cSkipThis = false;

        for (const stopword of STOPWORDS) {
          if (cAnno.description.toLowerCase().split(" ").includes(stopword)) {
            if (debug && !shortened)
              console.log(`  ${cAnno.description} (stopped)`);
            j = sortedAnnotations.length;
            cSkipThis = true;
            break;
          }
        }

        for (const skipword of SKIPWORDS) {
          if (cAnno.description.toLowerCase().split(" ").includes(skipword)) {
            cSkipThis = true;
            break;
          }
        }
        if (cSkipThis) continue;

        cMinMax = getMinMaxes(cAnno.boundingPoly.vertices);
        let cxmin = cMinMax.xmin,
          cxmax = cMinMax.xmax,
          cymin = cMinMax.ymin,
          cymax = cMinMax.ymax;

        if (cymax < ymin || cymin > ymax) {
          if (debug && !shortened)
            console.log(`  ${cAnno.description} (no overlap)`);
          continue;
        }

        lineOverlap =
          Math.min(cymax - ymin, ymax - cymin) /
          Math.max(cymax - cymin, ymax - ymin);
        if (lineOverlap < 0.4) {
          if (debug && !shortened)
            console.log(`  ${cAnno.description} (overlap too small)`);
          continue;
        }

        if (isHanging) {
          cDescription += cAnno.description;
          isHanging = false;
        } else cDescription = cAnno.description;

        cType = checkAnnotationType(cDescription);
        if (cType === "hanging") {
          isHanging = true;
          if (debug && !shortened) console.log(`  ${cDescription} (hanging)`);
          continue;
        }
        if (cType === "number") {
          if (cxmax < g_xmax * 0.75) {
            currentName += " " + cDescription;
            // Separate item price
            continue;
          }
          if (seenPrices.includes(j)) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (seen price)`);
            continue;
          }
          if (
            (cymax < ymin ||
              cymin > ymax ||
              cxmax < xmax ||
              cxmin < currentPriceX) &&
            (currentPrice || cymin > ymin + 2 * lineHeight)
          ) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (not price)`);
            continue;
          }

          if (currentPrice) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (maybe price)`);
            continue;
          }

          usedPr.push(j);
          currentPrice = checkPrice(cDescription);
          currentPriceY = cymin;
          currentPriceX = cxmin;
          parsedToY = Math.max(parsedToY, (cymax + cymin) / 2);
          if (debug) console.log(`  ${cDescription} (price)`);
        }
        if (cType === "text") {
          if (cxmax > g_xmax * 0.75) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (not an item)`);
            continue;
          }
          if (
            cymax < ymin ||
            cymin > ymax ||
            (currentPriceY > 0 && cymin > currentPriceY)
          ) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (text no overlap)`);
            continue;
          }
          usedIdx.push(j);
          parsedToY = Math.max(parsedToY, (cymax + cymin) / 2);
          currentName += /[A-Z0-9x£@]/.test(cDescription.charAt(0))
            ? " " + cDescription
            : cDescription;
          if (debug) console.log(`  ${currentName} (current name)`);
        }
        if (cType === "int") {
          if (cxmax > g_xmax * 0.75) {
            if (
              checkAnnotationType(sortedAnnotations[j + 1].description) ===
              "int"
            ) {
              cDescription += `.${sortedAnnotations[j + 1].description}`;
              let tempType = checkAnnotationType(cDescription);
              if (tempType === "number") {
                if (cxmax < g_xmax * 0.75) {
                  currentName += " " + cDescription;
                  // Single item cost
                  continue;
                }
                if (seenPrices.includes(j)) {
                  if (debug && !shortened)
                    console.log(`  ${cDescription} (seen price)`);
                  continue;
                }
                if (
                  (cymax < ymin ||
                    cymin > ymax ||
                    cxmax < xmax ||
                    cxmin < currentPriceX) &&
                  (currentPrice || cymin > ymin + 2 * lineHeight)
                ) {
                  if (debug && !shortened)
                    console.log(`  ${cDescription} (not price)`);
                  continue;
                }

                usedPr.push(j, j + 1);
                currentPrice = checkPrice(cDescription);
                currentPriceY = cymin;
                currentPriceX = cxmin;
                parsedToY = Math.max(parsedToY, (cymax + cymin) / 2);
                if (debug) console.log(`  ${cDescription} (price)`);
                continue;
              }
            }
          }
          if (
            cymax < ymin ||
            cymin > ymax ||
            (currentPriceY > 0 && cymin > currentPriceY)
          ) {
            if (debug && !shortened)
              console.log(`  ${cDescription} (text no overlap)`);
            continue;
          }
          usedIdx.push(j);
          parsedToY = Math.max(parsedToY, (cymax + cymin) / 2);
          currentName += " " + cDescription;
          if (debug) console.log(`  ${currentName} (current name)`);
        }
      }
      if (currentPrice) {
        seenPrices.push(...usedPr);
        seenIndexes.push(...usedIdx);
        if (debug && !shortened) console.log(`Seen indices: ${seenIndexes}`);
        skipThis = !checkItemName(currentName);
        if (!skipThis) {
          if (currentPrice.startsWith("-")) {
            const lastItem = items.pop();
            items.push({ ...lastItem, discount: currentPrice });
            if (debug)
              console.log(
                "\u001b[92m" +
                  `Updated ${lastItem.name}   ${lastItem.price}   Discount${currentPrice}` +
                  "\u001b[0m"
              );
          } else {
            items.push({
              name: currentName,
              price: currentPrice,
            });
            if (debug)
              console.log(
                "\u001b[32m" +
                  `Item: ${currentName}   ${currentPrice}` +
                  "\u001b[0m"
              );
          }
          currentName = "";
          currentPrice = null;
        }
      } else if (currentName.includes("@")) {
        seenIndexes.push(...usedIdx);
        const lastItem = items.pop();
        lastItem.name += `\n${currentName}`;
        items.push(lastItem);
        currentName = "";
        currentPrice = null;
      }
    }
  }

  return {
    date,
    market: market ?? "LIDL",
    items,
    time,
    total: items.reduce(
      (a, c) => a + parseFloat(c.price) + parseFloat(c.discount ?? 0),
      0
    ),
  };
}

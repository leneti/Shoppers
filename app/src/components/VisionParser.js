const MARKETS = ["LIDL", "TESCO"];
const SKIPWORDS = ["£", "x", "dundee", "vat", "no.", "copy"];
const STOPWORDS = ["visa", "trns", "mid", "tid", "prepaid", "sale"];

function isNumber(mNum, parsed = false) {
  return !isNaN(parsed ? mNum : parseFloat(mNum));
}

function isDecimal(mNum) {
  const f = parseFloat(mNum);
  return isNumber(f, true) && Math.round(f) !== f;
}

function isInteger(mNum) {
  const f = parseFloat(mNum);
  return isNumber(f, true) && Math.round(f) === f;
}

function parseDate(dateStr) {
  return dateStr.match(/[0-3][0-9][./-][0-1][0-9][./-][0-9][0-9]/); // Matches the UK date locale
}

function checkPrice(fieldVal) {
  let pr = fieldVal.includes(" ") ? fieldVal.split(" ")[0] : fieldVal;
  pr.replace("A", "").replace("B", "");
  return isDecimal(pr) ? pr : null;
}

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
  return false;
}

function checkAnnotationType(str) {
  if (str[str.length - 1] === ",") return "hanging";
  if (checkPrice(str)) return "number";
  if (parseDate(str)) return "date";
  if (isInteger(str)) return "int";
  if (checkMarket(str)) return "market";
  return "text";
}

function checkItemName(str) {
  let numAlpha = 0;
  for (const ch of str) if (/[a-zA-Z]/.test(ch)) numAlpha++;
  return numAlpha > 2;
}

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

/**
 * Parses the Google Cloud Vision API's response.
 * @param {string[]} textAnnotations googleResponseJson.responses[0].textAnnotations
 * @returns An object with three properties - {dates: string[], markets: string[], items: {name: string, price: string}[]}
 */
export function parseResponse(textAnnotations) {
  let dates = [],
    markets = [],
    items = [],
    parsedY = 0,
    baseAnn = textAnnotations[0],
    minmaxes = getMinMaxes(baseAnn.boundingPoly.vertices),
    g_xmin = minmaxes.xmin,
    g_xmax = minmaxes.xmax,
    g_ymin = minmaxes.ymin,
    g_ymax = minmaxes.ymax,
    sortedAnnotations = textAnnotations.slice(1),
    currentName = "",
    currentPrice = null,
    skipThis = false,
    seenPrices = [],
    seenIndexes = [],
    annotation,
    type,
    lineHeight,
    yCurrent,
    priceXCurrent,
    isHanging,
    pDescription,
    pAnn,
    pMinMax,
    lineOverlap,
    pType,
    usedIdx = [],
    usedPr = [],
    pSkipThis = false;

  for (let i = 0; i < sortedAnnotations.length; i++) {
    annotation = sortedAnnotations[i];
    skipThis = false;

    for (const stopword of STOPWORDS) {
      if (annotation.description.toLowerCase().split(" ").includes(stopword)) {
        skipThis = true;
        i = sortedAnnotations.length;
        break;
      }
    }

    for (const skipword of SKIPWORDS) {
      if (annotation.description.toLowerCase().split(" ").includes(skipword)) {
        currentName = "";
        skipThis = true;
        break;
      }
    }

    if (skipThis) continue;

    type = checkAnnotationType(annotation.description);
    console.log(`"${annotation.description}" type: ${type}`); // TO-REMOVE
    if (type === "date") {
      dates.push(parseDate(annotation.description));
    } else if (type === "market") {
      markets.push(checkMarket(annotation.description));
    } else if (type === "text") {
      minmaxes = getMinMaxes(annotation.boundingPoly.vertices);
      let xmin = minmaxes.xmin,
        xmax = minmaxes.xmax;
      let ymin = minmaxes.ymin,
        ymax = minmaxes.ymax;

      if (xmax > g_xmax / 2) continue;
      if ((ymax + ymin) / 2 < parsedY) continue;

      lineHeight = ymax - ymin;
      currentPrice = null;
      currentName += annotation.description;
      yCurrent = 0;
      priceXCurrent = 0;
      isHanging = false;
      pDescription = "";

      for (let j = 0; j < sortedAnnotations.length; j++) {
        if (i === j) continue;
        pAnn = sortedAnnotations[j];
        pSkipThis = false;
        for (const skipword of [...SKIPWORDS, ...STOPWORDS])
          if (pAnn.description.toLowerCase().split(" ").includes(skipword))
            pSkipThis = true;
        if (pSkipThis) continue;
        pMinMax = getMinMaxes(pAnn.boundingPoly.vertices);
        let p_xmin = pMinMax.xmin,
          p_xmax = pMinMax.xmax;
        let p_ymin = pMinMax.ymin,
          p_ymax = pMinMax.ymax;
        if (p_ymax < ymin || p_ymin > ymax) continue;
        lineOverlap =
          Math.min(p_ymax - ymin, ymax - p_ymin) /
          Math.max(p_ymax - p_ymin, ymax - ymin);
        if (lineOverlap < 0.5) continue;
        if (isHanging) {
          pDescription += pAnn.description;
          isHanging = false;
        } else pDescription = pAnn.description;
        pType = checkAnnotationType(pDescription);
        if (pType === "hanging") {
          isHanging = true;
          continue;
        }
        if (pType === "number") {
          if (p_xmax < g_xmax / 2) continue;
          if (seenPrices.includes(j)) continue;
          if (
            p_ymax < ymin ||
            p_ymin > ymax ||
            p_xmax < xmax ||
            p_xmin < priceXCurrent
          )
            if (currentPrice || p_ymin > ymin + 2 * lineHeight) continue;
          yCurrent = p_ymin;
          usedPr.push(j);
          currentPrice = checkPrice(pDescription);
          priceXCurrent = p_xmin;
          parsedY = Math.max(parsedY, (p_ymax + p_ymin) / 2);
        }
        if (pType === "text") {
          if (p_xmax > g_xmax / 2) continue;
          if (
            p_ymax < ymin ||
            p_ymin > ymax ||
            (yCurrent > 0 && p_ymin > yCurrent)
          )
            continue;
          usedIdx.push(j);
          parsedY = Math.max(parsedY, (p_ymax + p_ymin) / 2);
          currentName += " " + pAnn.description;
        }
      }

      if (currentPrice) {
        seenPrices.push(usedPr);
        seenIndexes.push(usedIdx);
        skipThis = !checkItemName();
        if (!skipThis) {
          items.push({
            name: currentName,
            price: currentPrice,
          });
          currentName = "";
          currentPrice = null;
        }
      }
    } else {
      console.log(annotation);
    }
  }

  return { dates, markets, items };
}

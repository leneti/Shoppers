import { TRANSACTION_CATEGORIES } from "../config/constants";

/**
 * Parses the transaction information and makes an informed guess as to what to categorise the transaction as
 * @param {string[]} info "remittanceInformationUnstructuredArray" gotten from the transaction object
 * @returns {NodeRequire} A guess to the category of the transaction in the form of an icon
 */
export function guessImage(info) {
  let infoInOneStr = info.join().toLowerCase();

  for (let i = 0; i < TRANSACTION_CATEGORIES.length; i++) {
    let cat = TRANSACTION_CATEGORIES[i];
    for (let j = 0; j < cat.words.length; j++)
      if (infoInOneStr.includes(cat.words[j])) return cat.image;
  }

  return require("../../res/icons/048-bill.png");
}

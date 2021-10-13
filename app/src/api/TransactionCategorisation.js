const TRANSACTION_CATEGORIES = [
  {
    category: "medical",
    image: require("../../res/icons/022-medical-checkup.png"),
    words: ["dental", "medical", "care"],
  },
  {
    category: "groceries",
    image: require("../../res/icons/057-grocery.png"),
    words: [
      "lidl",
      "co-op",
      "tesco",
      "slavyanski",
      "morrison",
      "aldi",
      "wine stop",
      "maxima",
      "rimi",
      "blackness news",
      "best one",
      "sainsburys",
      "vynoteka",
      "vilniaus alus",
      "iki",
      "lituanica",
      "convenience",
    ],
  },
  {
    category: "flowers",
    image: require("../../res/icons/015-flower.png"),
    words: ["olly bobbins", "rosebud"],
  },
  {
    category: "bars",
    image: require("../../res/icons/047-food-tray.png"),
    words: [
      "food",
      "brasserie",
      "gelateria",
      "cafe",
      "coffee",
      "bar",
      "maki ramen",
      "pizza",
      "mcdonald",
      "flight club",
      "alchemist",
      "bella italia",
      "raze",
      "hesburger",
      "ateik ateik",
      "kavine",
      "baras",
      "restoranas",
      "wolt",
      "sushi",
      "street foo",
      "dukes corner",
      "bistro",
      "mabela",
      "pret a manger",
      "wasabi",
      "deliveroo",
      "pantry",
      "lapop",
      "subway",
      "bennshank",
      "soulfull",
      "peacock",
    ],
  },
  {
    category: "flights",
    image: require("../../res/icons/036-travel.png"),
    words: ["ryanair", "wizzair", "jet2"],
  },
  {
    category: "commuting",
    image: require("../../res/icons/058-autonomous-car.png"),
    words: [
      "uber",
      "trainline",
      "coach",
      "bus ",
      "xplore",
      "west mids",
      "trains",
      "neste",
      "circle k",
      "perkela",
      "transport",
      "viada",
      "citybee",
      "bolt",
      "traukin",
      "orlen",
      "parkman",
    ],
  },
  {
    category: "savings",
    image: require("../../res/icons/060-wallet.png"),
    words: ["savings", "deposit"],
  },
  {
    category: "exchange",
    image: require("../../res/icons/055-cash-flow.png"),
    words: ["exchange"],
  },
  {
    category: "rent",
    image: require("../../res/icons/045-rent.png"),
    words: ["rent", "nuoma"],
  },
  {
    category: "services",
    image: require(`../../res/icons/061-idea.png`),
    words: [
      "google",
      "patreon",
      "klarna",
      "amazon prime",
      "plum",
      "moneybox",
      "voxi",
      "railcard",
      "fireship",
      "crunchy roll",
    ],
  },
  {
    category: "coffee",
    image: require("../../res/icons/002-bubble-tea-1.png"),
    words: ["starbucks", "cafe"],
  },
  {
    category: "shopping",
    image: require("../../res/icons/033-shopping-bags.png"),
    words: [
      "amznmktplace",
      "asos",
      "vapour",
      "vapor",
      "ebay",
      "royalsmoke",
      "cropp",
      "vision express",
      "prekyba",
      "parduotuve",
      "senukai",
      "valhyr",
      "skytech",
      "perfume",
      "rituals",
      "cosmetics",
    ],
  },
  {
    category: "ATM withdrawals",
    image: require("../../res/icons/044-atm.png"),
    words: ["cash", "atm"],
  },
  {
    category: "transfers",
    image: require("../../res/icons/053-payment.png"),
    words: ["to "],
  },
];

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

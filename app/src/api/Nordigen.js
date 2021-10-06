import { NORDIGEN_TOKEN } from "../config/secret";
import firebase from "firebase/app";
import * as Linking from "expo-linking";

const transactionDays = 365;
export const TEST = false;

/**
 * Creates an end-user agreement
 * @param {String} transaction_total_days Max number of days of transactions the bank allows
 * @param {String} aspsp_id ID of bank
 * @returns {Promise<{id: String, created: String, accepted: null, max_historical_days: number, access_valid_for_days: number, enduser_id: String, aspsp_id: String}>}
 */
export const createEUA = async (transaction_total_days, aspsp_id) => {
  const userUuid = require("uuid-by-string")(
    firebase.auth().currentUser.uid,
    3
  );
  if (!userUuid) return;
  try {
    const response = await fetch(
      "https://ob.nordigen.com/api/agreements/enduser/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
        body: JSON.stringify({
          max_historical_days: TEST
            ? 90
            : Math.min(transactionDays, parseInt(transaction_total_days)),
          enduser_id: userUuid,
          aspsp_id: TEST ? "SANDBOXFINANCE_SFIN0000" : aspsp_id,
        }),
      }
    );
    const eua = await response.json();
    return eua;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Creates a requisition
 * @param {String} eua_id ID of EUA
 * @param {String} redirect path to app link
 * @returns {Promise<{id: String, redirect: String, status: "CR"|"LN"|"SU", agreements: String[], accounts: [], reference: String, enduser_id: String, user_language: Sring}>}
 */
export const createREQ = async (eua_id, redirect = Linking.makeUrl()) => {
  const userUuid = require("uuid-by-string")(
    firebase.auth().currentUser.uid,
    3
  );
  if (!userUuid) return;
  try {
    const response = await fetch("https://ob.nordigen.com/api/requisitions/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${NORDIGEN_TOKEN}`,
      },
      body: JSON.stringify({
        redirect,
        reference: `req-${userUuid}`,
        enduser_id: userUuid,
        agreements: [eua_id],
        user_language: "EN",
      }),
    });
    const requisition = await response.json();
    return requisition;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Creates an initiation link
 * @param {String} req_id ID of requisition
 * @param {String} aspsp_id ID of bank
 * @returns {Promise<{initiate: URL}>}
 */
export const createLINK = async (req_id, aspsp_id) => {
  const userUuid = require("uuid-by-string")(
    firebase.auth().currentUser.uid,
    3
  );
  if (!userUuid) return;
  try {
    const response = await fetch(
      `https://ob.nordigen.com/api/requisitions/${req_id}/links/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
        body: JSON.stringify({
          aspsp_id: TEST ? "SANDBOXFINANCE_SFIN0000" : aspsp_id,
        }),
      }
    );
    const link = await response.json();
    return link;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Gets all linked bank accounts
 * @param {String} req_id ID of requisition
 * @returns {Promise<{id: String, status: "CR"|"LN"|"SU", agreements: String[], accounts: String[], reference: String, enduser_id: String}>}
 */
export const listAccounts = async (req_id) => {
  try {
    const response = await fetch(
      `https://ob.nordigen.com/api/requisitions/${req_id}/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
      }
    );
    const acounts = await response.json();
    return acounts;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Gets the balance currently in the account
 * @param {String} account ID of account
 * @returns {Promise<{balances: {balanceAmount: {amount: String, currency: String}, balanceType: String}[]}>}
 */
export const getBalance = async (account) => {
  try {
    const response = await fetch(
      `https://ob.nordigen.com/api/accounts/${account}/balances/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
      }
    );
    const acounts = await response.json();
    return acounts;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Deletes the requisition specified by its ID
 * @param {String} req_id ID of requisition
 * @returns {Promise<{summary: String, detail: String, status_code?: number}>}
 */
export const deleteREQ = async (req_id) => {
  try {
    const response = await fetch(
      `https://ob.nordigen.com/api/requisitions/${req_id}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
      }
    );
    const delResult = await response.json();
    return delResult;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Deletes the last created requisition
 * @returns {Promise<{summary: String, detail: String, status_code?: number}>}
 */
export const deleteLastREQ = async () => {
  try {
    const resp1 = await fetch(`https://ob.nordigen.com/api/requisitions/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${NORDIGEN_TOKEN}`,
      },
    });
    const { results: reqs } = await resp1.json();

    for (const req of reqs) {
      if (req.id === "ad5d5f5e-a8bf-4652-bd5b-755159a25c39") continue;
      const response = await fetch(
        `https://ob.nordigen.com/api/requisitions/${req.id}/`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Token ${NORDIGEN_TOKEN}`,
          },
        }
      );
      const delResult = await response.json();
      return delResult;
    }
    return "No requisitions deleted";
  } catch (e) {
    console.warn(e);
    return null;
  }
};

/**
 * Retrieves the details for the account
 * @param {string} acc_id ID of account
 * @returns {Promise<{account: {currency: string, iban: string, ownerName: string, resourceId: string}}>}
 */
export const getDetails = async (acc_id) => {
  try {
    const response = await fetch(
      `https://ob.nordigen.com/api/accounts/${acc_id}/details`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Token ${NORDIGEN_TOKEN}`,
        },
      }
    );
    const acount = await response.json();
    return acount;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

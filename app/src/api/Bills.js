import AsyncStorage from "@react-native-async-storage/async-storage";
import { MONTHS } from "../config/constants";

/**
 * Calculates what day it is since the last payday
 * @param {number} day day to parse
 * @returns the day count in modulo of payday
 */
function getModuloDay(day, PAYDAY) {
  const dateObj = new Date();
  const daysInMonth = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth() + 1,
    0
  ).getDate();
  const toAddBeforeModulo = daysInMonth - PAYDAY;

  return (day + toAddBeforeModulo) % daysInMonth;
}

/**
 * Fetches any saved bills from local storage and returns them in an array
 * @returns {Promise<{category: String, dueDate: String, frequency: "Weekly"|"Monthly"|"Quarterly"|"Annually", id: String, name: String, paid: Boolean, price: String}[]>}
 */
export async function getBills() {
  try {
    const mBills = JSON.parse(await AsyncStorage.getItem("bills"));
    if (!mBills?.length) return [];

    const PAYDAY = parseInt((await AsyncStorage.getItem("payday")) ?? "1");

    const dateObj = new Date();
    const cday = dateObj.getDate();
    const cmonth = dateObj.getMonth();

    const updatedBills = mBills.map((bill) => {
      const billday = parseInt(bill.dueDate.split(" ")[0]);
      const paid = getModuloDay(cday, PAYDAY) >= getModuloDay(billday, PAYDAY);
      const dueDate = `${billday} ${
        MONTHS[cday >= PAYDAY && billday < PAYDAY ? cmonth + 1 : cmonth]
      }`;

      return { ...bill, paid, dueDate };
    });

    updatedBills.sort((a, b) =>
      a.paid === b.paid
        ? getModuloDay(parseInt(a.dueDate.split(" ")[0]), PAYDAY) -
          getModuloDay(parseInt(b.dueDate.split(" ")[0]), PAYDAY)
        : a.paid && !b.paid
        ? 1
        : -1
    );

    saveBillsToStorage(updatedBills);

    return updatedBills;
  } catch (e) {
    console.warn(e);
    return [];
  }
}

/**
 * Saves bills to local storage
 * @param {{category: String, dueDate: String, frequency: "Weekly"|"Monthly"|"Quarterly"|"Annually", id: String, name: String, paid: Boolean, price: String}[]} bills
 */
export async function saveBillsToStorage(bills) {
  try {
    return await AsyncStorage.setItem("bills", JSON.stringify(bills));
  } catch (error) {
    console.warn(error);
  }
}

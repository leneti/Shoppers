import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * When provided with an image uri, converts it to a Blob and uploads the image to Google's Firebase Storage.
 * @param {string} imageUri The uri of the image to be converted to a blob and uploaded.
 * @returns A Promise resolving to the URL the image is available at after completing the upload and the path it is saved at.
 */
export const uploadImage = async (imageUri) => {
  try {
    if (imageUri === "")
      throw Error(
        `Image not provided, rejecting empty string. Expeted {string}, got ${typeof imageUri}: ${imageUri}`
      );
    const storagePath = getPath(imageUri);
    const storageRef = ref(getStorage(), storagePath);
    const blob = await uriToBlob(imageUri);
    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);
    console.log(`Image uploaded to ${url}`);
    blob.close();
    return { url, path: storagePath };
  } catch (error) {
    console.error(error);
  }
};

/**
 * @param {string} uri The uri of an image
 * @returns The path to save the image at
 */
const getPath = (uri) => {
  const d = new Date();
  return `U-${d
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-")}--${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

/**
 * @param {string} uri The uri of an image
 * @returns A Promise resolving to a blob of the image
 */
const uriToBlob = (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = () => {
      reject(new Error("uriToBlob: Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

import * as ImagePicker from "expo-image-picker";

const imageOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.5, // [0 - 1] compression: smallest size -> best quality
};

export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (res.status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        throw new Error("Camera roll access permission denied");
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync(imageOptions);
    console.log(result);
    return result;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

export const takePicture = async () => {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    if (status !== "granted") {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (res.status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        throw new Error("Camera permission denied");
      }
    }
    const result = await ImagePicker.launchCameraAsync(imageOptions);
    console.log(result);
    return result;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

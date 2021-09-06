import * as ImagePicker from "expo-image-picker";

const imageOptions = () => ({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.5, // [0 - 1] compression: smallest size -> best quality
});

export const pickImage = async () => {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  let result;
  if (status !== "granted") {
    ImagePicker.requestMediaLibraryPermissionsAsync().then(async (res) => {
      if (res.status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return null;
      } else {
        result = await ImagePicker.launchImageLibraryAsync(imageOptions());
      }
    });
  } else {
    result = await ImagePicker.launchImageLibraryAsync(imageOptions());
  }

  console.log(result);
  console.log();
  return result;
};

export const takePicture = async () => {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  let result;
  if (status !== "granted") {
    ImagePicker.requestCameraPermissionsAsync().then(async (res) => {
      if (res.status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return null;
      } else {
        result = await ImagePicker.launchCameraAsync(imageOptions());
      }
    });
  } else {
    result = await ImagePicker.launchCameraAsync(imageOptions());
  }

  console.log(result);
  console.log();
  return result;
};

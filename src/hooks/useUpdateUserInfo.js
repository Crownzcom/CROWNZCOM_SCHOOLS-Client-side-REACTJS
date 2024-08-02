// useUpdateUserInfo.js
import storageUtil from "../utilities/storageUtil";

const useUpdateUserInfo = () => {
  const updateUserInfo = (updatedData) => {
    let userInfo = storageUtil.getItem("userInfo");

    // Update the userInfo with new details
    userInfo = { ...userInfo, ...updatedData };

    // Save the updated userInfo back to localStorage
    storageUtil.setItem("userInfo", userInfo);
  };

  return updateUserInfo;
};

export default useUpdateUserInfo;

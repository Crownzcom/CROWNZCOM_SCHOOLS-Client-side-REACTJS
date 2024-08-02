// storageUtil.js

const storageUtil = {
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  },

  getItem(key) {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null || serializedValue === "undefined") {
        // Item does not exist or is set to "undefined"
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing item from localStorage", error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  },
};

export default storageUtil;

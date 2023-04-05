function storage(STORAGE_NAME) {
  return {
    get() {
      const value = localStorage.getItem(STORAGE_NAME);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    save(value) {
      if (typeof value === 'object') value = JSON.stringify(value);
      localStorage.setItem(STORAGE_NAME, value);
    },
    remove() {
      localStorage.removeItem(STORAGE_NAME);
    }
  }
}


export const userInfo = storage("USERINFO")
export const auth = storage("AUTHORITY")
export const token = storage("TOKEN")
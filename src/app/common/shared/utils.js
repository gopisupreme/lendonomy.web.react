import utilsHelper from "app/common/services/utilsHelper";

export const checkUserSession = () => {};

export const parseBase64 = (value, form, type) => {
  if (!value) return value;
  form.change(type, utilsHelper.getImageType(value));
  return utilsHelper.stripBase64(value);
};

export class Storagehelper {
  static ACCESS_TOKEN = "okta_token";
  static USER_DATA = "okta_userdata";
  static TEMP_DATA = "temp_data";
  static USER_ROLE_CONFIG = "role_config"

  static getItem(name) {
    // return JSON.parse(sessionStorage.getItem(name));
    return JSON.parse(localStorage.getItem(name));
  }

  static setItem(name, value) {
    // sessionStorage.setItem(name, JSON.stringify(value));
    localStorage.setItem(name, JSON.stringify(value));
  }

  static setUserRole(name, value) {
    localStorage.setItem(name, value);
  }

  static getAccessToken() {
    return Storagehelper.getItem(Storagehelper.ACCESS_TOKEN);
  }
  static getUserData() {
    return Storagehelper.getItem(Storagehelper.USER_DATA);
  }
  static getTempData() {
    return Storagehelper.getItem(Storagehelper.TEMP_DATA);
  }
  static getUserRoleConfig() {
    return Storagehelper.getItem(Storagehelper.USER_ROLE_CONFIG);
  }
  static getDynamicData(Name,value) {
    return Storagehelper.getItem(Name);
  }

  static setAccessToken(value) {
    Storagehelper.setItem(Storagehelper.ACCESS_TOKEN, value);
  }
  static setUserData(value) {
    Storagehelper.setItem(Storagehelper.USER_DATA, value);
  }
  static setTempData(value) {
    Storagehelper.setItem(Storagehelper.TEMP_DATA, value);
  }
  static setUserRoleConfig(value) {
    Storagehelper.setUserRole(Storagehelper.USER_ROLE_CONFIG, value);
  }
  static setDynamicData(Name,value) {
    Storagehelper.setItem(Name, value);
  }

  static removeItem(name) {
    // sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  }

  static clearStorage() {
    // sessionStorage.clear();
    localStorage.clear();
  }
}

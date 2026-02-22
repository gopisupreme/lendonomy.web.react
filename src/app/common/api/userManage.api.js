import RestClient from "app/common/api/RestClient/RestClient";
import {
  defaultHeaders,
  otpRequestHeaders,
  getEndPoint,
} from "app/common/config/config";
import * as ApiConstants from "app/common/constants/api.constants";
import { Storagehelper } from "../shared/utils";

export function getUserManageData(payload) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${
    ApiConstants.ADMIN_USER
  }`;
  config.headers = defaultHeaders;
  config.data = payload;
  return RestClient.post(config).then((json) => json);
}

export function generateOtp() {
  const config = {};
  const accessHeader = {
    "x-access-key": Storagehelper?.getUserData()?.accessToken,
  };
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
    ApiConstants.CREATE_USER
  }`;
  config.headers = { ...defaultHeaders, ...accessHeader };
  return RestClient.put(config).then((json) => json);
}

export function editUserManageData(payload) {
  const config = {};
  const accessHeader = {
    "x-access-key": Storagehelper?.getUserData()?.accessToken,
  };
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${
    ApiConstants.ADMIN_USER
  }`;
  config.headers = { ...defaultHeaders, ...accessHeader };
  config.data = payload;
  return RestClient.put(config).then((json) => json);
}

export function createNewAdminUser(payload) {
  const config = {};
  const accessHeader = {
    "x-access-key": Storagehelper?.getUserData()?.accessToken,
  };
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
    ApiConstants.CREATE_USER
  }`;
  config.headers = { ...defaultHeaders, ...accessHeader };
  config.data = payload;
  return RestClient.post(config).then((json) => json);
}

export function deleteAdminUser(payload) {
  const config = {};
  const accessHeader = {
    "x-access-key": Storagehelper?.getUserData()?.accessToken,
  };
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${
    ApiConstants.ADMIN_USER
  }${ApiConstants.DELETE}`;
  config.headers = { ...defaultHeaders, ...accessHeader };
  config.data = payload;
  return RestClient.post(config).then((json) => json);
}

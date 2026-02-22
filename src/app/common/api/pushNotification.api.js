import RestClient from "app/common/api/RestClient/RestClient";
import {
  APICONFIG,
  defaultHeaders,
  getEndPoint,
} from "app/common/config/config";
import * as ApiConstants from "app/common/constants/api.constants";

export function getHistoryNotification(notifyData) {
  
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.NOTIFICATION
  }`;
  config.headers = defaultHeaders;
  config.data = notifyData;
  return RestClient.post(config).then((json) => json);
}

export function getTodayNotification(notifyData) {
  const {param} = notifyData;
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.NOTIFICATION
  }${param}`;
  config.headers = defaultHeaders;
  config.data = notifyData;
  return RestClient.post(config).then((json) => json);
}

export function reTriggerPushNotification(notifyData) {
  const { createdOn, urlQueryParam } = notifyData;
  
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.NOTIFICATION
  }${urlQueryParam}${createdOn}`;
  config.headers = defaultHeaders;
  config.data = notifyData;
  return RestClient.put(config).then((json) => json);
}

export function createNotification(notifyData) {
  
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.NOTIFICATION
  }`;
  config.headers = defaultHeaders;
  config.data = notifyData;
  return RestClient.put(config).then((json) => json);
}

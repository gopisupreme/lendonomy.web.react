import RestClient from 'app/common/api/RestClient/RestClient';
import {APICONFIG, defaultHeaders, getEndPoint} from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function loginCase(data) {
  console.log(APICONFIG);
  const config = {};
  const payload = Object.assign({}, data.payload);
  // config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${ApiConstants.LOGIN}`;
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
    ApiConstants.LOGIN
  }`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.post(config).then((json) => json);
}
export function logoutCase(data) {
  const HeaderParams = {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
  };
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
    ApiConstants.LOGOUT
  }`;
  config.data = HeaderParams;
  config.headers = defaultHeaders;
  return RestClient.post(config).then((json) => json);
}

export function getCountriesList(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}/countries`;
  // config.data = data;
  config.headers = defaultHeaders;
  return RestClient.get(config).then((json) => json);
}

export default {
  loginCase,
  logoutCase,
  getCountriesList,
};

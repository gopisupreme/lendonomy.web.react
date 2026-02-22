import RestClient from 'app/common/api/RestClient/RestClient';
import {APICONFIG, defaultHeaders, getEndPoint} from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function getHeartBeatCase() {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.HEALTH_CHECK
  }`;
  config.headers = defaultHeaders;
  return RestClient.get(config, false).then((json) => json);
}

export function getUpdateCase() {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${
    ApiConstants.HEALTH_CHECK
  }${ApiConstants.ONDEMAND}`;
  config.headers = defaultHeaders;
  return RestClient.get(config).then((json) => json);
}

export default {
  getHeartBeatCase,
  getUpdateCase,
};

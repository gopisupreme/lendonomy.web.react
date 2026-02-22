import RestClient from 'app/common/api/RestClient/RestClient';
import { APICONFIG, defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';


export function resendOtpCase(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${ApiConstants.LOGIN}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.post(config).then(json => json);
}

export default {
  resendOtpCase,
};

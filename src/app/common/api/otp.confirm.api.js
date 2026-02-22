import { APICONFIG, defaultHeaders,getEndPoint } from "app/common/config/config";
import * as ApiConstants from 'app/common/constants/api.constants';
import RestClient from 'app/common/api/RestClient/RestClient';


export function confirmOTPCase(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${ApiConstants.OTPCONFIRM}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.post(config).then(json => json);
}

export default {
  confirmOTPCase,
};

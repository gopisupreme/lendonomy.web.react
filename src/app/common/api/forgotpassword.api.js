import RestClient from 'app/common/api/RestClient/RestClient';
import {defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function triggerOtp(payload) {
    const config = {};
    config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
        ApiConstants.FORGOT
      }`;
    config.data = payload;
    config.headers = defaultHeaders;
    return RestClient.post(config, false).then((json) => json);
}

export function confirmPasswordCase(payload) {
    const config = {};
    config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AUTH}${
        ApiConstants.FORGOT
      }`;
    config.data = payload;
    config.headers = defaultHeaders;
    return RestClient.put(config, false).then((json) => json);
}

import {APICONFIG, defaultHeaders, getEndPoint} from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';
import RestClient from 'app/common/api/RestClient/RestClient';

export function GetNotificatioRiskyLoans(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISKPROMO}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.post(config).then((json) => json);
}

export function DownLoadActiveLoan(userid, loanId) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userid}/${loanId}${
    ApiConstants.DOWNLOAD_CONTRACT
  }`;
  config.headers = defaultHeaders;
  return RestClient.get(config).then((json) => json);
}

export function saveCollectionStatus(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISKPROMO}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export default {
  GetNotificatioRiskyLoans,
  DownLoadActiveLoan,
};

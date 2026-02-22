import RestClient from 'app/common/api/RestClient/RestClient';
import { APICONFIG, defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function getAnalyticsCase() {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.VIEW_STATS}`;
  config.headers = defaultHeaders;
  return RestClient.get(config, false).then((json) => json);
}
export default {
  getAnalyticsCase,
};

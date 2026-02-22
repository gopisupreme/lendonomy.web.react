import RestClient from 'app/common/api/RestClient/RestClient';
import { APICONFIG, defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';
import { Storagehelper } from '../shared/utils';

export function getAllAccountsListCase({ payload: { lastEvaluatedKey, lastRegisteredOn } }) {
  const config = {};
  // const payload = Object.assign({}, data.payload);
  const data = {
    "last-evaluated-key": lastEvaluatedKey,
    "last-registered-on": lastRegisteredOn,
  }
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.ACTIVE}`;
  config.headers = {...defaultHeaders, ...data};

  // if (lastEvaluatedKey) {
  //   config.headers["last-evaluated-key"] = lastEvaluatedKey;
  //   config.headers["last-registered-on"] = lastRegisteredOn;

  // } else {
  //   delete config.headers['last-evaluated-key'];
  // }
  
  return RestClient.get(config, false).then((json) => json);
}

export function getBlockedAccountsListCase({ payload: { lastEvaluatedKey, lastRegisteredOn } }) {
  const config = {};
  let data = {}
  if (!lastEvaluatedKey) {
   } else {
    data = {
    "last-evaluated-key": lastEvaluatedKey,
    "last-registered-on": lastRegisteredOn,
  }
  }
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.BLOCK}`;
  config.headers = {
    ...defaultHeaders,
    ...data
  };
  return RestClient.get(config).then((json) => json);
}

export function searchUsersCase(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.FILTER}`;
  config.headers = {
    "x-l-filter": encodeURI(data.search),
    "status": data.status === 'all' ? 'ACTIVE' : data.status,
    // "charset": "utf-8",
    // "content-type":"text/html",
  };
  if(data.id){
    config.headers["id"]= data.search;
  }
  return RestClient.get(config).then((json) => json);
}

export function doUpdateTrustScore(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.UPDATE_TRUSTSCORE}`;
  config.headers = {
    ...defaultHeaders
  };
  config.data=data;
  return RestClient.post(config, false, false).then((json) => json);
}

export function blockOrUnblockAccountCase(data) {
  const userData = Storagehelper.getUserData();
  const {userId, userName} = userData;
  const config = {};
  const payload = data;
  const {reason, userID} = payload;
  const accountType = payload.block ? ApiConstants.BLOCK : ApiConstants.UNBLOCK;
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}/${userID}${accountType}`;
  config.data = {
    reason: reason,
    id: userId,
    uname: userName
  };
  config.headers = {
    ...defaultHeaders
  };
  return RestClient.put(config).then((json) => json);
}

export function getProfileUser(id) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}/${id}/profile`;
  config.headers = {
    ...defaultHeaders
  };
  return RestClient.get(config).then((json) => json);
}
export function getDeletedListCase({ payload: { lastEvaluatedKey, lastRegisteredOn } }) {
  const config = {};
  let data = {}
  if (!lastEvaluatedKey) {
   } else {
    data = {
    "last-evaluated-key": lastEvaluatedKey,
    "last-registered-on": lastRegisteredOn,
  }
  }
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.DELETED}`;
  config.headers = {
    ...defaultHeaders,
    ...data
  };
  return RestClient.get(config).then((json) => json);
}

export function getReportedListCase(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.REPORTED_USER}`;
  config.headers = {
    ...defaultHeaders
  };
  config.data=data;
  return RestClient.post(config, false, false).then((json) => json);
}
export function getRecoverableListCase(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.USERS}${ApiConstants.RECOVERABLE_USER}`;
  config.headers = {
    ...defaultHeaders
  };
  config.data=data;
  return RestClient.get(config).then((json) => json);
}

export function deleteRecoverableUser(userId) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userId}${ApiConstants.DELETE}`;
  config.headers = {
    ...defaultHeaders
  };
  return RestClient.deleteList(config).then(json => json);
}

export default {
  getAllAccountsListCase,
  getBlockedAccountsListCase,
  searchUsersCase,
  blockOrUnblockAccountCase,
  getProfileUser,
  getDeletedListCase,
  getReportedListCase,
  getRecoverableListCase,
  deleteRecoverableUser
};

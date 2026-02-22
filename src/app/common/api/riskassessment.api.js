import RestClient from 'app/common/api/RestClient/RestClient';
import {
  APICONFIG,
  defaultApplicationHeaders,
  defaultHeaders,
  defaultTextHeaders,
  getEndPoint
} from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function getAmlUsers(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AML}`;
  config.headers = defaultHeaders;
  config.data = data;
  return RestClient.post(config).then((json) => json);
}

// export function blockAmluser(userId, data, reason) {
//   const config = {}
//   config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userId}${ApiConstants.BLOCK_AML}`
//   config.headers = { ...defaultHeaders, reason }
//   config.data = data
//   config.bypass = true
//   return RestClient.put(config).then((json) => json)
// }

// export function unblockAmluser(userId, data, reason) {
//   const config = {}
//   config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userId}${ApiConstants.UNBLOCK_AML}`
//   config.headers = { ...defaultHeaders, reason }
//   config.data = data
//   config.bypass = true
//   return RestClient.put(config).then((json) => json)
// }

export function updateAmlNotes(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AML}${ApiConstants.NOTES}`;
  config.headers = defaultHeaders;
  config.data = data;
  return RestClient.put(config).then((json) => json);
}

export function saveAmlUser(data) {
  const config = {};
  config.url = data.url;
  config.headers = defaultHeaders;
  config.data = data.payload;
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function getLendingRisk(searchvalue, lastuser, lastconsent) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.LENDING}`;
  config.headers = {...defaultHeaders, searchvalue, lastuser, lastconsent};
  return RestClient.get(config).then((json) => json);
}

export function updateLendingRiskNotes(userId, adminnotes, flaggedon) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.LENDING}/${userId}${ApiConstants.NOTES}`;
  config.headers = {...defaultHeaders, flaggedon, adminnotes};
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function revertConsent(userId, flaggedon) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.LENDING}/${userId}/revert`;
  config.headers = {...defaultHeaders, flaggedon};
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function getTransactionsRisk(
  status,
  searchValue,
  lastUser,
  lastFlagged,
  lastStatus,
  types = []
) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.TRANSACTIONS}`;
  config.headers = defaultHeaders;
  config.data = {
    status,
    searchValue,
    lastUser,
    lastFlagged,
    lastStatus,
    types,
  };
  return RestClient.post(config).then((json) => json);
}

export function resolveFlaggedUser(riskTransaction) {
  const config = [];
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.TRANSACTIONS}${ApiConstants.RESOLVE}`;
  config.headers = defaultHeaders;
  config.data = {...riskTransaction};
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function updateTransactionRiskNotes(riskTransaction) {
  const config = [];
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.TRANSACTIONS}`;
  config.headers = defaultHeaders;
  config.data = {...riskTransaction};
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function getClientRisk(
  status,
  searchValue,
  lastUser,
  lastFlagged,
  lastStatus,
  types = []
) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.CREDIT_SAFE}`;
  config.headers = defaultTextHeaders;
  config.data = {
    status,
    searchValue,
    lastUser,
    lastFlagged,
    lastStatus,
    types,
  };
  return RestClient.post(config).then((json) => json);
}

export function KYCDetails(
  search,
  onfidoStatus,
  adminStatus,
  lastOnfidoAID,
  lastCreatedOn
) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.KYC_Verify}`;
  config.headers = defaultTextHeaders;
  config.data = {
    search,
    onfidoStatus,
    adminStatus,
    lastOnfidoAID,
    lastCreatedOn,
  };
  return RestClient.post(config).then((json) => json);
}

export function SaveKYCDetails(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.KYC_Verify}`;
  config.headers = defaultTextHeaders;
  config.data = {...data};
  return RestClient.put(config).then((json) => json);
}

export function saveCreditRiskUser(data) {
  const config = {};
  config.url = data.url;
  config.headers = defaultApplicationHeaders;
  config.data = data.payload;
  return RestClient.put(config).then((json) => json);
}

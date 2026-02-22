import RestClient from 'app/common/api/RestClient/RestClient';
import {APICONFIG,defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function getPromoCodes(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}`;
  config.headers = {...defaultHeaders, ...data};
  return RestClient.get(config).then((json) => json);
}

export function getPromoCodesHistory(data) {
  console.log(data);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}${ApiConstants.HISTORY}`;
  config.headers = {...defaultHeaders, ...data};
  return RestClient.get(config).then((json) => json);
}

export function deletePromoCode(promoCode) {
  console.log(promoCode);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}`;
  config.headers = defaultHeaders;
  config.data = promoCode;
  return RestClient.delete(config).then((json) => json);
}

export function validatePromoCode(promoCode) {
  console.log(promoCode);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}${ApiConstants.VALIDATE}`;
  config.headers = defaultHeaders;
  config.data = promoCode;
  return RestClient.post(config).then((json) => json);
}

export function createPromoCode(promoCode) {
  console.log(promoCode);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}`;
  config.headers = defaultHeaders;
  config.data = promoCode;
  return RestClient.post(config).then((json) => json);
}

export function validateEditedPromo(promoCode) {
  console.log(promoCode);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}${ApiConstants.VALIDATE}`;
  config.headers = defaultHeaders;
  config.data = promoCode;
  return RestClient.put(config).then((json) => json);
}

export function updateEditedPromo(promoCode) {
  console.log(promoCode);
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.PROMO}`;
  config.headers = defaultHeaders;
  config.data = promoCode;
  return RestClient.put(config).then((json) => json);
}

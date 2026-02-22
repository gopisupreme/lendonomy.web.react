import RestClient from 'app/common/api/RestClient/RestClient';
import {APICONFIG,defaultHeaders,getEndPoint } from 'app/common/config/config';
import * as ApiConstants from 'app/common/constants/api.constants';

export function deleteComment(data) {
  const config = {};
  const payload = Object.assign({}, data);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.ARTICLE_COMMENTS}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export function getComments(id) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.ARTICLE_COMMENTS}/${id}/read`;
  config.headers = defaultHeaders;
  return RestClient.get(config).then((json) => json);
}

export function postArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.ARTICLE_CREATE}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.post(config).then((json) => json);
}

export function editContentArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.ARTICLE_UPDATE_CONTENT}`;
  config.data = payload;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export function getContents(status) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}/${status}`;
  config.headers = defaultHeaders;
  return RestClient.get(config).then((json) => json);
}

export function stageArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.UPDATE_STAGE}`;
  config.data = data;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export function deleteArticle(id, status) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.DELETE}/${id}/${status}`;
  config.headers = defaultHeaders;
  return RestClient.delete(config).then((json) => json);
}

export function draftArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.UPDATE_DRAFT}`;
  config.data = data;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export function publishArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.UPDATE_PUBLISH}`;
  config.data = data;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}
export function archivehArticle(data) {
  const config = {};
  const payload = Object.assign({}, data.payload);
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.UPDATE_ARCHIVE}`;
  config.data = data;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}
export function configTier(data) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.DISCOVER}${ApiConstants.UPDATE_CONFIG}`;
  config.data = data;
  config.headers = defaultHeaders;
  return RestClient.put(config).then((json) => json);
}

export function resetLendingConsent(userId) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userId}${ApiConstants.CONSENT}`;
  config.headers = defaultHeaders;
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}

export function PendingLoans(userId) {
  const config = {};
  config.url = `${getEndPoint()}${ApiConstants.ADMIN}/${userId}${ApiConstants.PENDING_LOAN}`;
  config.headers = defaultHeaders;
  config.bypass = true;
  return RestClient.get(config).then((json) => json);
}

export function CloseManually(data) {
  const config = {};
  config.url = `${getEndPoint()}/microloan/close-manually`;
  config.headers = defaultHeaders;
  config.data = data;
  config.bypass = true;
  return RestClient.put(config).then((json) => json);
}



export default {
  postArticle,
  getContents,
  editContentArticle,
  stageArticle,
  draftArticle,
  configTier,
  PendingLoans,
  CloseManually
};

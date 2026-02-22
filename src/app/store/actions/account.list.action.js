import * as AccountListActionTypes from "app/store/actionTypes/account.list.actionTypes";

export const getAllAccounts = (values = {}) => ({
  type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_REQUEST,
  payload: values,
});

export const getBlockedAccounts = (values = {}) => ({
  type: AccountListActionTypes.GET_BLOCKED_ACCOUNT_LIST_REQUEST,
  payload: values,
});

export const getUsersBySearch = (values = {}) => ({
  type: AccountListActionTypes.GET_SEARCH_USER_REQUEST,
  payload: values,
});

export const blockOrUnblockAccount = (values = {}) => ({
  type: AccountListActionTypes.GET_BLOCK_OR_UNBLOCK_ACCOUNT_REQUEST,
  payload: values,
});

export const reloadProfile = (payload) => ({
  type: AccountListActionTypes.RELOAD_PROFILE,
  payload
});

export const updateTrustScore = (values = {}) => ({
  type: AccountListActionTypes.UPDATE_TRUST_SCORE,
  payload: values
});

export const getRecoverableAccounts = (values = {}) => ({
  type: AccountListActionTypes.GET_RECOVERABLE_ACCOUNT_REQUEST,
  payload: values,
});

export const getReportedAccounts = (values = {}) => ({
  type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_REQUEST,
  payload: values,
});

export const getDeletedAccounts = (values = {}) => ({
  type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_REQUEST,
  payload: values,
});

export const updateNavigatedFrom = (values = {}) => ({
  type: AccountListActionTypes.NAVIGATE_FROM,
  from: values,
});

export const navigationStateClear = (values = {}) => ({
  type: "NavigationState",
  TabNavigate: "",
});

export default {
  getAllAccounts,
  getBlockedAccounts,
  getUsersBySearch,
  blockOrUnblockAccount,
  updateNavigatedFrom,
};

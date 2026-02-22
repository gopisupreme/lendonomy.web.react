import * as types from "../actionTypes/account.list.actionTypes";
import { updateObject } from "../storeUtils";

const initialState = {
  activeUsersCount: 0,
  blockedUsersCount: 0,
  deletedUsersCount: 0,
  lastEvaluatedKey: null,
  recoverableUsersCount: 0,
  reportedUsersCount: 0,
  users: [],
  from: null,
  reloadProfile: false,
};

export default function (state = initialState, action) {
  let newState = {};
  switch (action.type) {
    case types.GET_ALL_ACCOUNT_LIST_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_ALL_ACCOUNT_LIST_SUCCESS:
      return updateObject(
        state,
        JSON.parse(JSON.stringify({ ...action.data, serverError: "" }))
      );

    case types.GET_ALL_ACCOUNT_LIST_ERROR:
      newState = Object.assign({}, state);
      newState.allAccountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_BLOCKED_ACCOUNT_LIST_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_BLOCKED_ACCOUNT_LIST_SUCCESS:
      return updateObject(
        state,
        JSON.parse(JSON.stringify({ ...action.data, serverError: "" }))
      );

    case types.GET_BLOCKED_ACCOUNT_LIST_ERROR:
      newState = Object.assign({}, state);
      newState.allAccountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_SEARCH_USER_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_SEARCH_USER__SUCCESS:
      newState = Object.assign({}, state);
      newState.allAccountList = JSON.parse(JSON.stringify(action.data)) || [];
      newState.serverError = "";
      return newState;

    case types.GET_SEARCH_USER__ERROR:
      newState = Object.assign({}, state);
      newState.allAccountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT__SUCCESS:
      newState = Object.assign({}, state);
      newState.accountList = action.data || [];
      newState.serverError = "";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT__ERROR:
      newState = Object.assign({}, state);
      newState.accountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT__SUCCESS:
      newState = Object.assign({}, state);
      newState.accountList = action.data || [];
      newState.serverError = "";
      return newState;

    case types.GET_BLOCK_OR_UNBLOCK_ACCOUNT__ERROR:
      newState = Object.assign({}, state);
      newState.accountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_RECOVERABLE_ACCOUNT_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_RECOVERABLE_ACCOUNT_SUCCESS:
      return updateObject(
        state,
        JSON.parse(JSON.stringify({ ...action.data, serverError: "" }))
      );

    case types.GET_RECOVERABLE_ACCOUNT_ERROR:
      newState = Object.assign({}, state);
      newState.allAccountList = [];
      newState.serverError = "Error";
      return newState;

    case types.GET_DELETED_ACCOUNT_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_DELETED_ACCOUNT_SUCCESS:
      return updateObject(
        state,
        JSON.parse(JSON.stringify({ ...action.data, serverError: "" }))
      );

    case types.UPDATE_TRUST_SCORE_ERROR:
      newState = Object.assign({}, state);
      newState.serverError = "Error";
      return newState;

    case types.UPDATE_TRUST_SCORE_SUCC:
      newState = Object.assign({}, state);
      newState.serverError = "";
      newState.reloadProfile = true;
      return newState;

    case types.GET_DELETED_ACCOUNT_ERROR:
      newState = Object.assign({}, state);
      newState.allAccountList = [];
      newState.serverError = "Error";
      return newState;

    case types.NAVIGATE_FROM:
      return updateObject(
        state,
        JSON.parse(JSON.stringify({ ...action.from }))
      );

    case types.RELOAD_PROFILE:
      return updateObject(state, { reloadProfile: action.payload });
    default:
      return state;
  }
}

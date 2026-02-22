// import Cookies from 'js-cookie';
import {
  blockOrUnblockAccountCase,
  doUpdateTrustScore,
  getAllAccountsListCase,
  getBlockedAccountsListCase,
  searchUsersCase,
} from "app/common/api/account.list.api";
import * as AccountListActionTypes from "app/store/actionTypes/account.list.actionTypes";
import { all, call, put, takeLatest } from "redux-saga/effects";

function* getAllAccountsList(action) {
  try {
    const appData = yield call(getAllAccountsListCase, action);
    const { data, error } = appData;
    const { error: userErr } = data;
    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_ERROR,
        data,
      });
    } else {
      yield put({
        type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_ERROR,
      error,
    });
  }
}

function* getBlockedAccountsList(action) {
  try {
    const appData = yield call(getBlockedAccountsListCase, action);
    const { data, error } = appData;
    const { error: userErr } = data;
    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.GET_BLOCKED_ACCOUNT_LIST_ERROR,
        data,
      });
    } else {
      yield put({
        type: AccountListActionTypes.GET_BLOCKED_ACCOUNT_LIST_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.GET_BLOCKED_ACCOUNT_LIST_ERROR,
      error,
    });
  }
}

function* getSearchUsersList(action) {
  try {
    const appData = yield call(searchUsersCase, action);
    const { data, error } = appData;
    const { error: userErr } = data;
    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.GET_SEARCH_USER__ERROR,
        data,
      });
    } else {
      yield put({
        type: AccountListActionTypes.GET_SEARCH_USER__SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.GET_SEARCH_USER__ERROR,
      error,
    });
  }
}

function* blockOrUnblockAccount(action) {
  try {
    const appData = yield call(blockOrUnblockAccountCase, action.payload);
    const { data, error } = appData;
    const { error: userErr } = data;
    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.GET_BLOCK_OR_UNBLOCK_ACCOUNT__ERROR,
        data,
      });
    } else {
      yield put({
        type: AccountListActionTypes.GET_BLOCK_OR_UNBLOCK_ACCOUNT__SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.GET_BLOCK_OR_UNBLOCK_ACCOUNT__ERROR,
      error,
    });
  }
}

function* updateTrustScore(action) {
  try {
    const appData = yield call(doUpdateTrustScore, action.payload);
    const { data, error } = appData;
    const { error: userErr } = data;

    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.UPDATE_TRUST_SCORE_ERROR,
        error,
      });
    } else {
      yield put({
        type: AccountListActionTypes.UPDATE_TRUST_SCORE_SUCC
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.UPDATE_TRUST_SCORE_ERROR,
      error,
    });
  }
}

function* getDeletedAccountsList(action) {
  try {
    const appData = yield call(getAllAccountsListCase, action);
    const { data, error } = appData;
    const { error: userErr } = data;
    if (error || userErr) {
      yield put({
        type: AccountListActionTypes.GET_ALL_ACCOUNT_LIST_ERROR,
        data,
      });
    } else {
      yield put({
        type: AccountListActionTypes.GET_DELETED_ACCOUNT_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AccountListActionTypes.GET_DELETED_ACCOUNT_ERROR,
      error,
    });
  }
}

export default function* AccountsListSaga() {
  yield all([
    takeLatest(AccountListActionTypes.UPDATE_TRUST_SCORE, updateTrustScore),
    takeLatest(
      AccountListActionTypes.GET_ALL_ACCOUNT_LIST_REQUEST,
      getAllAccountsList
    ),
    takeLatest(
      AccountListActionTypes.GET_BLOCKED_ACCOUNT_LIST_REQUEST,
      getBlockedAccountsList
    ),
    takeLatest(
      AccountListActionTypes.GET_SEARCH_USER_REQUEST,
      getSearchUsersList
    ),
    takeLatest(
      AccountListActionTypes.GET_BLOCK_OR_UNBLOCK_ACCOUNT_REQUEST,
      blockOrUnblockAccount
    ),
    takeLatest(
      AccountListActionTypes.GET_DELETED_ACCOUNT_REQUEST,
      getDeletedAccountsList
    ),
  ]);
}

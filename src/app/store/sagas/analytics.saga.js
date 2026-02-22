// import Cookies from 'js-cookie';
import { getAnalyticsCase } from 'app/common/api/analytics.api';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import * as AnalyticsTypes from '../actionTypes/analytics.actionTypes';

function* getAnalytics(action) {
  try {
    const appData = yield call(getAnalyticsCase, action);
    const { data } = appData;
    // const { error: userErr } = data;
    if (appData.status === 400) {
      yield put({
        type: AnalyticsTypes.GET_ANALYTICS_ERROR,
        data,
      });
    } else {
      yield put({
        type: AnalyticsTypes.GET_ANALYTICS_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: AnalyticsTypes.GET_ANALYTICS_ERROR,
      error,
    });
  }
}

export default function* AnalyticsSaaga() {
  yield all([
    takeLatest(AnalyticsTypes.GET_ANALYTICS_REQUEST, getAnalytics),
  ]);
}

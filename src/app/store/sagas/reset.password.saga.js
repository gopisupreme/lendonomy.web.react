// import Cookies from 'js-cookie';
import { resetPasswordCase } from 'app/common/api/reset.password.api';
import history from 'app/common/shared/history';
import { Storagehelper } from 'app/common/shared/utils';
import * as ResetActionTypes from 'app/store/actionTypes/reset.password.actionTypes';
import { all, call, put, takeLatest } from 'redux-saga/effects';

function* resetPassword(action) {
  try {
    const userName = action.payload.userName;

    const appData = yield call(resetPasswordCase, action);
    const { data } = appData;
    if (appData.status == 400) {
      yield put({
        type: ResetActionTypes.RESET_PASSWORD_ERROR,
        data,
      });
    } else {
      Storagehelper.setTempData(data);
      yield put({
        type: ResetActionTypes.RESET_PASSWORD_SUCCESS,
        data,
      });
      history.push({
        pathname: "/otp",
        state: { userName: userName },
      });
    }
  } catch (error) {
    yield put({
      type: ResetActionTypes.RESET_PASSWORD_ERROR,
      error,
    });
  }
}

export default function* ResetPasswordSaga() {
  yield all([
    takeLatest(ResetActionTypes.RESET_PASSWORD_REQUEST, resetPassword),
  ]);
}

import {confirmOTPCase} from 'app/common/api/otp.confirm.api';
import history from 'app/common/shared/history';
import {Storagehelper} from 'app/common/shared/utils';
import * as OTPConfirmActionTypes from 'app/store/actionTypes/otp.confirm.actionTypes';
import {all, call, put, takeLatest} from 'redux-saga/effects';
import {CLEAR_RESEND_OTP_STATE} from '../actionTypes/resend.otp.actionTypes';
import store from '../store';
import * as actions from '../../store/actions/app.action';

// import Cookies from 'js-cookie';
function* otpConfirm(action) {
  const userName = action.payload.userName;
  try {
    const appData = yield call(confirmOTPCase, action);
    const {data} = appData;
    // const { error: userErr } = data;
    if (appData.status === 400) {
      yield put({
        type: CLEAR_RESEND_OTP_STATE,
      });
      yield put({
        type: OTPConfirmActionTypes.OTP_CONFIRM_ERROR,
        data,
      });
    } else {
      const userData = Storagehelper.getTempData();
      store.dispatch(actions.showLoader());
      Storagehelper.setUserData(userData);
      Storagehelper.setAccessToken(userData.accessToken);
      Storagehelper.setUserRoleConfig(userData.config);
      Storagehelper.removeItem(Storagehelper.TEMP_DATA);
      setTimeout(() => {
        store.dispatch(actions.hideLoader());
        history.push({
          pathname: '/admin/account',
          state: {userName: userName},
        });
      }, 5000);

      yield put({
        type: OTPConfirmActionTypes.OTP_CONFIRM_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: CLEAR_RESEND_OTP_STATE,
    });
    yield put({
      type: OTPConfirmActionTypes.OTP_CONFIRM_ERROR,
      error,
    });
  }
}

export default function* OTPConfirmSaga() {
  yield all([
    takeLatest(OTPConfirmActionTypes.OTP_CONFIRM_REQUEST, otpConfirm),
  ]);
}

import { resendOtpCase } from "app/common/api/resend.otp.api";
import history from "app/common/shared/history";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { CLEAR_OTP_DATA } from "../actionTypes/otp.confirm.actionTypes";

import * as ResendOTPTypes from "../actionTypes/resend.otp.actionTypes";

// import Cookies from 'js-cookie';
function* resendOtp(action) {
  try {
    const appData = yield call(resendOtpCase, action);
    const { data } = appData;
    if (appData.status == 400) {
      yield put({
        type: CLEAR_OTP_DATA,
      });
      yield put({
        type: ResendOTPTypes.RESEND_OTP_ERROR,
        data,
      });
    }
    // else {
    //   yield put({
    //     type: ResendOTPTypes.RESEND_OTP_SUCCESS,
    //     data,
    //   });
    //           history.push({
    //             pathname: "/otp",
    //             state: { userName: userName },
    //           });
    //   }
  } catch (error) {
    yield put({
      type: CLEAR_OTP_DATA,
    });
    yield put({
      type: ResendOTPTypes.RESEND_OTP_ERROR,
      error,
    });
  }
}

export default function* ResendOtpSaaga() {
  yield all([takeLatest(ResendOTPTypes.RESEND_OTP_REQUEST, resendOtp)]);
}

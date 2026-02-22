import * as OTPActionTypes from '../actionTypes/otp.confirm.actionTypes';

export const confirmOTPRequest = (values = {}) => ({
  type: OTPActionTypes.OTP_CONFIRM_REQUEST,
  payload: values
});

export const clearOTPState = () => ({
  type: OTPActionTypes.CLEAR_OTP_DATA
});

export default {
    confirmOTPRequest,
    clearOTPState
};
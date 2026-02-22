import * as ResendOtpActionTypes from '../actionTypes/resend.otp.actionTypes';

export const resendOtp = (values = {}) => ({
  type: ResendOtpActionTypes.RESEND_OTP_REQUEST,
  payload: values
});

export const clearResendOtp = () => ({
  type: ResendOtpActionTypes.CLEAR_RESEND_OTP_STATE
});

export default {
  resendOtp,
  clearResendOtp
};

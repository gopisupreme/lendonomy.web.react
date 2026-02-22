import * as types from '../actionTypes/resend.otp.actionTypes';

export default function (state = {}, action) {
  let newState = {};
  switch (action.type) {
    case types.RESEND_OTP_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.RESEND_OTP_SUCCESS:
      newState = Object.assign({}, state);
      newState.userData = action.data || {};
      newState.serverError = "";
      return newState;

    case types.RESEND_OTP_ERROR:
      newState = Object.assign({}, state);
      newState.error = action.data;
      return newState;

    case types.CLEAR_RESEND_OTP_STATE:
      newState = Object.assign({}, state);
      newState.serverError = '';
      newState.error = null;
      return newState;
    default:
      return state;
  }
}

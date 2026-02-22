import * as types from '../actionTypes/otp.confirm.actionTypes';

export default function (state = {TabNavigate: ''}, action) {
  let newState = {};
  switch (action.type) {
    case types.OTP_CONFIRM_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = '';
      return newState;

    case types.OTP_CONFIRM_SUCCESS:
      newState = Object.assign({}, state);
      newState.serverError = '';
      return newState;

    case types.OTP_CONFIRM_ERROR:
      newState = Object.assign({}, state);
      newState.serverError = 'Error';
      newState.error = action.data;
      return newState;

    case types.CLEAR_OTP_DATA:
      newState = Object.assign({}, state);
      newState.serverError = '';
      newState.error = null;
      return newState;

    case 'NavigationState':
      newState = Object.assign({}, state);
      newState.TabNavigate = action.TabNavigate
      // action.TabNavigate;
      return newState;

    default:
      return state;
  }
}

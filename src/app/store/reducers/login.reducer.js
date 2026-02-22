import * as types from '../actionTypes/login.actionTypes';

export default function (state = {}, action) {
  let newState = {};
  switch (action.type) {
    case types.LOGIN_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = '';
      return newState;

    case types.LOGIN_SUCCESS:
      newState = Object.assign({}, state);
      newState.userData = action.data || {};
      newState.serverError = '';
      newState.error = '';
      return newState;

    case types.LOGIN_ERROR:
      newState = Object.assign({}, state);
      newState.error = action.data;
      return newState;

    case types.GET_COUNTRIES_LIST:
      newState = Object.assign({}, state);
      newState.CountryList = action.data;
      return newState;

    default:
      return state;
  }
}

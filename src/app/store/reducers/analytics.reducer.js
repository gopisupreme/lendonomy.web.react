import * as types from '../actionTypes/analytics.actionTypes';

export default function (state = {}, action) {
  let newState = {};
  switch (action.type) {
    case types.GET_ANALYTICS_REQUEST:
      newState = Object.assign({}, state);
      newState.serverError = "";
      return newState;

    case types.GET_ANALYTICS_SUCCESS:
      newState = Object.assign({}, state);
      newState.analytics = action.data || {};
      newState.serverError = "";
      return newState;

    case types.GET_ANALYTICS_ERROR:
      newState = Object.assign({}, state);
      newState.analytics = [];
      newState.serverError = "Error";
      return newState;

      default:
        return state;
    }
  }

import * as LoginActionTypes from '../actionTypes/login.actionTypes';

export const loginRequest = (values = {}) => ({
  type: LoginActionTypes.LOGIN_REQUEST,
  payload: values,
});
export const loginSucess = (values = {}) => ({
  type: LoginActionTypes.LOGIN_SUCCESS,
  payload: values,
});

export const GetCountries = (values = {}) => ({
  type: LoginActionTypes.GET_COUNTRIES,
});

export default {
  loginRequest,
  loginSucess,
  GetCountries,
};

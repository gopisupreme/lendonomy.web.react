import * as ResetActionTypes from '../actionTypes/reset.password.actionTypes';

export const resetPasswordRequest = (values = {}) => ({
  type: ResetActionTypes.RESET_PASSWORD_REQUEST,
  payload: values
});

export default {
    resetPasswordRequest,
};
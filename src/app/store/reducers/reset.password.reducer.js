import * as types from '../actionTypes/reset.password.actionTypes';

export default function (state = {}, action) {
    let newState = {};
    switch (action.type) {
        case types.RESET_PASSWORD_REQUEST:
            newState = Object.assign({}, state);
            newState.serverError ='';
            return newState;

        case types.RESET_PASSWORD_SUCCESS:
            newState = Object.assign({}, state);
            newState.userData = action.data || {};
            newState.serverError ='';
            return newState;

        case types.RESET_PASSWORD_ERROR:
            newState = Object.assign({}, state);
            newState.serverError ='';
            newState.error = action.data;
            return newState;

        default:
            return state;
    }
}

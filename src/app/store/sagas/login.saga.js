// import Cookies from 'js-cookie';
import {loginCase, getCountriesList} from 'app/common/api/login.api';
import history from 'app/common/shared/history';
import {Storagehelper} from 'app/common/shared/utils';
import * as LoginActionTypes from 'app/store/actionTypes/login.actionTypes';
import {all, call, put, takeLatest} from 'redux-saga/effects';
import contentAction from 'app/store/actions/Notification.list';

function* loginUser(action) {
  const userName = action.payload.userName;
  const password = action.payload.password;
  try {
    const appData = yield call(loginCase, action);
    const {data} = appData;

    if (appData.status === 400) {
      if (data.message === 'User must provide a new password') {
        // check User must provide a new password
        history.push({
          pathname: '/resetpassword',
          state: {userName: userName},
        });
      } else {
        yield put({
          type: LoginActionTypes.LOGIN_ERROR,
          data,
        });
      }
    } else {
      Storagehelper.setTempData({...data, password});
      yield put(contentAction.NotificationCount({status: data?.notification}));

      history.push({pathname: '/otp'});
      yield put({
        type: LoginActionTypes.LOGIN_SUCCESS,
        data,
      });
    }
  } catch (error) {
    yield put({
      type: LoginActionTypes.LOGIN_ERROR,
      error,
    });
  }
}

function* getCountries() {
  const appData = yield call(getCountriesList);
  if (appData.status === 200) {
    const {data} = appData;
    yield put({
      type: LoginActionTypes.GET_COUNTRIES_LIST,
      data,
    });
  }
}

export default function* LoginSaga() {
  yield all([
    takeLatest(LoginActionTypes.LOGIN_REQUEST, loginUser),
    takeLatest(LoginActionTypes.GET_COUNTRIES, getCountries),
  ]);
}

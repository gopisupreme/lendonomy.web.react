import {
  FETCH_API_MSG,
  SERVER_DOWN_MSG,
} from 'app/common/constants/api.constants';
import {checkUserSession} from 'app/common/shared/utils';
import {getToken} from 'app/common/config/config';
import * as actions from '../../../store/actions/app.action';
import store from '../../../store/store';
import history from 'app/common/shared/history';

const getURLWithParams = (config) => {
  const url = config.url;
  let queryParams = null;
  /* istanbul ignore else */
  if (config.queryParams) {
    queryParams = config.queryParams;
  }

  return queryParams ? `${url}?${queryParams}` : url;
};

const getValidErrors = (error, apiUrl) => {
  store.dispatch(actions.hideLoader());
  const errorDetails = error.response;
  if (errorDetails) {
    const {message, status, error: statusText} = errorDetails.data || {};

    return {error: true, statusText, status, message};
  }

  return {
    error: true,
    statusText: `${FETCH_API_MSG} ${apiUrl}`,
    status: 500,
    message: SERVER_DOWN_MSG,
  };
};

const handleError = (response, hideLoader = true) => {
  if (hideLoader) {
    store.dispatch(actions.hideLoader());
  }
  if (response.status === 401) {
    // handle 401
    store.dispatch(actions.hideLoader());
    history.push('/sessionout')
  }
 
  return response;
};

export default class RestClient {
  static get(config, showLoader = true) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);

    if (checkUserSession()) {
      return null;
    }

    if (showLoader) {
      dispatch(actions.showLoader());
    }
    config.headers.Authorization = getToken();

    return fetch(apiUrl, {
      method: 'GET',
      Authorization: getToken(),
      // credentials: "include",
      headers: config.headers,
    })
      .then((resp) => {
        return handleError(resp, showLoader);
      })
      .then((response) => {
        if (showLoader) {
          dispatch(actions.hideLoader());
        }
        const status = response.status;
        const statusText = response.statusText;

        return response
          .json()
          .then((json) => ({status, statusText, data: json}));
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static post(config, isFormData, showLoader = true) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);
    if (checkUserSession()) {
      return null;
    }

    if (showLoader) {
      dispatch(actions.showLoader());
    }
    config.headers.Authorization = getToken();
    return fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: isFormData ? config.data : JSON.stringify(config.data),
    })
      .then((resp) => {
        return handleError(resp, showLoader);
      })
      .then((response) => {
        if (showLoader) {
          dispatch(actions.hideLoader());
        }

        const status = response.status;
        const statusText = response.statusText;

        if (config?.bypass) {
          return {status, statusText, response};
        }

        return response
          .json()
          .then((json) => ({status, statusText, data: json}));
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static put(config) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);

    if (checkUserSession()) {
      return null;
    }

    dispatch(actions.showLoader());
    config.headers.Authorization = getToken();
    return fetch(apiUrl, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify(config.data),
    })
      .then((resp) => {
        return handleError(resp);
      })
      .then((response) => {
        dispatch(actions.hideLoader());
        const status = response?.status;
        const statusText = response?.statusText;

        if (config?.bypass) {
          return {status, statusText, response};
        }

        return response
          .json()
          .then((json) => ({status, statusText, data: json}))
          .catch((e) => ({status, statusText, data: "emptystring"}));
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static delete(config) { 
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);
    if (checkUserSession()) {
      return null;
    }

    dispatch(actions.showLoader());
    config.headers.Authorization = getToken();
    return fetch(apiUrl, {
      method: 'DELETE',
      headers: config.headers,
      // credentials: 'include',
      body: JSON.stringify(config.data),
    })
      .then((resp) => {
        return handleError(resp);
      })
      .then((response) => {
        dispatch(actions.hideLoader());
        const status = response.status;
        const statusText = response.statusText;

        return {status, statusText, response};
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }
  static deleteList(config) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);
    if (checkUserSession()) {
      return null;
    }

    dispatch(actions.showLoader());
    config.headers.Authorization = getToken();
    return fetch(apiUrl, {
      method: 'DELETE',
      headers: config.headers,
      body: JSON.stringify(config.data),
    })
      .then((resp) => {
        return handleError(resp);
      })
      .then((response) => {
        dispatch(actions.hideLoader());
        const status = response.status;
        const statusText = response.statusText;

        return response
          .json()
          .then((json) => ({status, statusText, response: json}));

        // return {status, statusText, response};
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static upload(config) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);
    if (checkUserSession()) {
      return null;
    }

    dispatch(actions.showLoader());
    config.headers.Authorization = getToken();
    return fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: config.formData,
    })
      .then((resp) => {
        return handleError(resp);
      })
      .then((response) => {
        return response.json();
      })
      .then((text) => {
        dispatch(actions.hideLoader());
        const status = text.status;
        const statusText = text.statusText;

        return {status, statusText, data: text};
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static getFile(config) {
    const {dispatch} = store;
    const apiUrl = getURLWithParams(config);
    config.headers.Authorization = getToken();
    if (checkUserSession()) {
      return null;
    }

    dispatch(actions.showLoader());
    return fetch(apiUrl, {
      method: 'GET',
      headers: config.headers,
    })
      .then((resp) => {
        return handleError(resp);
      })
      .then((response) => {
        dispatch(actions.hideLoader());
        const status = response.status;
        const statusText = response.statusText;
        return {status, statusText, response};
      })
      .catch((error) => {
        return getValidErrors(error, apiUrl);
      });
  }

  static setContext(context) {
    this.context = context;
    this.headers = context.headers;
  }
}

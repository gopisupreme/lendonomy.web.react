import { HIDE_LOADER, SHOW_LOADER } from '../actionTypes/app.actionTypes';
import { updateObject } from '../storeUtils';

const initialState = {
  showLoader: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SHOW_LOADER:
      return updateObject(state, { showLoader: true });
    case HIDE_LOADER:
      return updateObject(state, { showLoader: false });
    default:
      return state;
  }
};

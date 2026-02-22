import * as ContentActionType from 'app/store/actionTypes/content.actionTypes';
import { updateObject } from 'app/store/storeUtils';

const initialState = {
  articleLoading: false,
  article: {
    serverError: null,
    articlResp: {},
  },
  contentList: {},
};

export const contentReducer = (state = initialState, action) => {
  switch (action.type) {
    case `${ContentActionType.ADD_ARTICLE}_INIT`:
      return updateObject(state, { articleLoading: true });
    case `${ContentActionType.ADD_ARTICLE}_SUCCESS`:
      return updateObject(state, {
        article: action.payload,
        articleLoading: false,
      });
    case `${ContentActionType.ADD_ARTICLE}_FAILURE`:
      return updateObject(state, {
        article: action.payload,
        articleLoading: false,
      });
    case `${ContentActionType.CONTENT_LIST}_SUCCESS`:
      return updateObject(state, { contentList: action.payload });
    case `${ContentActionType.CONTENT_LIST}_FAILURE`:
      return updateObject(state, { contentList: action.payload });

    case `${ContentActionType.CONTENT_LIST}_SUCCESS`:
      return updateObject(state, { contentList: action.payload });
    case `${ContentActionType.CONTENT_LIST}_FAILURE`:
      return updateObject(state, { contentList: action.payload });

    case `${ContentActionType.EDIT_CONTENT_ARTICLE}_INIT`:
      return updateObject(state, { articleLoading: true });
    case `${ContentActionType.EDIT_CONTENT_ARTICLE}_SUCCESS`:
      return updateObject(state, {
        article: action.payload,
        articleLoading: false,
      });
    case `${ContentActionType.EDIT_CONTENT_ARTICLE}_FAILURE`:
      return updateObject(state, {
        article: action.payload,
        articleLoading: false,
      });
    default:
      return state;
  }
};

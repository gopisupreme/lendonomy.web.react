import * as ContentActionType from 'app/store/actionTypes/content.actionTypes';

const addArticle = (values = {}) => ({
  type: ContentActionType.ADD_ARTICLE,
  payload: values
});

const addArticleInit = (values) => ({
  type: `${ContentActionType.ADD_ARTICLE}_INIT`,
  payload: values
});

const addArticleSuccess = (values) => ({
  type: `${ContentActionType.ADD_ARTICLE}_SUCCESS`,
  payload: values
});

const addArticleFailure = (values) => ({
  type: `${ContentActionType.ADD_ARTICLE}_FAILURE`,
  payload: values
});

const editArticle = (values) => ({
  type: ContentActionType.EDIT_CONTENT_ARTICLE,
  payload: values
});
const editArticleInit = (values) => ({
  type: `${ContentActionType.EDIT_CONTENT_ARTICLE}_INIT`,
  payload: values
});

const editArticleSuccess = (values) => ({
  type: `${ContentActionType.EDIT_CONTENT_ARTICLE}_SUCCESS`,
  payload: values
});

const editArticleFailure = (values) => ({
  type: `${ContentActionType.EDIT_CONTENT_ARTICLE}_FAILURE`,
  payload: values
});

const getContentList = (values = {}) => ({
  type: ContentActionType.CONTENT_LIST,
  payload: values
});
const getPublishedContents = (values = {}) => ({
  type: ContentActionType.PUBLISHED_CONTENT_LIST,
  payload: values
});
const getPublishedContentsSucess = (values = {}) => ({
  type: `${ContentActionType.PUBLISHED_CONTENT_LIST}_SUCCESS`,
  payload: values
});
const getPublishedContentsFailure = (values = {}) => ({
  type: `${ContentActionType.PUBLISHED_CONTENT_LIST}_FAILURE`,
  payload: values
});

const getContentListSuccess = (values) => ({
  type: `${ContentActionType.CONTENT_LIST}_SUCCESS`,
  payload: values
});

const getContentListFailure = (values) => ({
  type: `${ContentActionType.CONTENT_LIST}_FAILURE`,
  payload: values
});


export default {
  addArticle,
  addArticleInit,
  addArticleSuccess,
  addArticleFailure,
  getContentList,
  getContentListSuccess,
  getContentListFailure,
  editArticle,
  editArticleInit,
  editArticleSuccess,
  editArticleFailure,
  getPublishedContents,
  getPublishedContentsSucess,
  getPublishedContentsFailure

};

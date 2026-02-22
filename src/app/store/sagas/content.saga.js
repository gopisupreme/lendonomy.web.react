// import Cookies from 'js-cookie';
import { editContentArticle, getContents, postArticle } from 'app/common/api/content.api';
import APP_CONST from 'app/common/constants/app.constant';
import history from 'app/common/shared/history';
import contentAction from 'app/store/actions/content.action';
import * as ContentActionType from 'app/store/actionTypes/content.actionTypes';
import { all, call, put, takeLatest } from 'redux-saga/effects';

function* addArticle(action) {
  try {
    yield put(contentAction.addArticleInit());
    const appData = yield call(postArticle, action);
    if (appData.error) {
      yield put(
        contentAction.addArticleFailure({
          serverError: appData.message,
          articlResp: null,
        })
      );
    } else {
      const articlResp = appData.data;
      yield put(
        contentAction.addArticleSuccess({
          serverError: null,
          articlResp: articlResp,
        })
      );
      if (
        articlResp &&
        articlResp.articleStatus === APP_CONST.CONTENT_STATUS.STAGGING
      ) {
        history.push("/admin/content/staging");
      }
      if (
        articlResp &&
        articlResp.articleStatus === APP_CONST.CONTENT_STATUS.DRAFT
      ) {
        history.push("/admin/content/draft");
      }
    }
  } catch (error) {
    yield put(
      contentAction.addArticleFailure({ serverError: "Internal Server Error" })
    );
  }
}

function* editArticle(action) {
  try {
    yield put(contentAction.editArticleInit());
    const appData = yield call(editContentArticle, action);
    if (appData.error) {
      yield put(
        contentAction.editArticleFailure({
          serverError: appData.message,
          articlResp: null,
        })
      );
    } else {
      const articlResp = appData.data;
      yield put(
        contentAction.editArticleSuccess({
          serverError: null,
          articlResp: articlResp,
        })
      );
      if (
        articlResp &&
        articlResp.articleStatus === APP_CONST.CONTENT_STATUS.STAGGING
      ) {
        history.push("/admin/content/staging");
      }
      if (
        articlResp &&
        articlResp.articleStatus === APP_CONST.CONTENT_STATUS.DRAFT
      ) {
        history.push("/admin/content/draft");
      }
    }
  } catch (error) {
    yield put(
      contentAction.editArticleFailure({ serverError: "Internal Server Error" })
    );
  }
}

function* getContentList(action) {
  try {
    const { status } = action.payload;
    const appData = yield call(getContents, status);
    if (appData.error) {
      yield put(
        contentAction.getContentListFailure({
          serverError: appData.message,
          articles: null,
        })
      );
    } else {
      yield put(
        contentAction.getContentListSuccess({
          serverError: null,
          articles: appData.data.articles,
        })
      );
    }
  } catch (error) {
    yield put(
      contentAction.getContentListFailure({
        serverError: "Internal Server Error",
      })
    );
  }
}

function* getPublishedContents(action) {
  try {
    const { status } = action.payload;
    const appData = yield call(getContents, status);
    if (appData.error) {
      yield put(
        contentAction.getContentListFailure({
          serverError: appData.message,
          articles: null,
        })
      );
    } else {
      yield put(
        contentAction.getContentListSuccess({
          serverError: null,
          publishedContents: appData.data.articles,
        })
      );
    }
  } catch (error) {
    yield put(
      contentAction.getContentListFailure({
        serverError: "Internal Server Error",
      })
    );
  }
}

export default function* ContentSaga() {
  yield all([
    takeLatest(ContentActionType.ADD_ARTICLE, addArticle),
    takeLatest(ContentActionType.CONTENT_LIST, getContentList),
    takeLatest(ContentActionType.PUBLISHED_CONTENT_LIST, getPublishedContents),
    takeLatest(ContentActionType.EDIT_CONTENT_ARTICLE, editArticle),
  ]);
}

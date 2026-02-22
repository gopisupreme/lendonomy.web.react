import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import * as _ from 'underscore';

import {
  getComments,
  deleteComment,
} from '../../../../../app/common/api/content.api';
import styles from './viewsstyles.module.scss';
import classNames from 'classnames';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import dayjs from 'dayjs';
import { COMMON_CONST, CONTENT_MANAGER_ARTCLE_COMMENTS_CONST } from 'app/common/constants/constant';

const ArticleComments = () => {
  const location = useLocation();

  const [state, setState] = useState({
    comments: [],
    showDeleteDialog: false,
    toBeDeletedComment: null,
  });

  useEffect(onload, []);

  function onload() {
    getComments(location.state.id).then((res) => {
      if (res.status === 200) {
        setState({
          ...state,
          comments: res.data,
        });
      }
    });
  }

  const onDelete = () => {
    deleteComment({...state.toBeDeletedComment, isDeleted: true}).then(
      (res) => {
        if (res.status === 200) {
          setState({
            ...state,
            showDeleteDialog: false,
            toBeDeletedComment: null,
            comments: _.clone(res.data),
          });
        } else {
          setState({
            ...state,
            showDeleteDialog: false,
            toBeDeletedComment: null,
          });
        }
      }
    );
  };

  const postedOnTemp = (rowData) => (
    <div>
      <p className={classNames(`m-0`, styles.comment)}>
        {dayjs(rowData.commentedOn).format('D MMMM YYYY')}
      </p>
      <p className={classNames(`m-0`, styles.comment, styles.comment_time)}>
        {dayjs(rowData.commentedOn).format('hh:mm:ss')}
      </p>
    </div>
  );

  const authorTemplate = (rowData) => (
    <p className={styles.comment}>{`${rowData.name} ${rowData.surname}`}</p>
  );

  const actionTemplate = (rowData) => (
    <div className="d-flex justify-content-end">
      <button
        disabled={rowData?.isDeleted}
        className={classNames('btn btn-danger btn-pill')}
        onClick={() =>
          setState({
            ...state,
            toBeDeletedComment: rowData,
            showDeleteDialog: true,
          })
        }
      >
        {COMMON_CONST.DELETE}
      </button>
    </div>
  );

  return (
    <div className="p-5">
      <h1 className="len-header-lg">{location.state.title}</h1>
      <p className="header-desc-text">{CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.ARTICLE_COMMENTS}</p>

      <div className="pt-3">
        <h5 className="len-header len-header-xxs bold mt-5 mb-5">{CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.COMMENTS}</h5>

        <div className="comments-table">
          <DataTable
            scrollHeight="400px"
            value={state.comments}
            scrollable={true}
            className={styles.ArtCmtDataTableStyle}
            emptyMessage={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.ARTICLE_TABLE_EMPTY_MSG}
          >
            <Column
              header={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.COMMENT_TEXT}
              field="comment"
              className={styles.ArtCmtColumnStyle}
              bodyClassName={styles.comment}
            />
            <Column
              header={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.AUTHOR}
              className={styles.ArtCmtAuthorColumnStyle}
              body={authorTemplate}
            />
            <Column
              header={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.POSTED_ON}
              sortable
              sortField="commentedOn"
              className={styles.ArtCmtPostedColumnStyle}
              body={postedOnTemp}
            />
            <Column header="" body={actionTemplate} />
          </DataTable>
        </div>
      </div>
      <ConfirmDialog
        visible={state.showDeleteDialog}
        header={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.DELETE_CONFIRM_DIALOG_HEADER}
        desc={CONTENT_MANAGER_ARTCLE_COMMENTS_CONST.DELETE_CONFIRM_DIALOG_SUB_TEXT}
        footer={
          <div className="text-left">
            <button className="btn btn-primary btn-pill" onClick={onDelete}>
              {COMMON_CONST.DELETE}
            </button>
            <button
              className="btn btn-dark btn-pill"
              onClick={() => setState({...state, showDeleteDialog: false})}
            >
              {COMMON_CONST.NEVER_MIND}
            </button>
          </div>
        }
        onHide={() => setState({...state, showDeleteDialog: false})}
      />
    </div>
  );
};

export default ArticleComments;

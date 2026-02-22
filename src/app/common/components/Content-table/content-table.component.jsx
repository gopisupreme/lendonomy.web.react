import { deleteArticle, draftArticle, stageArticle } from 'app/common/api/content.api';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import InfoDialog from 'app/common/components/Info-dialog/info-dialog.component';
import APP_CONST from 'app/common/constants/app.constant';
import { COMMON_CONST, CONTENT_TABLE_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import contentAction from 'app/store/actions/content.action';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './content-table.module.scss';
import UtilsHelper from 'app/common/services/utilsHelper';

const ContentTable = (props) => {
  const dispatch = useDispatch();
  const [articleList, setArticleList] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [doRefresh, setDoRefresh] = useState(false);
  const [articleLimit, setArticleLimit]=useState(10);
  const [pagination, setPagination] = useState({});
  let dt = useRef(null);
  const {
    contentList: { serverError, articles },
  } = useSelector((store) => store.content);
  useEffect(() => {
    setLoader(false);
    setArticleList(articles);
    console.log("articles", articles)
    let limit = Math.ceil(articles?.length / articleLimit)
        const pagination = {
          pages: [],
          count: articles?.length
        };
        for (let i = 1; i <= limit; i++) {
          pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false
          })
        }
        setPagination(pagination);
  }, [articles]);
  const history = useHistory();

  useEffect(() => {
    setLoader(true);
    setArticleList([]);
    dispatch(contentAction.getContentList({ status: props.type }));
    return () => {
      // console.log("contentList draft cleanup");
      //   setArticleList([]);
    };
  }, [doRefresh]);

  const onEdit = (rowData) => {
    // console.log('on edit rowdata',rowData);
    history.push({
      pathname: "/admin/content/edit",
      state: { rowData, from: "draft" },
    });
  };

  const onStage = (rowData) => {
    // console.log("on stage rowdata", rowData);
    rowData.articleStatus = APP_CONST.CONTENT_STATUS.STAGGING;
    // console.log("payload", rowData);
    stageArticle(rowData)
      .then((res) => {
        // console.log("Stage res", res);
        history.push({
          pathname: "/admin/content/staging",
        });
      })
      .catch((err) => {
        // console.log("Stage err res", err);
      });
  };

  const onDelete = (rowData) => {
    // console.log("on delete rowdata", rowData);
    deleteArticle(rowData.id, rowData.articleStatus)
      .then((res) => {
        // console.log("delete suc res",res);
        setDoRefresh(!doRefresh);
      })
      .catch((err) => {});
  };

  const draftActionTemplate = (rowData, column) => {
    return (
      <>
        <div className="d-flex justify-content-around align-items-center">
          <button
            className="btn btn-light btn-pill mr-3"
            onClick={() => onEdit(rowData)}
          >
            {COMMON_CONST.EDIT}
          </button>
          <button
            className="btn btn-primary btn-pill mr-3"
            onClick={() => onStage(rowData)}
          >
            {CONTENT_TABLE_CONST.STAGE}
          </button>
          <button
            className="btn btn-danger btn-pill mr-3"
            onClick={() => onDelete(rowData)}
          >
            {COMMON_CONST.DELETE}
          </button>
        </div>
      </>
    );
  };
  function onDraft(rowData) {
    // console.log("On archive", rowData);
    rowData.articleStatus = APP_CONST.CONTENT_STATUS.DRAFT;
    // console.log("payload", rowData);
    draftArticle(rowData)
      .then((res) => {
        // console.log("Stage res", res);
        history.push({
          pathname: "/admin/content/draft",
        });
      })
      .catch((err) => {
        // console.log("Stage err res", err);
      });
  }

  const archiveActionTemplate = (rowData, column) => {
    return (
      <>
        <div className="d-flex justify-content-around align-items-center ">
          <button
            onClick={() => onDraft(rowData)}
            className="btn btn-primary btn-pill mr-3"
          >
            {CONTENT_TABLE_CONST.DRAFT}
          </button>
          <button
            className="btn btn-danger btn-pill mr-3"
            onClick={() => onDelete(rowData)}
          >
            {COMMON_CONST.DELETE}
          </button>
        </div>
      </>
    );
  };

  const stagingActionTemplate = (rowData, column) => {
    return (
      <>
        <div className="d-flex justify-content-around align-items-center">
          <button className="btn btn-light btn-pill mr-3">{COMMON_CONST.EDIT}</button>
          <button
            className="btn btn-primary btn-pill mr-3"
            onClick={() => setConfirmVisible(true)}
          >
            {CONTENT_TABLE_CONST.PUBLISH}
          </button>
          <button className="btn btn-danger btn-pill mr-3">{CONTENT_TABLE_CONST.DRAFT}</button>
        </div>
      </>
    );
  };

  const ActionColumn = (type) => {
    switch (type) {
      case APP_CONST.CONTENT_STATUS.DRAFT:
        return (
          <Column
            body={draftActionTemplate}
            headerClassName={styles.actionDraftHeaderStyle}
            className={styles.actionDraftColumnStyle}
          />
        );
      case APP_CONST.CONTENT_STATUS.STAGING:
        return (
          <Column
            body={stagingActionTemplate}
            // headerStyle={{ width: "150px" }}
            // style={{ textAlign: "center" }}
            headerClassName={styles.actionDraftHeaderStyle}
            className={styles.actionDraftColumnStyle}
          />
        );
      case APP_CONST.CONTENT_STATUS.ARCHIVE:
        return (
          <Column
            body={archiveActionTemplate}
            headerClassName={styles.actionArchiveHeaderStyle}
            className={styles.actionDraftColumnStyle}
          />
        );
      default:
        return null;
    }
  };

  const footerTmpl = (
    <div className="text-left">
      <button
        className="btn btn-primary btn-pill"
        onClick={() => {}}
      >
        {CONTENT_TABLE_CONST.PUBLISH}
      </button>
      <button
        className="btn btn-dark btn-pill"
        onClick={() => {}}
      >
        {COMMON_CONST.NEVER_MIND}
      </button>
    </div>
  );

  const infoFooterTmpl = (
    <div className="text-center">
      <button
        className="btn btn-dark btn-pill"
        onClick={() => {}}
      >
        {COMMON_CONST.OKAY}
      </button>
    </div>
  );

  const infoDialogDesc = (
    <>
      <p className="mb-0">
        {CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_QUESTION}
      </p>
      <p className="mb-0">{CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_OPTION1}</p>
      <p className="mb-0">{CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_OPTION2}</p>
    </>
  );

  const onHideDialog = () => {
    setConfirmVisible(false);
  };

  const onInfoHideDialog = () => {
    setInfoVisible(false);
  };

  const dynamicColumns = () => {
    const dataTableColumns = [
      ...APP_CONST.CONTENT_TABLE.COMMON,
      ...APP_CONST.CONTENT_TABLE[props.type.toUpperCase()],
    ];
    const tableColumns = dataTableColumns.map((col, i) => {
      return (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          headerStyle={col.headerStyle}
          style={{textAlign:'center'}}
          body={col.body ? col.body : null}
        />
      );
    });
    return tableColumns;
  };
  const paginatorLeft = <button
  disabled
  className="btn btn-dark btn-pill mr-4"
  onClick={(e) => {
    console.log("blocked prev button")
    }}
>
  {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
</button>
const paginatorRight = <button
  disabled
  className="btn btn-dark btn-pill ml-4"
  onClick={(e) => {
    console.log("blocked Next button")
    }}
>
  {COMMON_CONST.NEXT_PAGE_BUTTON}
</button>

const onPageChange = (page, activeIndex) =>{
    dt.state.first = (page.page - 1) * articleLimit;
    const updatedPagination = {...pagination};
    updatedPagination.pages.map((page, index) => {
      page.active = index === activeIndex ? true : false;
    })
    setPagination(updatedPagination);
}
  return (
    <>
      <DataTable
        value={articleList}
        scrollHeight="400px"
        className={styles.dataTableStyle}
        scrollable={true}
        // loading={loader}
        paginator
        ref={(el) => dt = el}
        rows={articleLimit}
        emptyMessage={CONTENT_TABLE_CONST.CONTENT_TABLE_EMPTY_MSG}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        paginatorTemplate=" "
      >
        {dynamicColumns()}
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CONT_MANAGE_OVERVIEW) && ActionColumn(props.type)}
      </DataTable>
      <nav aria-label="..." className="ml-auto">
          <ul className="pagination moveRight">
            {
               articleList?.length?
                <>
                  {paginatorLeft}
                  {
                    pagination?.pages?.map((page, index) => {
                      let classes = "page-link pageNumbers";
                      if (page.active)
                        classes = classes + " activeGreen";
                      if (page.disabled)
                        classes = classes + " pageDisabled";
                      return (
                        <li 
                          key={page.page} 
                          className={`page-item mr-3 ${page.active && " activeGreen"}`}>
                            <span 
                              className={classes} 
                              onClick={e => !page?.disabled && onPageChange(page, index)}>
                                {page.displayPage}
                            </span>
                        </li>
                      )
                    })
                  }
                  {paginatorRight}
                </> : null
            }
          </ul>
        </nav>

      <ConfirmDialog
        visible={confirmVisible}
        header={CONTENT_TABLE_CONST.CONFIRM_DIALOG_HEADER}
        desc={CONTENT_TABLE_CONST.CONFIRM_DIALOG_HEADER_SUB_TEXT}
        footer={footerTmpl}
        onHide={onHideDialog}
      />

      <InfoDialog
        visible={infoVisible}
        header={CONTENT_TABLE_CONST.INFODIALOG_HEADER}
        desc={infoDialogDesc}
        footer={infoFooterTmpl}
        onHide={onInfoHideDialog}
      />
    </>
  );
};

export default ContentTable;

import classNames from "classnames";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import { clone } from "underscore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  COMMON_CONST,
  USER_ROLE_CONFIG_KEY,
  VIOLATION_REP_REV_COSNT,
} from "app/common/constants/constant";
import { useHistory } from "react-router-dom";

import styles from "./violation.module.scss";
import { ViolationDialog } from "./dialog/violation.dialog.component";
import { blockOrUnblockAccountCase } from "app/common/api/account.list.api";
import { getReportedListCase } from "app/common/api/account.list.api";
import UtilsHelper from "app/common/services/utilsHelper";
import { hideLoader, showLoader } from "app/store/actions/app.action";
import { useDispatch } from "react-redux";

dayjs.extend(utc);

const ReportedReview = ({ searchValue, setSearchValue }) => {
  const mounted = useRef(false);
  const preventSearch = useRef(false);
  const history = useHistory();
  let dt = useRef();
  const limit = useRef(20).current;
  const dataVisibilityTooltip = 15;

  const [endReached, setEndReached] = useState(false);
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [data, setData] = useState([]);

  const [prevConfig, setPrevConfig] = useState([]);
  const [config, setConfig] = useState({
    createdOn: null,
    reporteeId: null,
  });

  const [blockAction, setBlockAction] = useState({
    visible: false,
    actionType: "",
    currentIndex: 0,
    currentProfile: "",
    selectedItem: "",
  });
  const dispatch = useDispatch();

  useEffect(
    () =>
      onLoad({
        createdOn: null,
        reporteeId: null,
        status: "REPORTED_REVIEW",
      }),
    []
  );

  useEffect(onSearchChange, [searchValue]);

  function onSearchChange() {
    if (preventSearch.current) {
      return;
    }

    if (mounted.current) {
      setEndReached(false);
      setPages(0);
      setFirst(0);
      setPagination({
        pages: [],
        count: 0,
      });
      setPrevConfig(clone([]));
      setConfig({
        ...config,
        lastUser: 0,
        lastCreatedDate: 0,
      });

      onLoad({
        createdOn: null,
        reporteeId: null,
        status: "REPORTED_REVIEW",
        searchText: searchValue,
      });
    }
  }

  function onLoad(payload) {
    dt.current.state.rows = limit;
    dispatch(showLoader());
    getReportedListCase(payload).then((res) => {
      mounted.current = true;
      preventSearch.current = false;

      if (res.status !== 200) return;

      let length = Math.ceil(res?.data?.reports.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.reports.length,
      };

      for (let i = 1; i <= length; i++) {
        _pagination.pages.push({
          page: i,
          displayPage: i,
          active: i === 1 ? true : false,
        });
      }

      setPagination(_pagination);

      const _prevConfig = clone(prevConfig);
      _prevConfig.push(config);

      setPrevConfig(_prevConfig);

      if (res.data?.lastUser) {
        if (endReached) {
          setEndReached(false);
        }
        setConfig({
          ...config,
          createdOn: res.data.createdOn,
          reporteeId: res.data.reporteeId,
        });
      } else {
        setEndReached(true);
      }
      setData(clone(res.data.reports));
      dispatch(hideLoader());
    });
  }

  const onPageTransactions = (event) => {
    if (event.first > first) {
      dispatch(showLoader());
      getReportedListCase({
        createdOn: null,
        reporteeId: null,
        status: "REPORTED_REVIEW",
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        let count = Math.ceil(res?.data?.reports.length / limit);

        const _pagination = clone(pagination);

        _pagination["pages"] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + limit / 2;

          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled = index + 1 > count ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);

        setData(clone(res?.data?.reports));

        const _prevConfig = clone(prevConfig);
        _prevConfig.push(config);

        setPrevConfig(_prevConfig);

        if (res.data?.reporteeId) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            createdOn: res.data.createdOn,
            reporteeId: res.data.reporteeId,
          });
        } else {
          setEndReached(true);
        }
        dispatch(hideLoader());
      });
    }
    if (event.first < first) {
      dispatch(showLoader());
      const _prev = prevConfig[prevConfig.length - 2];
      getReportedListCase({
        createdOn: _prev.createdOn,
        reporteeId:_prev.reporteeId,
        status: "REPORTED_REVIEW",
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        let _pagination = clone(pagination);
        _pagination["pages"] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);

        setData(clone(res?.data?.reports));

        const _prevConfig = clone(prevConfig);
        _prevConfig.splice(_prevConfig.length - 1, 1);

        setPrevConfig(_prevConfig);

        if (res.data?.reporteeId) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            createdOn: res.data.createdOn,
            reporteeId: res.data.reporteeId,
          });
        } else {
          setEndReached(true);
        }
        dispatch(hideLoader());
      });
    }
  };

  const onPreviousPage = () => {
    const event = {
      first: first - limit,
      page: pages - 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageTransactions(event);
  };

  const onNextPage = () => {
    const event = {
      first: first + limit,
      page: pages + 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageTransactions(event);
  };

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee["active"] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
  };

  const paginatorLeft = (
    <button
      disabled={pagination.pages[0]?.displayPage === 1 ? true : false}
      className="btn btn-dark btn-pill mr-4"
      onClick={onPreviousPage}
    >
      {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
    </button>
  );

  const paginatorRight = (
    <button
      disabled={endReached}
      className="btn btn-dark btn-pill ml-4"
      onClick={onNextPage}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  const navigateToProfile = (e) => {
    if (!e) return;
    history.push({
      pathname: "/admin/account/induvidual",
      state: {
        userData: {
          userId: e,
        },
        showBlockUnBlock: true,
      },
    });
  };

  const blockAccount = (index, blockReason) => {
    if (blockReason.trim() === "") return;

    blockOrUnblockAccountCase({
      userID: blockAction.selectedItem.reporteeId,
      block: true,
      reason: blockReason,
    }).then((res) => {
      if (res.status === 200) {
        onLoad({
          createdOn: null,
          reporteeId: null,
          status: "REPORTED_REVIEW",
        });
      }
    });

    onHide();
  };

  const unBlockAccount = (index, unblockReason) => {
    if (unblockReason.trim() === "") return;

    blockOrUnblockAccountCase({
      userID: blockAction.selectedItem.reporteeId,
      block: false,
      reason: unblockReason,
    }).then((res) => {
      if (res.status === 200) {
        onLoad({
          createdOn: null,
          reporteeId: null,
          status: "REPORTED_REVIEW",
        });
      }
    });

    onHide();
  };

  const onHide = () => {
    setBlockAction({
      ...blockAction,
      visible: false,
    });
  };

  const onShow = (action, index, rowData) => {
    setBlockAction({
      ...blockAction,
      visible: true,
      actionType: action,
      currentIndex: index,
      currentProfile: rowData.profile
        ? `${rowData.profile.name} ${rowData.profile.surname} `
        : `${rowData.reporteeName} `,
      selectedItem: rowData,
    });
  };

  const actionTemplate = (rowData, column) => {
    let actionTemplate;
    let reporteeStatus = rowData.reporteeStatus === COMMON_CONST.USER_DELETED || rowData.reporteeStatus === COMMON_CONST.USER_HOLD
    if(!reporteeStatus){
    if (rowData.reporteeStatus === COMMON_CONST.USER_ACTIVE ) {
      actionTemplate = (
        <button
          onClick={(e) => onShow("Block", column.rowIndex, rowData)}
          className="btn btn-danger btn-pill"
        >
          {COMMON_CONST.BLOCK}
        </button>
      );
    } else {
      actionTemplate = (
        <button
          onClick={(e) => onShow("UnBlock", column.rowIndex, rowData)}
          className="btn btn-success btn-pill"
        >
          {COMMON_CONST.UNBLOCK}
        </button>
      );
    }
  }
    return actionTemplate;
  };

  return (
    <div>
      <DataTable
        value={data}
        emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
        scrollHeight="400px"
        scrollable={true}
        className={styles.reportReviewDataTableStyle}
        responsive
        paginator
        rows={searchValue === "" ? limit : data.length}
        totalRecords={data.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="createdOn"
        ref={dt}
        sortOrder={1}
      >
        <Column
          header=""
          headerClassName={styles.pepTableProfileHeaderStyle}
          body={(rowData) => (
            <>
              {rowData?.reporteeImg && (
                <img
                  className={styles.pepTableProfileImgStyle}
                  src={rowData.reporteeImg}
                />
              )}
            </>
          )}
        />
        <Column
          sortable
          field="reporteeName"
          header={VIOLATION_REP_REV_COSNT.USER_NAME}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableNameColumnStyle}
          body={(rowData) => (
            <div
              className={`${styles.pPoppins}`}
              onClick={(e) => navigateToProfile(rowData.reporteeId)}
            >
              {rowData?.reporteeName?.length >
              COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                <>
                  <p
                    className={"text-truncate mb-0"}
                    title={rowData.reporteeName}
                  >
                    {rowData.reporteeName}
                  </p>
                </>
              ) : (
                <>
                  <p className={"text-truncate mb-0"}>{rowData.reporteeName}</p>
                </>
              )}
            </div>
          )}
        />
        <Column
          field="reporteeTrustScore"
          header={COMMON_CONST.TRUSTSCORE}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => (
            <div className="d-flex flex-column">
              <p className="mb-0">{rowData.reporteeTrustScore}</p>
            </div>
          )}
        />
        <Column
          field="reporteeEmail"
          header={COMMON_CONST.CONTACTS}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => (
            <>
              {rowData.reporteeEmail.length > dataVisibilityTooltip ? (
                <div className="d-flex flex-column">
                  <p className="mb-0 text-truncate" title={rowData.reporteePhone}>
                    {rowData.reporteePhone}
                  </p>
                  <p
                    className={`mb-0 text-truncate ${styles.pepTableContactValueStyle}`}
                    title={rowData.reporteeEmail}
                  >
                    {rowData.reporteeEmail}
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column">
                  <p className="mb-0">{rowData.reporteePhone}</p>
                  <p
                    className={`mb-0 text-truncate ${styles.pepTableContactValueStyle}`}
                  >
                    {rowData.reporteeEmail}
                  </p>
                </div>
              )}
            </>
          )}
        />
        <Column
          header=""
          headerClassName={styles.pepTableProfileHeaderStyle}
          body={(rowData) => (
            <>
              {rowData?.reporterImg && (
                <img
                  className={styles.pepTableProfileImgStyle}
                  src={rowData.reporterImg}
                />
              )}
            </>
          )}
        />
        <Column
          sortable
          field="reporterName"
          header={VIOLATION_REP_REV_COSNT.REPORTED_BY}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableNameColumnStyle}
          body={(rowData) => (
            <div
              className={`${styles.pPoppins}`}
              onClick={(e) => navigateToProfile(rowData.reporterId)}
            >
              {rowData?.reporterName?.length >
              COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                <>
                  <p
                    className={"text-truncate mb-0"}
                    title={rowData.reporterName}
                  >
                    {rowData.reporterName}
                  </p>
                </>
              ) : (
                <>
                  <p className={"text-truncate mb-0"}>{rowData.reporterName}</p>
                </>
              )}
            </div>
          )}
        />

        <Column
          field="createdOn"
          header={VIOLATION_REP_REV_COSNT.REPORTED_DATE}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => (
            <div className="d-flex flex-column">
              <p className="mb-0">
                {dayjs.utc(rowData.createdOn).format("DD.MM.YYYY")}
              </p>
            </div>
          )}
          sortable
        />

        <Column
          header={COMMON_CONST.REVIEW}
          className={styles.creditRemarkTableColumnStyle}
          headerClassName={styles.creditRemarkTableHeaderStyle}
          body={(rowData) => (
            <div
              className={classNames(
                "form-control",
                styles.txtArea,
                "mr-3",
                styles.reasonTextAreaStyle
              )}
            >
              <div>
                <span
                  className={styles.reviewTextTitleStyle}
                >{`\"${rowData.reviewHeader}\"`}</span>
                <span className={styles.reviewTextBodyStyle}>
                  {" "}
                  - {rowData.reviewComments}
                </span>
              </div>
            </div>
          )}
        />
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.VIOLATION_BLK_UNBLK) && 
        <Column
          body={actionTemplate}
          headerClassName={styles.actionTemplateHeaderStyle}
          className={styles.actionTemplateColumnStyle}
        />
        }
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames("pagination", styles.moveRight)}>
          {
            pagination?.pages?.length > 0 &&
            <>
              {paginatorLeft}
              {pagination.pages?.map((page, index) => {
                let classes = classNames("page-link", styles.pageNumbers);
                if (page.active)
                  classes = classNames(
                    "page-link",
                    styles.pageNumbers,
                    styles.activeGreen
                  );
                if (page.disabled)
                  classes = classNames(
                    "page-link",
                    styles.pageNumbers,
                    styles.pageDisabled
                  );
                return (
                  <li
                    key={page.page}
                    className={`page-item mr-3 ${
                      (page.active && classNames(styles.activeGreen),
                      page.disabled && classNames(styles.pageDisabled))
                    }`}
                  >
                    <span
                      className={classes}
                      onClick={(e) =>
                        !page?.disabled && onPageChange(page, index)
                      }
                    >
                      {page.displayPage}
                    </span>
                  </li>
                );
              })}
              {paginatorRight}
            </>
          }
        </ul>
      </nav>
      <ViolationDialog
        block={blockAccount}
        unBlock={unBlockAccount}
        onHide={onHide}
        visible={blockAction.visible}
        action={blockAction.actionType}
        item={blockAction.selectedItem}
        currentIndex={blockAction.currentIndex}
        profile={blockAction.currentProfile}
      />
    </div>
  );
};

export default ReportedReview;

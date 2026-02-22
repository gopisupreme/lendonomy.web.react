import classNames from "classnames";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import { clone } from "underscore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getCountryPoint } from "app/common/config/config";
import { COMMON_CONST, USER_ROLE_CONFIG_KEY } from "app/common/constants/constant";
import * as _ from "underscore";
import { hideLoader, showLoader } from "app/store/actions/app.action";
import { useDispatch } from "react-redux";

import {
  getReportedListCase,
  getProfileUser,
} from "app/common/api/account.list.api";
import styles from "./violation.module.scss";
import { ViolationDialog } from "./dialog/violation.dialog.component";
import { blockOrUnblockAccountCase } from "app/common/api/account.list.api";
import { ACCOUNT_LIST_CONST } from "../../../common/constants/constant";
import UtilsHelper from "app/common/services/utilsHelper";

dayjs.extend(utc);

const ReportedLoan = ({ searchValue, setSearchValue }) => {
  const mounted = useRef(false);
  const preventSearch = useRef(false);
  let dt = useRef();
  const limit = useRef(20).current;

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

  const [reportUser, setRepUser] = useState({
    repUser: [],
  });

  useEffect(
    () =>
      onLoad({
        createdOn: null,
        reporteeId: null,
        status: "LOAN_PROCESS",
        getCount: true,
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
        createdOn: null,
        reporteeId: null,
      });

      onLoad({
        createdOn: null,
        reporteeId: null,
        status: "LOAN_PROCESS",
        searchText: searchValue,
        getCount: false,
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

      let length = Math.ceil(res?.data?.reports?.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.reports?.length,
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
      
      setData(clone(res.data?.reports));
      dispatch(hideLoader());
    });
  }

  const onPageTransactions = (event) => {
    if (event.first > first) {
      dispatch(showLoader());
      getReportedListCase({
        createdOn: null,
        reporteeId: null,
        status: "LOAN_PROCESS",
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

        if (res.data?.lreporteeId) {
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
        status: "LOAN_PROCESS",
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

  const blockAccount = (index, blockReason) => {
    if (blockReason.trim() === "") return;

    blockOrUnblockAccountCase({
      userID: blockAction.selectedItem.id,
      block: true,
      reason: blockReason,
    }).then((res) => {
      if (res.status === 200) {
        onLoad({
          createdOn: null,
          reporteeId: null,
          status: "LOAN_PROCESS",
        });
      }
    });

    onHide();
  };

  const unBlockAccount = (index, unblockReason) => {
    if (unblockReason.trim() === "") return;

    blockOrUnblockAccountCase({
      userID: blockAction.selectedItem.id,
      block: false,
      reason: unblockReason,
    }).then((res) => {
      if (res.status === 200) {
        onLoad({
          createdOn: null,
          reporteeId: null,
          status: "LOAN_PROCESS",
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
        : `${rowData.name} ${rowData.surname} `,
      selectedItem: rowData,
    });
  };

  const actionTemplate = (rowData, column) => {
    let actionTemplate;
    if (rowData.isActive) {
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
    return actionTemplate;
  };

  const reportedprofilePic = (rowData, column) => {
    return (
      <div className="row mr-0">
        <div className={classNames("pr-0", "col-sm-6")}>
          {rowData.picture && (
            <img
              className={styles.allAccountProfileImgStyle}
              src={rowData.picture}
            />
          )}
        </div>
        <div className={`col-sm-6 pr-0 pl-0 ${styles.pPoppins}`}>
          <div title={rowData && rowData.name + " " + rowData.surname}>
            <p
              className={`text-truncate text-left mb-0 ${classNames(
                styles.pPoppins
              )}`}
            >
              {rowData && rowData.name}
            </p>
            <p
              className={`text-truncate text-left mb-0 ${classNames(
                styles.pPoppins
              )}`}
            >
              {rowData && rowData.surname}
            </p>
          </div>
        </div>
      </div>
    );
  };

  async function getReportedAndReportee(rowData) {
    let updateRes = [];
    await getProfileUser(rowData.reporteeId)
      .then((res) => {
        if (res.status === 400) return;
        updateRes = JSON.parse(JSON.stringify(reportUser.repUser));
        res.data.id = rowData.reporteeId;
        updateRes.push(res.data);
      })
      .catch((err) => {});

    await getProfileUser(rowData.reporterId)
      .then((res) => {
        if (res.status === 400) return;
        updateRes = JSON.parse(JSON.stringify(updateRes));
        res.data.id = rowData.reporterId;
        updateRes.push(res.data);
        setRepUser({
          ...reportUser,
          repUser: updateRes,
        });
      })
      .catch((err) => {});
  }
  const reportedAccountTemplate = (rowData) => {
    const formated = dayjs(rowData.createdOn).format("DD-MM-YYYY");
    let user = [];
    const rowClick = () => {
      let removePrevData = _.clone(reportUser);
      removePrevData =
        removePrevData?.repUser?.length > 0 &&
        removePrevData.repUser.splice(0, removePrevData?.repUser?.length);
      setRepUser({
        ...reportUser,
        removePrevData,
      });
      const reportData = data;
      let makeApiCall = true;
      reportData.forEach((rep) => {
        if (rep.reportId === rowData.reportId) {
          makeApiCall = !rep.showTable;
          rep.showTable = !rep.showTable;
        } else {
          rep.showTable = false;
        }
        return rep;
      });
      console.log("test ", reportData);
      setData(reportData);
      if (makeApiCall) {
        getReportedAndReportee(rowData);
      }
    };

    const reporteeReporterHeader = (user, index) => {
      return (
        <div
          className={classNames(
            styles.reportUserWrapper,
            styles.tableHeader,
            styles.allReportUserAlign
          )}
        >
          <div
            className={classNames(
              styles.colProfile,
              styles.headerTextColor,
              styles.allReportNameHeaderStyle
            )}
          >
            {COMMON_CONST.NAME}
          </div>
          <div
            className={classNames(styles.colContacts, styles.headerTextColor)}
          >
            {COMMON_CONST.CONTACTS}
          </div>
          <div
            className={classNames(styles.colAmmount, styles.headerTextColor)}
          >
            {COMMON_CONST.AMOUNTS}
          </div>
          <div className={classNames(styles.dob, styles.headerTextColor)}>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {ACCOUNT_LIST_CONST.ACCOUNT}
            </p>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {ACCOUNT_LIST_CONST.CREATION}
            </p>
          </div>
          <div
            className={classNames(styles.trustScore, styles.headerTextColor)}
          >
            <p className={classNames(styles.pInter, "text-truncate")}>
              {ACCOUNT_LIST_CONST.TRUST}
            </p>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {ACCOUNT_LIST_CONST.SCORE}
            </p>
          </div>

          <div className={classNames(styles.loan, styles.headerTextColor)}>
            {COMMON_CONST.TRANSACTIONS}
          </div>
          <div className={classNames(styles.defaulted, styles.headerTextColor)}>
            {COMMON_CONST.DEFAULTS}
          </div>
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.VIOLATION_BLK_UNBLK) &&
          <div className={classNames(styles.action, styles.headerTextColor)}>
            {COMMON_CONST.BLOCK} & {COMMON_CONST.UNBLOCK}
          </div>
          }
        </div>
      );
    };

    const reporteeReporterProfile = (user, index) => {
      return (
        <div
          className={classNames(
            styles.reportUserWrapper,
            rowData?.borrowerId === user?.id ? styles.bor : styles.inv
          )}
        >
          <div className={classNames(styles.colProfile)}>
            {reportedprofilePic(user)}
          </div>
          <div className={classNames(styles.colContacts)}>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {user.phoneNumber}
            </p>
            {user.email?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
              <p
                className={classNames(styles.pInter, "text-truncate")}
                title={user.email}
              >
                {user.email}
              </p>
            ) : (
              <p className={classNames(styles.pInter, "text-truncate")}>
                {user.email}
              </p>
            )}
          </div>
          <div className={classNames(styles.colAmmount)}>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {user.totalAmountInvested} {getCountryPoint(true)}{" "}
              {COMMON_CONST.LENT}
            </p>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {user.totalAmountBorrowed} {getCountryPoint(true)}{" "}
              {COMMON_CONST.BORROWED}
            </p>
          </div>
          <div className={classNames(styles.dob)}>
            <p className={styles.pInter}>
              {dayjs(user.registeredOn).format("DD-MM-YYYY")}
            </p>
          </div>
          <div className={classNames(styles.trustScore)}>
            <p className={styles.pInter}>{user.trustScore}</p>
          </div>

          <div className={classNames(styles.loan)}>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {user.totalInvestmentsDone} {ACCOUNT_LIST_CONST.TIMES_LENT}
            </p>
            <p className={classNames(styles.pInter, "text-truncate")}>
              {user.totalLoansTaken} {ACCOUNT_LIST_CONST.TIMES_BORROWED}
            </p>
          </div>
          <div className={classNames(styles.defaulted)}>
            <p className={styles.pInter}>
              {user.totalDefaultedAsLender} {COMMON_CONST.DEFAULT}
            </p>
            <p className={styles.pInter}>
              {user.totalNotPaidAsBorrower} {COMMON_CONST.UNPAID}
            </p>
          </div>
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.VIOLATION_BLK_UNBLK) &&
          <div className={classNames(styles.action)}>
            {actionTemplate(user, 0)}
          </div>
          }
        </div>
      );
    };

    return (
      <div>
        <div
          className={classNames(styles.reporteeAndReporter)}
          onClick={rowClick}
        >
          <div className={styles.reporteeAndReporterRowContainer}>
          <span className="mr-2">{`${formated} - `}</span>
          <span className={`mr-2 bold ${styles.allReportRowStyle}`}>
            {rowData.reporteeName}
          </span>

          <span className="mr-2">{ACCOUNT_LIST_CONST.REPORTED_FOR} </span>
          <span className={`mr-2 ${styles.allReportRowStyle}`}>
            {`${rowData.category}`}
          </span>
          <span className="mr-2">{ACCOUNT_LIST_CONST.BY}</span>
          <span className="mr-2">{rowData.reporterName}</span>
          <span className="mr-2">{ACCOUNT_LIST_CONST.IN_THE_MATCH_FOR} </span>
          <span className="mr-2">{`${rowData.matchedAmount} ${getCountryPoint(
            true
          )}`}</span>
          </div>
          <div className={styles.reporteeAndReporterIconContainer}>
          <i
            className={`pi pi-angle-down mr-5 ${styles.allReportRowArrowIconStyle}`}
          ></i>
          </div>
        </div>
        {rowData.reason && <div>{`\"${rowData.reason}\"`}</div>}
        {rowData.showTable ? (
          <div className={`ml-0 mr-0 ${styles.wrapper}`}>
            <div className={styles.allReportTableContentStyle}>
              {reporteeReporterHeader()}

              {reportUser.repUser.map((user, index) =>
                reporteeReporterProfile(user, index)
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
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
        rows={searchValue === "" ? limit : data?.length}
        totalRecords={data?.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="createdDt"
        ref={dt}
        sortOrder={1}
      >
        <Column
          field="reporterName"
          body={reportedAccountTemplate}
          headerClassName={styles.allReportTableHeaderStyle}
          className={styles.allReportTableRowStyle}
          filterField={`reporterName`}
        />
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

export default ReportedLoan;

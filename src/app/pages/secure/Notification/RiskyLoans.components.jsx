import ContentTable from "app/common/components/Content-table/content-table.component";
import Header from "app/common/components/Header/header.component";
import APP_CONST from "app/common/constants/app.constant";
import {
  GetNotificatioRiskyLoans,
  saveCollectionStatus,
} from "app/common/api/Notification.api";
import { Storagehelper } from "app/common/shared/utils";
import contentAction from "app/store/actions/Notification.list";
import { Column } from "primereact/column";
import classNames from "classnames";
import { DataTable } from "primereact/datatable";
import React, { useState } from "react";
import dayjs from "dayjs";
import { clone } from "underscore";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Multiselect from "multiselect-react-dropdown";
import { Button } from "primereact/button";
import styles from "./riskassessment.module.scss";
import ActiveLoanDialog from "./ActiveLoan.dialog.component";
import { ReactComponent as Icon_lock } from "assets/icon/icon_lock.svg";
import {
  getClientRisk,
  saveCreditRiskUser,
} from "app/common/api/riskassessment.api";
import { APICONFIG, getEndPoint } from "app/common/config/config";
import {
  COMMON_CONST,
  NOTIFICATION_RISKY_LOAN_CONST,
  NOTIFICATION_ACTIVE_LOAN_CONST,
} from "app/common/constants/constant";
import * as ApiConstants from "app/common/constants/api.constants";

const collectionTypes = [
  { name: "Defaulted", id: 1 },
  { name: "In Collection", id: 2 },
  { name: "Collection Success", id: 3 },
  { name: "Collection Unsuccessful", id: 4 },
];

const reimbursementTypes = [
  { name: "Select", id: 1 },
  { name: "Reimbursed", id: 2 },
  { name: "Yet to reimburse", id: 3 },
];

const RiskyLoans = (props) => {
  const dispatch = useDispatch();
  const [state, setState] = React.useState({});
  const history = useHistory();
  const [pagination, setPagination] = React.useState({
    pages: [],
    count: 0,
  });
  const [data, setData] = useState([]);
  const [first, setFirst] = useState(0);
  const [pages, setPages] = useState(0);
  const [prevConfig, setPrevConfig] = useState([]);
  const [config, setConfig] = useState({});
  const [endReached, setEndReached] = useState(false);
  const [sortMeta, setSortMeta] = useState({
    sortField: null,
    sortOrder: 1,
  });
  const [Modal, showModal] = useState(false);
  const [selectedList, setSelectedList] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [selectedCollStatus, setSelectedCollStatus] = useState([]);
  const [selectedReimbuseStatus, setSelectedReimbuseStatus] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [adminErrMsg, setAdminErrMsg] = useState("");
  const [collectionInitial, setCollectionIntial] = useState("");
  const dataVisibilityTooltip = 15;

  const dt = React.useRef();
  const limit = React.useRef(20).current;

  React.useEffect(() => {
    if (history?.location?.state?.Status) {
      props.TabControl(history?.location?.state?.Status);
      history.location.state = "";
    }
  }, []);

  React.useEffect(onload, [props.status, props.Search]);

  function onload(collStatus, reimbStatus) {
    // const tempUserData = JSON.parse(sessionStorage?.okta_userdata);
    const tempUserData = JSON.parse(localStorage?.okta_userdata);
    dt.current.state.rows = limit;
    var data = {};
    data.payload = {
      status: props.status,
      searchValue: props.Search ? props.Search : "",
      lastLoan: "",
      lastDate: 0,
      adminUser: tempUserData?.userName, // additionally added this key
      collectionStatus: collStatus ? collStatus : "",
      reimbursementStatus: reimbStatus ? reimbStatus : "",
    };
    GetNotificatioRiskyLoans(data).then((res) => {
      if (res.status === 200) {
        props.triggerAction(props.status, res?.data?.notification);
        dispatch(
          contentAction.NotificationCount({ status: res?.data?.notification })
        );
        let length = Math.ceil(res?.data?.risks.length / limit);
        const _pagination = {
          pages: [],
          count: res?.data?.risks?.length,
        };

        for (let i = 1; i <= length; i++) {
          _pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false,
          });
        }
        setPagination(_pagination);
        setState(res?.data);
        const _prevConfig = clone(prevConfig);
        _prevConfig.push(config);
        setExpandedRows([]);
        setAdminErrMsg("");
        setPrevConfig(_prevConfig);

        if (res.data?.lastLoan) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            lastLoan: res.data.lastLoan,
          });
        } else {
          setEndReached(true);
        }
        filterCollectionStatus(res);
        setData(clone(res?.data?.risks));
      }
    });
  }
  const filterCollectionStatus = (res) => {
    res.data.risks.map((i) => {
      i.collectionOptionsStatus =
        i?.collectionStatus === '' ||
        i?.collectionStatus === NOTIFICATION_RISKY_LOAN_CONST.DEFAULTED
          ? collectionTypes.slice(0, 2)
          : collectionTypes.slice(1, 4);
      i.reimbursementOptionsStatus =
        i?.reimbursementStatus === "" ||
        i?.reimbursementStatus === COMMON_CONST.SELECT
          ? reimbursementTypes.slice(0, 3)
          : reimbursementTypes.slice(1, 3);
      i.prevReimburseStatus = i?.reimbursementStatus;
      return i;
    });
  };

  const onPageTransactions = (event) => {
    // const tempUserData = JSON.parse(sessionStorage?.okta_userdata);
    const tempUserData = JSON.parse(localStorage?.okta_userdata);
    if (event.first > first) {
      var data = {};
      data.payload = {
        status: props.status,
        searchValue: props.Search ? props.Search : "",
        lastLoan: state.lastLoan ? state.lastLoan : "",
        lastDate: state.lastDate ? state.lastDate : 0,
        adminUser: tempUserData?.userName, // additionally added this key
      };
      GetNotificatioRiskyLoans(data).then((res) => {
        if (res.status !== 200) {
          return;
        }
        let count = Math.ceil(res?.data?.risks.length / limit);

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
        setState(res?.data);
        setData(res?.data?.risks);

        const _prevConfig = clone(prevConfig);
        _prevConfig.push(config);

        setPrevConfig(_prevConfig);

        if (!res.data?.lastLoan) {
          setEndReached(true);
        } else {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            lastLoan: res.data.lastLoan,
            lastDate: res.data.lastDate,
          });
        }
      });
    }
    if (event.first < first) {
      const _prev = prevConfig[prevConfig.length - 2];
      var data = {};
      data.payload = {
        status: props.status,
        searchValue: props.Search ? props.Search : "",
        lastLoan: _prev.lastLoan ? _prev.lastLoan : "",
        lastDate: _prev.lastDate ? _prev.lastDate : 0,
        adminUser: tempUserData?.userName, // additionally added this key
      };
      GetNotificatioRiskyLoans(data).then((res) => {
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
        setState(res?.data);
        setData(res?.data?.risks);

        const _prevConfig = clone(prevConfig);
        _prevConfig.splice(_prevConfig.length - 1, 1);

        setPrevConfig(_prevConfig);

        if (res.data?.lastLoan) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            lastLoan: res.data.lastLoan,
            lastDate: res.data.lastDate,
          });
        } else {
          setEndReached(true);
        }
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

  const paginatorLeft = (
    <button
      disabled={pagination.pages[0]?.displayPage === 1 ? true : false}
      className="btn btn-dark btn-pill mr-4"
      onClick={() => onPreviousPage()}
    >
      {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
    </button>
  );

  const paginatorRight = (
    <button
      disabled={endReached}
      className="btn btn-dark btn-pill ml-4"
      onClick={() => onNextPage()}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee["active"] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
  };

  const navigateToProfile = (e, from) => {
    // if (!e.value) return;
    history.push({
      pathname: "/admin/Notifications/induvidual",
      state: {
        userData: e,
        Status: props.status,
        showBlockUnBlock: true,
      },
    });
  };

  const ShowTable = (item) => {
    return item?.length > 0
      ? styles.RiskTableBlockStyle
      : styles.RiskDataTableNoneStyle;
  };

  const ShowTitle = (item) => {
    return item?.length > 0 ? false : true;
  };

  const Subtitle = (props) => {
    let subTitle =
      props.subTitle === 2
        ? `${NOTIFICATION_ACTIVE_LOAN_CONST.LOANS_ABOUT_DEFAULTS_WEEK_ENDING} ${state?.processedDay}, ${state?.processedDate}`
        : `${NOTIFICATION_ACTIVE_LOAN_CONST.DEFAULTED_LOANS_AS_ON} ${state?.processedDay}, ${state?.processedDate}`;
    return subTitle;
  };

  const NoData = (props) => {
    let subTitle =
      props.subTitle === 2
        ? `${NOTIFICATION_ACTIVE_LOAN_CONST.NO_LOAN_GET_DEFAULTED_WEEK_ENDING} ${state?.processedDay}, ${state?.processedDate}`
        : `${NOTIFICATION_ACTIVE_LOAN_CONST.NO_DEFAULTED_LOANS_AS_ON} ${state?.processedDay}, ${state?.processedDate}`;
    return subTitle;
  };

  const onSort = (event) => {
    let clonsedata = [data];
    clonsedata.sort((data1, data2) => {
      const value1 = data1[event.field];
      const value2 = data2[event.field];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === "string" && typeof value2 === "string")
        result = value1.localeCompare(value2, undefined, { numeric: true });
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
    // setData
    console.log(clonsedata);
    return data;
  };

  const onSortAllAccount = (event) => {
    var sorteduser = [];

    // var sortedUsers = [];
    if (event.sortField === "borrName") {
      console.log(sorteduser);
      sorteduser = data.sort((obj1, obj2) => {
        const str1 = obj1[event.sortField].toUpperCase();
        const str2 = obj2[event.sortField].toUpperCase();

        let comparison = 0;
        if (str1 > str2) {
          comparison = 1;
        } else if (str1 < str2) {
          comparison = -1;
        }
        return sortMeta.sortOrder === -1 ? comparison : comparison * -1;
      });
    }
    const updatedMeta = JSON.parse(JSON.stringify(sortMeta));
    updatedMeta.sortOrder = sortMeta.sortOrder === -1 ? 1 : -1;
    updatedMeta.sortField = event.sortField;
    setSortMeta(updatedMeta);
    setData(sorteduser);
  };

  const openContractModal = (item) => {
    const { loanPreprocess } = item;
    let contractList = loanPreprocess?.loanContract?.contractEnglish
      ? loanPreprocess?.loanContract?.contractEnglish
      : loanPreprocess?.loanContract?.contract;
    setSelectedList(contractList);
    setSelectedData(item);
    showModal(true);
  };
  const onChangeCollectionStatus = (val) => {
    setSelectedCollStatus(clone(val));
    setEndReached(false);
    setPages(0);
    setFirst(0);
    setPagination({
      pages: [],
      count: 0,
    });
    setPrevConfig(clone([]));
    setConfig({});
    let selectedValue = val.length ? val[0].name : "";
    onload(selectedValue, selectedReimbuseStatus[0]?.name);
  };

  const onChangeRebursementStatus = (val) => {
    setSelectedReimbuseStatus(clone(val));
    setEndReached(false);
    setPages(0);
    setFirst(0);
    setPagination({
      pages: [],
      count: 0,
    });
    setPrevConfig(clone([]));
    setConfig({});
    let selectedValue = val.length ? val[0].name : "";
    onload(selectedCollStatus[0]?.name, selectedValue);
  };
  const onToggleRow = (e) => {
    console.log("test ", e);
    setExpandedRows(e.data);
  };

  const onSave = ({ ...payload }) => {
  
      saveCollectionStatus({
        payload: payload,
      }).then((res) => {
        if (res.status !== 200) return;
        const d = clone(data);
        const index = dataIndex(payload);
        d.splice(index, 1);

        setData(clone(d));
        setExpandedRows([]);
        onload();
      });
    
  };

  const dataIndex = (rowData) =>
    data.findIndex(
      (e) => e.userId === rowData.userId && e.loanId === rowData.loanId
    );

  const collectionStatusUpdate = ({ target: { value } }, rowData) => {
    if (
      value === NOTIFICATION_RISKY_LOAN_CONST.DEFAULTED ||
      value === NOTIFICATION_RISKY_LOAN_CONST.IN_COLLECTION
    ) {
      const d = clone(data);
      d[dataIndex(rowData)] = {
        ...rowData,
        collectionStatus: value,
        useAppTouched: !rowData?.useAppTouched,
      };
      setData(clone(d));
    } else {
      const d = clone(data);
      d[dataIndex(rowData)] = {
        ...rowData,
        collectionStatus: value,
        useAppTouched: true,
        statusTouch: false,
      };

      setData(clone(d));
    }
  };
  const dataIndexVal = (rowData) =>
    data.findIndex(
      (e) => e.userId === rowData.userId && e.loanId === rowData.loanId
    );

  const adminNotesUpdate = (value, rowData) => {
    const d = clone(data);
    d[dataIndexVal(rowData)] = {
      ...rowData,
      notes: value,
      remarksEdited: true,
    };
    setData(clone(d));
  };

  const ReimbursementUpdate = ({ target: { value } }, rowData) => {
    if (
      value === COMMON_CONST.SELECT ||
      rowData.prevReimburseStatus === value
    ) {
      const d = clone(data);
      d[dataIndexVal(rowData)] = {
        ...rowData,
        reimbursementStatus: value,
        useReimbursemntTouched: false,
      };
      setData(clone(d));
    } else {
      const d = clone(data);
      d[dataIndexVal(rowData)] = {
        ...rowData,
        reimbursementStatus: value,
        useReimbursemntTouched: true,
      };
      setData(clone(d));
    }
  };

  function rowExpansionTemplate(data) {
    return (
      <div className="orders-subtable">
        <DataTable value={[data]}>
          <Column
            field="loanId"
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOANID}
            headerClassName={styles.defaultRowLoanColumn}
            className={`${styles.RiskTableBnameColumnStyle}`}
          />
          <Column
            field="Grace period "
            header={NOTIFICATION_RISKY_LOAN_CONST.GRACE_PERIOD}
            headerClassName={styles.RiskTableContactHeaderStyle}
            body={(rowData) => (
              <p
                className={`mb-0 text-dark ${styles.RiskTableBnameColumnStyle}`}
              >
                {rowData.gracePeriod ? rowData.gracePeriod : "-"}
              </p>
            )}
          />

          <Column
            header={NOTIFICATION_RISKY_LOAN_CONST.COLLECTION_STATUS}
            className={styles.defaultGraceColumnStyle}
            headerClassName={styles.defaultCollectionHeaderStyle}
            body={(rowData) => {
              let disable = rowData?.useAppTouched
                ? false
                : rowData?.collectionStatus ===
                    NOTIFICATION_RISKY_LOAN_CONST.COLLECTION_SUCCESS ||
                  rowData?.collectionStatus ===
                    NOTIFICATION_RISKY_LOAN_CONST.COLLECTION_UNSUCCESS;
              return (
                <div className="d-flex justify-content-around align-items-center">
                  <select
                    onChange={(e) => collectionStatusUpdate(e, rowData)}
                    disabled={disable}
                    value={rowData?.collectionStatus}
                    className={`mb-0 text-dark ${styles.creditTableRiskSelectStyle}`}
                  >
                    {rowData.collectionOptionsStatus.map((item) => (
                      <option value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
              );
            }}
          />

          <Column
            header={NOTIFICATION_RISKY_LOAN_CONST.REIMBURSEMNT_STATUS}
            className={styles.defaultGraceColumnStyle}
            headerClassName={styles.defaultReimburseHeaderStyle}
            body={(rowData) => {
              let disable =
                !rowData?.useReimbursemntTouched &&
                rowData?.reimbursementStatus ===
                  NOTIFICATION_RISKY_LOAN_CONST.REIMBURSEMNT;
              return (
                <select
                  onChange={(e) => ReimbursementUpdate(e, rowData)}
                  value={rowData?.reimbursementStatus}
                  disabled={disable}
                  className={`mb-0 text-dark ${styles.creditTableRiskSelectStyle}`}
                >
                  {rowData.reimbursementOptionsStatus.map((item) => (
                    <option value={item.name}>{item.name}</option>
                  ))}
                </select>
              );
            }}
          />
          <Column
            header={"Admin notes"}
            className={styles.defaultGraceColumnStyle}
            headerClassName={styles.defaultTextHeaderStyle}
            body={(rowData) => (
              <>
                <textarea
                  onChange={(e) => adminNotesUpdate(e.target.value, rowData)}
                  value={rowData.notes}
                  className={classNames("form-control", styles.txtArea, "mr-3")}
                  style={{ height: "112px" }}
                  placeholder={COMMON_CONST.NOTES_TEXT_PLACEHOLDER}
                />
                {adminErrMsg && (
                  <p className={styles.defaultTextAreaErrStyle}>
                    {adminErrMsg}
                  </p>
                )}
              </>
            )}
          />
          <Column
            header=""
            className={styles.defaultGraceColumnStyle}
            headerClassName={styles.defaultSaveHeaderStyle}
            body={(rowData) => {
              let disable =
                (rowData?.useAppTouched || rowData?.useReimbursemntTouched) &&
                rowData?.remarksEdited &&
                rowData?.notes.trim();
              return (
                <button
                  disabled={!disable}
                  className={classNames(
                    "btn btn-pill",
                    !disable ? "btn-light" : "btn-success",
                    styles.center
                  )}
                  onClick={() => onSave(rowData)}
                >
                  {COMMON_CONST.SAVE}
                </button>
              );
            }}
          />
          <Column
            headerClassName={styles.creditTableEmptyHeaderStyle}
            bodyClassName={styles.creditTableEmptyColumnStyle}
          />
        </DataTable>
      </div>
    );
  }
  return (
    <>
      <ActiveLoanDialog
        visible={Modal}
        borrowerId={selectedData?.borrId}
        userId={selectedData?.loanId}
        BorrowerName={selectedData?.borrName}
        LenderName={selectedData?.lendName}
        dueDate={selectedData?.dueDate}
        selectedList={selectedList}
        onHide={() => showModal(false)}
      />
      <div className="len-datatable">
        {ShowTitle(data) ? (
          props.status != "DEFAULTED_LOAN" && (
            <p className={styles.subTitleNOLoan}>{NoData(props)}</p>
          )
        ) : (
          <p className={styles.subTitle}>{Subtitle(props)}</p>
        )}
        {props.status === "DEFAULTED_LOAN" && (
          <div className="row">
            <div className="col-sm-4">
              <p className={styles.label}>{"Collection Status"}</p>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <Multiselect
                    onSelect={onChangeCollectionStatus}
                    onRemove={onChangeCollectionStatus}
                    options={collectionTypes}
                    selectedValues={selectedCollStatus}
                    displayValue="name"
                    singleSelect
                    showArrow={false}
                    placeholder={"Select status"}
                    style={selectStyles.common}
                  />
                </div>
                <div className="pl-3">
                  <Button
                    onClick={() => onChangeCollectionStatus([])}
                    icon="pi pi-times"
                    className={`p-button-rounded ${styles.creditRiskCloseIconStyle}`}
                  />
                </div>
              </div>
            </div>

            <div className="col-sm-4">
              <p className={styles.label}>{"Reimbursement Status"}</p>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <Multiselect
                    onSelect={onChangeRebursementStatus}
                    onRemove={onChangeRebursementStatus}
                    options={reimbursementTypes}
                    singleSelect
                    showArrow={false}
                    selectedValues={selectedReimbuseStatus}
                    displayValue="name"
                    placeholder={"Select status"}
                    style={selectStyles.common}
                  />
                </div>
                <div className="pl-3">
                  <Button
                    onClick={() => onChangeRebursementStatus([])}
                    icon="pi pi-times"
                    className={`p-button-rounded ${styles.creditRiskCloseIconStyle}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {ShowTitle(data) && props.status === "DEFAULTED_LOAN" && (
          <p className={styles.subTitleNOLoan}>{NoData(props)}</p>
        )}
        <DataTable
          value={data}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          scrollHeight="400px"
          scrollable={true}
          // style={{width: '100%', display: ShowTable(data)}}
          className={`${
            props.status === "DEFAULTED_LOAN"
              ? styles.RiskDataTableWithPadStyle
              : styles.RiskDataTableStyle
          } ${ShowTable(data)}`}
          responsive
          paginator
          rows={data?.length}
          totalRecords={data?.length}
          onSort={onSortAllAccount}
          paginatorTemplate=" "
          selectionMode="single"
          dataKey="loanId"
          ref={dt}
          // onSelectionChange={(e) => navigateToProfile(e, "all")}
          sortOrder={1}
          expandedRows={expandedRows}
          onRowToggle={(e) => onToggleRow(e)}
          rowExpansionTemplate={(e) => rowExpansionTemplate(e)}
        >
          <Column
            header=""
            headerClassName={styles.RiskTableProfileHeaderStyle}
            body={(rowData) => (
              <>
                {/* <div class="col-sm-6 col-md-2 "> */}
                {rowData?.borrImg && (
                  <img
                    className={styles.RiskTableProfileImgStyle}
                    src={rowData.borrImg}
                  />
                )}
                {/* </div> */}
              </>
            )}
          />
          <Column
            field="borrName"
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_BORROWER_NAME}
            sortable
            headerClassName={styles.RiskTableBnameHeaderStyle}
            className={styles.RiskTableBnameColumnStyle}
            body={(rowData) => (
              <>
                {rowData.borrName?.length >
                COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                  <div
                    // className='pr-3'
                    onClick={() => navigateToProfile(rowData.borrId)}
                  >
                    <p
                      className={"text-truncate mb-0"}
                      title={rowData.borrName}
                    >
                      {rowData.borrName}
                    </p>
                  </div>
                ) : (
                  <div
                    // className='pr-3'
                    onClick={() => navigateToProfile(rowData.borrId)}
                  >
                    <p className={"text-truncate mb-0"}>{rowData.borrName}</p>
                  </div>
                )}
              </>
            )}
          />
          <Column
            field="phone"
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.RiskTableContactHeaderStyle}
            className={styles.RiskTableBnameColumnStyle}
            body={(rowData) => (
              <>
                {rowData.email.length > dataVisibilityTooltip ? (
                  <div className="d-flex flex-column">
                    <p className="mb-0 text-dark" title={rowData.phone}>
                      {rowData.phone}
                    </p>
                    <p
                      className={`mb-0 text-truncate text-dark ${styles.RiskTableContactValueStyle}`}
                      title={rowData.email}
                    >
                      {rowData.email}
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column">
                    <p className="mb-0 text-dark">{rowData.phone}</p>
                    <p
                      className={`mb-0 text-truncate text-dark ${styles.RiskTableContactValueStyle}`}
                    >
                      {rowData.email}
                    </p>
                  </div>
                )}
              </>
            )}
          />
          <Column
            header=""
            headerClassName={styles.RiskTableProfileHeaderStyle}
            body={(rowData) => (
              <>
                {/* <div class="col-sm-6 col-md-2 "> */}
                {rowData?.lendImg && (
                  <img
                    className={styles.RiskTableProfileImgStyle}
                    src={rowData.lendImg}
                  />
                )}
                {/* </div> */}
              </>
            )}
          />
          <Column
            field="lendName"
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_INVESTOR_NAME}
            headerClassName={styles.RiskTableBnameHeaderStyle}
            className={styles.RiskTableBnameColumnStyle}
            body={(rowData) => (
              <>
                {rowData.lendName?.length >
                COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                  <div
                    // className='pr-3'
                    onClick={() => navigateToProfile(rowData.lendId)}
                  >
                    <p
                      className={"text-truncate mb-0"}
                      title={rowData.lendName}
                    >
                      {rowData.lendName}
                    </p>
                  </div>
                ) : (
                  <div
                    // className='pr-3'
                    onClick={() => navigateToProfile(rowData.lendId)}
                  >
                    <p className={"text-truncate mb-0"}>{rowData.lendName}</p>
                  </div>
                )}
              </>
            )}
          />
          {props.status != "DEFAULTED_LOAN" && (
            <Column
              field="loanId"
              header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOANID}
              headerClassName={styles.RiskTableContactHeaderStyle}
              className={styles.RiskTableBnameColumnStyle}
            />
          )}
          <Column
            field="createdDate"
            header={
              NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_DATE_LOAN_WAS_TAKEN
            }
            headerClassName={styles.RiskTableContactHeaderStyle}
            className={styles.RiskTableBnameColumnStyle}
            body={(rowData) => (
              <p className="mb-0 text-dark">
                {dayjs.utc(rowData.createdDate).format("DD.MM.YYYY")}
              </p>
            )}
          />
          <Column
            field="dueDate"
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOAN_DUE_DATE}
            headerClassName={styles.RiskTableContactHeaderStyle}
            className={styles.RiskTableBnameColumnStyle}
            body={(rowData) => (
              <p className="mb-0 text-dark">
                {dayjs.utc(rowData.dueDate).format("DD.MM.YYYY")}
              </p>
            )}
          />
          {props.status != "DEFAULTED_LOAN" && (
            <Column
              field="Grace period "
              header={NOTIFICATION_RISKY_LOAN_CONST.GRACE_PERIOD}
              headerClassName={styles.RiskTableContactHeaderStyle}
              body={(rowData) => (
                <p
                  className={`mb-0 text-dark ${styles.RiskTableBnameColumnStyle}`}
                >
                  {rowData.gracePeriod ? rowData.gracePeriod : "-"}
                </p>
              )}
            />
          )}
          <Column
            field="Loan Contract"
            header="Loan Contract"
            headerClassName={styles.RiskTableContractHeaderStyle}
            body={(rowData) => (
              <p
                className={`mb-0 text-dark ${styles.RiskTableContractValueStyle}`}
                onClick={() => {
                  openContractModal(rowData);
                }}
              >
                {"VIEW"}
              </p>
            )}
          />
          {props.status === "DEFAULTED_LOAN" && (
            <Column
              bodyClassName={styles.creditTableExpandColumnStyle}
              headerClassName={styles.creditTableExpandHeaderStyle}
              expander
            />
          )}
        </DataTable>
      </div>
      <nav
        // style={{display: ShowTable(data)}}
        aria-label="..."
        className={`mr-auto pt-5 ${ShowTable(data)}`}
      >
        <ul className={classNames("pagination", styles.moveRight)}>
          {
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
    </>
  );
};

const selectStyles = {
  typeStyles: {
    chips: {
      backgroundColor: "white",
      border: "1px solid #0FB377",
      color: "#1E1E1E",
    },
  },
  common: {
    option: {
      fontSize: "11px",
      color: "#776B6B",
      background: "white",
      borderBottom: "1px solid #0FB377",
    },
    optionContainer: {
      borderRadius: "12px",
      border: "1px solid #0FB377",
    },
    searchBox: {
      fontSize: "11px",
      border: "1px solid #0FB377",
      borderRadius: "12px",
    },
    inputField: {
      paddingTop: "4px",
      paddingBottom: "4px",
    },
    td_text_style: {
      textAlign: "center",
      paddingTop: "12px",
      paddingBottom: "12px",
      color: "#000000",
      fontWeight: 900,
      fontSize: 11,
    },
  },
};

export default RiskyLoans;

import classNames from "classnames";
import dayjs from "dayjs";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import _ from "underscore";
import styles from "./userManage.module.scss";
import UserFormDialog from "./dialog/userFormDialog.component";
import {
  COMMON_CONST,
  GENERATE_PROMO_CODE_CONST,
  USER_MANAGEMENT_CONST,
  USER_MANAGE_FORM_CONST,
} from "app/common/constants/constant";
import {
  getUserManageData,
  deleteAdminUser,
  generateOtp,
} from "app/common/api/userManage.api";
import ConfirmDialog from "../PushNotification/dialog/ConfirmDialog.component";
import OtpDialog from "./dialog/otpDialog.component";
import OtpConfirmDialog from "./dialog/otpConfirmDialog.component";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const ManageAdmin = ({
  searchValue,
  setSearchValue,
  setAddAdmin,
  addAdmin,
  setUserData,
}) => {
  let dt = useRef();
  const limit = useRef(20).current;

  const [data, setData] = useState([]);

  const [lastKey, setLastKey] = useState("");
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [prevIds, setPrevIds] = useState([]);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });
  const [showFormMoadal, setShowFormModal] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedEditData, setSelectedEditedData] = useState(null);
  const [editAction, setEditAction] = useState(false);
  const [otpDialogShow, setOtpDialogShow] = useState(false);
  const [selectedDeleteData, setSelectedDeleteData] = useState(null);
  const [otpConfirmShow, setOtpConfirmShow] = useState(false);
  const [otpFailureShow, setOtpFailureShow] = useState(false);

  useEffect(() => {
    return () => setSearchValue("");
  }, []);

  useEffect(onLoad, [searchValue]);

  function onLoad() {
    if (searchValue?.trim() !== "") {
      getUserManageData({
        searchValue: searchValue,
        lastEvaluatedKey: null,
      }).then((res) => {
        if (res.status === 200) {
          setUserData(res.data);
          dt.current.state.rows = res.data.adminList.length;
          setData(res.data.adminList);
        }
      });
    } else {
      dt.current.state.rows = limit;

      getUserManageData({
        searchValue: "",
        lastEvaluatedKey: null,
      }).then((res) => {
        if (res.status === 200) {
          setUserData(res.data);

          let length = Math.ceil(res?.data?.adminList?.length / limit);

          const _pagination = {
            pages: [],
            count: res.data.adminList,
          };
          for (let i = 1; i <= length; i++) {
            _pagination.pages.push({
              page: i,
              displayPage: i,
              active: i === 1 ? true : false,
            });
          }

          const pIds = [...prevIds];
          pIds.push(res?.data?.lastEvaluatedKey);

          setLastKey(res.data?.lastEvaluatedKey);
          setPrevIds(pIds);
          setPagination(_pagination);
          setData(res.data.adminList);
        }
      });
    }
  }

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee["active"] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
  };

  const onPageAllAccounts = (event) => {
    if (event.first > first) {
      getUserManageData({
        searchValue: "",
        lastEvaluatedKey: null,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        const ids = [...prevIds];
        ids[event.page] = lastKey;

        let count = Math.ceil(res?.data?.adminList?.length / limit);
        let _pagination = _.clone(pagination);
        _pagination["pages"] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + limit / 2;

          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled = index + 1 > count ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res?.data?.adminList);

        setLastKey(res?.data?.lastEvaluatedKey);
        setPrevIds(_.clone(ids));
      });
    }
    if (event.first < first) {
      getUserManageData({
        lastEvaluatedKey: prevIds[event.page],
        searchValue: "",
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        const ids = [...prevIds];
        ids.splice(event.page + 1);

        let _pagination = _.clone(pagination);
        _pagination["pages"] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res?.data?.adminList);

        setLastKey(res?.data?.lastEvaluatedKey);
        setPrevIds(_.clone(ids));
      });
    }
  };

  const onHideOTP = () => {
    setOtpDialogShow(false);
  };

  function onHideFormModal() {
    setSelectedEditedData(null);
    setEditAction(false);
    setShowFormModal(false);
    setAddAdmin(false);
  }

  const onHideDialog = () => {
    setConfirmVisible(false);
  };

  const handleEdit = (rowData) => {
    let phoneNumberSplit = _.clone(rowData);
    const {phoneNumber, countryCode} = phoneNumberSplit
    let phoneNoWithOutCode = phoneNumber.slice(countryCode?.length)
    phoneNumberSplit = {...phoneNumberSplit, phoneNumber: phoneNoWithOutCode }
    setSelectedEditedData(phoneNumberSplit);
    setShowFormModal(true);
    setEditAction(true);
  };

  const handleDelete = (rowData) => {
    setSelectedDeleteData(rowData);
    setConfirmVisible(true);
  };

  const onPreviousPage = () => {
    const event = {
      first: first - limit,
      page: pages - 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAllAccounts(event);
  };

  const confirmAction = () => {
    setConfirmVisible(false);
    generateOtp().then((res) => {
      if (res.status === 200) {
        setOtpDialogShow(true);
      }
    });
  };
  
  const onDeleteSubmit = (values) => {
    onHideOTP();
    let payload = _.clone(values);
    const modifiedPayload = {
      ...selectedDeleteData,
      ...payload,
    };
    deleteAdminUser(modifiedPayload).then((res) => {
      if (res.status === 200) {
        setOtpConfirmShow(true);
      } else {
        setOtpFailureShow(true);
      }
    });
  };

  const onHideConfirmModal = () => {
    setOtpConfirmShow(false);
    setOtpFailureShow(false);
    onLoad();
  };

  const footerTmpl = (
    <div className="text-left">
      <button className="btn btn-primary btn-pill" onClick={confirmAction}>
        {COMMON_CONST.DELETE}
      </button>
      <button className="btn btn-dark btn-pill" onClick={onHideDialog}>
        {COMMON_CONST.NEVER_MIND}
      </button>
    </div>
  );

  const onNextPage = () => {
    const event = {
      first: first + limit,
      page: pages + 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAllAccounts(event);
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
      disabled={!lastKey}
      className="btn btn-dark btn-pill ml-4"
      onClick={onNextPage}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  return (
    <>
      <DataTable
        value={data}
        emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
        scrollHeight="400px"
        scrollable={true}
        className={styles.todayNotifyDataTableStyle}
        responsive
        paginator
        rows={searchValue === "" ? limit : data?.length}
        totalRecords={data?.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="id"
        ref={dt}
        sortOrder={1}
      >
        <Column
          field="fname"
          header={COMMON_CONST.FIRST_NAME}
          headerClassName={styles.todayNotifyTitleHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => (
            <div>
              {rowData?.fname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                <p
                  className={`text-truncate mb-0 ${styles.userTableNameStyle}`}
                  title={rowData.fname}
                >
                  {rowData.fname}
                </p>
              ) : (
                <p
                  className={`text-truncate mb-0 ${styles.userTableNameStyle}`}
                >
                  {rowData?.fname}
                </p>
              )}
            </div>
          )}
          sortable
        />
        <Column
          field="lname"
          header={COMMON_CONST.LAST_NAME}
          headerClassName={styles.todayNotifyTitleHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => (
            <div>
              {rowData?.lname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                <p
                  className={`text-truncate mb-0 ${styles.userTableNameStyle}`}
                  title={rowData.lname}
                >
                  {rowData.lname}
                </p>
              ) : (
                <p
                  className={`text-truncate mb-0 ${styles.userTableNameStyle}`}
                >
                  {rowData.lname}
                </p>
              )}
            </div>
          )}
          sortable
        />
        <Column
          field="phoneNumber"
          header={COMMON_CONST.PHONE_NUMBER}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => {
            return (
              <>
                {rowData?.phoneNumber ? (
                  rowData?.phoneNumber?.length >
                  COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                    <p
                      className={"text-truncate mb-0"}
                      title={rowData?.phoneNumber}
                    >
                      {rowData?.phoneNumber}
                    </p>
                  ) : (
                    <p className={"text-truncate mb-0"}>
                      {rowData?.phoneNumber}
                    </p>
                  )
                ) : (
                  <p>-</p>
                )}
              </>
            );
          }}
        />
        <Column
          field="uname"
          header={COMMON_CONST.EMAIL_ID}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => (
            <div>
              {rowData?.uname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                <p className={"text-truncate mb-0"} title={rowData.uname}>
                  {rowData.uname}
                </p>
              ) : (
                <p className={"text-truncate mb-0"}>{rowData.uname}</p>
              )}
            </div>
          )}
        />
        <Column
          field="dob"
          header={GENERATE_PROMO_CODE_CONST.DATE_OF_BIRTH}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => (
            <div>
              {rowData?.dob ? (
                <p className={"text-truncate mb-0"}>{rowData.dob}</p>
              ) : (
                <p>-</p>
              )}
            </div>
          )}
          sortable
        />
        <Column
          field="role"
          header={COMMON_CONST.ROLE}
          headerClassName={styles.todayAvailableHeaderStyle}
          className={styles.todayAvailableColumnStyle}
        />
        <Column
          field="notes"
          header={COMMON_CONST.NOTES}
          headerClassName={styles.userNotesHeaderStyle}
          className={styles.userNotesStyle}
          body={(rowData) => {
            return <>{rowData?.notes ? <p>{rowData?.notes}</p> : <p>-</p>}</>;
          }}
        />
        <Column
          field=""
          header=""
          headerClassName={styles.todayAvailableHeaderStyle}
          className={styles.todayAvailableColumnStyle}
          body={(rowData) => {
            return (
              <>
                <div>
                  <button
                    className={`btn btn-pill btn-light mb-2 ${styles.manageEditButtonStyle}`}
                    onClick={() => handleEdit(rowData)}
                  >
                    {COMMON_CONST.EDIT}
                  </button>
                </div>
                {rowData.role !== USER_MANAGE_FORM_CONST.SUPER_ADMIN && (
                  <div>
                    <button
                      className={`btn btn-danger btn-pill ${styles.manageEditButtonStyle}`}
                      onClick={() => handleDelete(rowData)}
                    >
                      {COMMON_CONST.DELETE}
                    </button>
                  </div>
                )}
              </>
            );
          }}
        />
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames("pagination", styles.moveRight)}>
          {searchValue === "" && (
            <>
              {pagination?.pages?.length > 0 && paginatorLeft}
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
              {pagination?.pages?.length > 0 && paginatorRight}
            </>
          )}
        </ul>
      </nav>
      <UserFormDialog
        onHide={onHideFormModal}
        visible={showFormMoadal}
        editAction={editAction}
        setEditAction={setEditAction}
        selectedToEditData={selectedEditData}
        actionType={true}
        onLoad={onLoad}
      />
      <UserFormDialog
        onHide={onHideFormModal}
        visible={addAdmin}
        selectedToEditData={selectedEditData}
        onLoad={onLoad}
      />
      <ConfirmDialog
        visible={confirmVisible}
        header={USER_MANAGEMENT_CONST.ADMIN_DELETE_DIALOG_HEADER}
        desc={`${USER_MANAGEMENT_CONST.ADMIN_DELETE_DIA_SUB_TEXT_1}${selectedDeleteData?.fname} ${selectedDeleteData?.lname}${USER_MANAGEMENT_CONST.ADMIN_DELETE_DIA_SUB_TEXT_2}`}
        footer={footerTmpl}
        onHide={onHideDialog}
      />
      <OtpDialog
        {...{ otpDialogShow, onHideOTP }}
        onSubmit={onDeleteSubmit}
        reSendOtp={confirmAction}
      />
      <OtpConfirmDialog
        otpConfirm={otpConfirmShow}
        onHide={onHideConfirmModal}
        header={COMMON_CONST.YAY}
        desc={`${USER_MANAGEMENT_CONST.SUCCESS_UPDATE_POPUP}${selectedDeleteData?.fname} ${selectedDeleteData?.lname}`}
      />
      <OtpConfirmDialog
        otpConfirm={otpFailureShow}
        onHide={onHideConfirmModal}
        header={COMMON_CONST.OH_NO}
        desc={`${USER_MANAGEMENT_CONST.FAILUER_UPDATE_POPUP_1}${selectedDeleteData?.fname} ${selectedDeleteData?.lname}${USER_MANAGEMENT_CONST.FAILUER_UPDATE_POPUP_2}`}
        buttonGray={true}
      />
    </>
  );
};

export default ManageAdmin;

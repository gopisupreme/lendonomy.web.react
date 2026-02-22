import classNames from "classnames";
import dayjs from "dayjs";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import _ from "underscore";
import styles from "./pushNotification.module.scss";
import { tabTitle } from "./pushNotification.component";
import ConfirmDialog from "./dialog/ConfirmDialog.component";
import {
  ALL_PROMO_CODE_CONST,
  COMMON_CONST,
  LOGIN_CONST,
  PUSH_NOTIFICATION_GENERATE_CONST,
  PUSH_NOTIFICATION_TODAY_CONST,
  USER_ROLE_CONFIG_KEY,
} from "app/common/constants/constant";
import {
  getHistoryNotification,
  reTriggerPushNotification,
} from "app/common/api/pushNotification.api";
import utc from "dayjs/plugin/utc";
import UtilsHelper from "app/common/services/utilsHelper";
dayjs.extend(utc);

const NotificationHistory = ({ searchValue, setSearchValue, setTitle }) => {
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState({});
  const urlQueryParam = PUSH_NOTIFICATION_TODAY_CONST.RETRIGGER_PARAM

  useEffect(() => {
    setTitle(tabTitle.history);
    return () => setSearchValue("");
  }, []);

  useEffect(onLoad, [searchValue]);

  function onLoad() {
    if (searchValue?.trim() !== "") {
      getHistoryNotification({
        createdOn: null,
        searchText: searchValue,
        getCount: true,
      }).then((res) => {
        if (res.status === 200) {
          dt.current.state.rows = res.data.notfications.length;
          setData(res.data.notfications);
        }
      });
    } else {
      dt.current.state.rows = limit;

      getHistoryNotification({
        createdOn: null,
        searchText: null,
        getCount: true,
      }).then((res) => {
        if (res.status === 200) {
          let length = Math.ceil(res?.data?.notfications.length / limit);

          const _pagination = {
            pages: [],
            count: res.data.notfications, 
          };
          for (let i = 1; i <= length; i++) {
            _pagination.pages.push({
              page: i,
              displayPage: i,
              active: i === 1 ? true : false,
            });
          }

          const pIds = [...prevIds];
          pIds.push(res?.data?.createdOn);

          setLastKey(res.data?.createdOn);
          setPrevIds(pIds);
          setPagination(_pagination);
          setData(res.data.notfications);
        }
      });
    }
  }

  const dateFormat = (date) => {
    return dayjs.utc(date).format("DD.MM.YY")
  }

  const confirmAction = () => {
    const payload = { ...selectedNotification, urlQueryParam };
    reTriggerPushNotification(payload).then((res) => {
      if (res.status === 200) {
        onHideDialog();
      }
    });
  };

  const onHideDialog = () => {
    setConfirmVisible(false);
  };

  const footerTmpl = (
    <div className="text-left">
      <button className="btn btn-primary btn-pill" onClick={confirmAction}>
        {LOGIN_CONST.CONFIRM_BUTTON}
      </button>
      <button className="btn btn-dark btn-pill" onClick={onHideDialog}>
        {COMMON_CONST.CANCEL}
      </button>
    </div>
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

  const onPageAllAccounts = (event) => {
    if (event.first > first) {
      getHistoryNotification({
        createdOn: lastKey,
        searchText: null,
        getCount: true,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        const ids = [...prevIds];
        ids[event.page] = lastKey;

        let count = Math.ceil(res?.data?.notfications.length / limit);
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
        setData(res?.data?.notfications);

        setLastKey(res?.data?.createdOn);
        setPrevIds(_.clone(ids));
      });
    }
    if (event.first < first) {
      getHistoryNotification({
        searchText: null,
        getCount: true,
        createdOn: prevIds[event.page],
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
        setData(res?.data?.notfications);

        setLastKey(res?.data?.createdOn);
        setPrevIds(_.clone(ids));
      });
    }
  };

  const onPreviousPage = () => {
    console.log(first, pages);
    const event = {
      first: first - limit,
      page: pages - 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAllAccounts(event);
  };

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
        rows={searchValue === "" ? limit : data.length}
        totalRecords={data.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="id"
        ref={dt}
        sortOrder={1}
      >
        <Column
          field="title"
          header={COMMON_CONST.TITLE}
          headerClassName={styles.todayNotifyTitleHeaderStyle}
          className={styles.allPromoDiscountStyle}
        />
        <Column
          field="createdOn"
          header={PUSH_NOTIFICATION_TODAY_CONST.CREATED_DATE}
          headerClassName={styles.allPromoDiscountHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) =>
            dateFormat(rowData["createdOn"])
          }
        />
        <Column
          field="notificationText"
          header={PUSH_NOTIFICATION_TODAY_CONST.NOTIFICATION_TEXT}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
        />
        <Column
          field="notificationCenterText"
          header={PUSH_NOTIFICATION_TODAY_CONST.NOTIFICATION_CENTER_TEXT}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
        />
        <Column
          field="isApplicabletoAll"
          header={ALL_PROMO_CODE_CONST.AVAILABLE_TO_ALL}
          headerClassName={styles.todayAvailableHeaderStyle}
          className={styles.todayAvailableColumnStyle}
          body={(rowData) => `${rowData["isApplicabletoAll"] ? "Yes" : "No"}`}
        />
        <Column
          field="adminNote"
          header={COMMON_CONST.NOTES}
          headerClassName={styles.todayAvailableHeaderStyle}
          className={styles.todayAvailableColumnStyle}
        />
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PUSH_NOTIFY_TRIGGER) && 
        <Column
          headerClassName={styles.retriggerHeaderStyle}
          className={styles.retriggerColumnStyle}
          body={(rowData) => (
            <button
              onClick={() => {
                setConfirmVisible(true);
                setSelectedNotification(rowData);
              }}
              className="btn btn-danger btn-pill"
            >
              {COMMON_CONST.RE_TRIGGER}
            </button>
          )}
        />
        }
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames("pagination", styles.moveRight)}>
          {searchValue === "" && (
            <>
              {console.log("pagination_pages", pagination?.pages?.length)}
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
      <ConfirmDialog
        visible={confirmVisible}
        header={PUSH_NOTIFICATION_GENERATE_CONST.RETRIGGER_POPUP_HEADER_TEXT}
        desc={ALL_PROMO_CODE_CONST.DELETE_PROMO_CODE_SUB_TEXT}
        footer={footerTmpl}
        onHide={onHideDialog}
      />
    </>
  );
};

export default NotificationHistory;

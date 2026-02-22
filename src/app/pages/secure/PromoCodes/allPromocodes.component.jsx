import classNames from 'classnames';
import dayjs from 'dayjs';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import {Dialog} from 'primereact/dialog';
import React, {useEffect, useRef, useState} from 'react';
import _ from 'underscore';

import styles from './promocodestyles.module.scss';
import {
  getPromoCodes,
  deletePromoCode,
} from '../../../common/api/promocodes.api';
import {tabNames} from './promoCodes.component';
import { tabTitle } from './promoCodes.component';
import { ALL_PROMO_CODE_CONST, COMMON_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import UtilsHelper from 'app/common/services/utilsHelper';

const AllPromoCodes = ({
  searchValue,
  setTabBarAllPromoCodesCount,
  changeActiveTab,
  setToBeEditedData,
  setSearchValue,
  setTitle,
}) => {
  let dt = useRef();
  const limit = useRef(20).current;

  const [data, setData] = useState([]);

  const [lastKey, setLastKey] = useState('');
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [prevIds, setPrevIds] = useState([]);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [showDeleteDialog, hideDeleteDialog] = useState(false);

  const [toBeDeletedCode, setToBeDeletedCode] = useState(null);

  useEffect(() => {
    setTitle(tabTitle.all);
    return () => setSearchValue('')
  }, []);

  useEffect(onLoad, [searchValue]);

  function onLoad() {
    if (searchValue.trim() !== '') {
      getPromoCodes({
        status: 'active',
        promoname: searchValue,
        lastkeytimestamp: '',
      }).then((res) => {
        if (res.status === 200) {
          setTabBarAllPromoCodesCount(res.data.promoCodes.length);

          dt.current.state.rows = res.data.promoCodes.length;
          setData(res.data.promoCodes);
        }
      });
    } else {
      dt.current.state.rows = limit;

      getPromoCodes({
        status: 'active',
        promoname: '',
        lastkeytimestamp: '',
      }).then((res) => {
        if (res.status === 200) {
          setTabBarAllPromoCodesCount(res.data.promoCodes.length);

          let length = Math.ceil(res?.data?.promoCodes.length / limit);

          const _pagination = {
            pages: [],
            count: res.data.promoCodes, // get total promos count from resp
          };
          for (let i = 1; i <= length; i++) {
            _pagination.pages.push({
              page: i,
              displayPage: i,
              active: i === 1 ? true : false,
            });
          }

          const pIds = [...prevIds];
          pIds.push(res?.data?.lastKey);

          setLastKey(res.data?.lastKey);
          setPrevIds(pIds);
          setPagination(_pagination);
          setData(res.data.promoCodes);
        }
      });
    }
  }

  const onEdit = (data) => {
    setToBeEditedData(data);
    changeActiveTab(tabNames.generate)
  };

  const cancelDelete = () => {
    setToBeDeletedCode(null);
    hideDeleteDialog(false);
  };

  const onDelete = (promoCode) => {
    setToBeDeletedCode(promoCode);
    hideDeleteDialog(true);
  };

  const deleteCode = () => {
    deletePromoCode(toBeDeletedCode).then((res) => {
      if (res.status === 200) {
        const _data = _.clone(data);
        _data.splice(_.indexOf(_data, toBeDeletedCode), 1);

        setTabBarAllPromoCodesCount(_data.length);
        setData(_data);
      }
      hideDeleteDialog(false);
    });
  };

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({...pagination, pages: __pages});
  };

  const onPageAllAccounts = (event) => {
    if (event.first > first) {
      getPromoCodes({
        status: 'active',
        promoname: '',
        lastkeytimestamp: lastKey,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }
        setTabBarAllPromoCodesCount(res.data.promoCodes.length);

        const ids = [...prevIds];
        ids[event.page] = lastKey;

        let count = Math.ceil(res?.data?.promoCodes.length / limit);
        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + limit / 2;

          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled = index + 1 > count ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res?.data?.promoCodes);

        setLastKey(res?.data?.lastkey);
        setPrevIds(_.clone(ids));
      });
    }
    if (event.first < first) {
      getPromoCodes({
        status: 'active',
        promoname: '',
        lastkeytimestamp: prevIds[event.page],
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }
        setTabBarAllPromoCodesCount(res.data.promoCodes.length);

        const ids = [...prevIds];
        ids.splice(event.page + 1);

        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res?.data?.promoCodes);

        setLastKey(res?.data?.lastkey);
        setPrevIds(_.clone(ids));
      });
    }
  };

  const onPreviousPage = () => {
    console.log(first,pages)
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
        className={styles.allPromoDataTableStyle}
        responsive
        paginator
        // rows={20}
        rows={searchValue === '' ? limit : data.length}
        totalRecords={data.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="id"
        ref={dt}
        sortOrder={1}
      >
        <Column
          sortable
          field="codeName"
          header={COMMON_CONST.NAME}
          headerClassName={styles.allPromoNameHeaderStyle}
          className={styles.allPromoNameStyle}
        />
        <Column
          sortable
          field="discountPercentage"
          header={ALL_PROMO_CODE_CONST.DISCOUNT}
          headerClassName={styles.allPromoDiscountHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => `${rowData['discountPercentage']}%`}
        />
        <Column
          sortable
          field="validFrom"
          header={ALL_PROMO_CODE_CONST.VALID_FROM}
          headerClassName={styles.allPromoDiscountHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) =>
            `${dayjs(rowData['validFrom']).format('DD.MM.YY')}`
          }
        />
        <Column
          sortable
          field="validTo"
          header={ALL_PROMO_CODE_CONST.VALID_TO}
          headerClassName={styles.allPromoDiscountHeaderStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => `${dayjs(rowData['validTo']).format('DD.MM.YY')}`}
        />
        <Column
          sortable
          field="usedCount"
          header={ALL_PROMO_CODE_CONST.USED_TIMES}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
        />
        <Column
          field="allUsers"
          header={ALL_PROMO_CODE_CONST.AVAILABLE_TO_ALL}
          headerClassName={styles.allPromoUsedTimesStyle}
          className={styles.allPromoDiscountStyle}
          body={(rowData) => `${rowData['allUsers'] ? 'Yes' : 'No'}`}
        />
        <Column
          field="codeType"
          header={ALL_PROMO_CODE_CONST.TYPE}
          headerClassName={styles.allPromoTypeStyle}
          className={styles.allPromoDiscountStyle}
        />
        <Column
          field="notes"
          header={COMMON_CONST.NOTES}
          headerClassName={styles.allPromoNotesStyle}
          className={styles.allPromoDiscountStyle}
        />
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PROMO_EDIT) && 
        <Column
          header={ALL_PROMO_CODE_CONST.EDIT}
          headerClassName={styles.allPromoEditStyle}
          body={(rowData) => (
            <button
              className="btn btn-light btn-pill"
              onClick={() => onEdit(rowData)}
            >
              {COMMON_CONST.EDIT}
            </button>
          )}
        />
        }
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PROMO_DELETE) && 
        <Column
          header={COMMON_CONST.DELETE}
          headerClassName={styles.allPromoDeleteStyle}
          body={(rowData) => (
            <button
              className="btn btn-danger btn-pill"
              onClick={() => onDelete(rowData)}
            >
              {COMMON_CONST.DELETE}
            </button>
          )}
        />
        }
      </DataTable>
      <Dialog
        className={`len-dialog confirm-dialog ${styles.allDeleteDialogStyle}`}
        closable={false}
        header={
          <h4 className="len-header len-header-xs bold mb-0">
            {ALL_PROMO_CODE_CONST.DELETE_PROMO_CODE_TITLE}
          </h4>
        }
        footer={
          <div className="d-flex">
            <button
              type="button"
              className="btn btn-primary btn-pill"
              onClick={deleteCode}
            >
              {COMMON_CONST.DELETE}
            </button>

            <button
              className="btn btn-dark btn-pill mx-3"
              type="button"
              onClick={cancelDelete}
            >
              {ALL_PROMO_CODE_CONST.NEVER_MIND}
            </button>
          </div>
        }
        visible={showDeleteDialog}
        modal={true}
        onHide={cancelDelete}
      >
        <p>
          {ALL_PROMO_CODE_CONST.DELETE_PROMO_CODE_SUB_TEXT}
        </p>
      </Dialog>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames('pagination', styles.moveRight)}>
          {searchValue === '' && (
            <>
            {console.log("pagination_pages",pagination?.pages?.length)}
              {pagination?.pages?.length>0 &&paginatorLeft}
              {pagination.pages?.map((page, index) => {
                let classes = classNames('page-link', styles.pageNumbers);
                if (page.active)
                  classes = classNames(
                    'page-link',
                    styles.pageNumbers,
                    styles.activeGreen
                  );
                if (page.disabled)
                  classes = classNames(
                    'page-link',
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
                {pagination?.pages?.length>0 &&paginatorRight}
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default AllPromoCodes;

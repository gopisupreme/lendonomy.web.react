import classNames from 'classnames';
import dayjs from 'dayjs';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'underscore';
import { getPromoCodes } from '../../../common/api/promocodes.api';
import { tabTitle } from './promoCodes.component';
import styles from './promocodestyles.module.scss';
import { getCountryPoint } from 'app/common/config/config';
import { DELETE_PROMO_CODE_CONST, COMMON_CONST, ALL_PROMO_CODE_CONST } from 'app/common/constants/constant';

const Deleted = ({ searchValue, setSearchValue, setTitle }) => {
  let dt = useRef();
  const limit = useRef(20).current;

  const [data, setData] = useState([]);

  const [lastKey, setLastKey] = useState('');
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [prevIds, setPrevIds] = useState([]);

  const [totalDiscGiven, setTotalDiscGiven] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  useEffect(() => {
    setTitle(tabTitle.history);
    return () => setSearchValue('');
  }, []);

  useEffect(onLoad, [searchValue]);

  function onLoad() {
    if (searchValue.trim() !== '') {
      getPromoCodes({
        promoname: searchValue,
        status: 'expired',
        lastkeytimestamp: '',
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        dt.current.state.rows = res?.data?.promoCodes.length;

        setTotalDiscGiven(res?.data.totalDiscounts);
        setData(res?.data?.promoCodes);
      });
    } else {
      dt.current.state.rows = limit;

      getPromoCodes({
        promoname: '',
        status: 'expired',
        lastkeytimestamp: '',
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }
        let length = Math.ceil(res?.data?.promoCodes.length / limit);
        const _pagination = {
          pages: [],
          count: res.data.totalCounts,
        };

        for (let i = 1; i <= length; i++) {
          _pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false,
          });
        }

        const _prevIds = [...prevIds];
        _prevIds.push(lastKey);

        setPrevIds(_prevIds);
        setLastKey(res?.data?.lastKey);
        setPagination(_pagination);

        setTotalDiscGiven(res?.data.totalDiscounts);
        setData(res?.data?.promoCodes);
      });
    }
  }

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
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

  const onNextPage = () => {
    const event = {
      first: first + limit,
      page: pages + 1,
    };

    setPages(event.page);

    dt.current.state.first = 0;

    onPageAllAccounts(event);
  };

  const onPageAllAccounts = (event) => {
    if (event.first > first) {
      getPromoCodes({
        promoname: '',
        status: 'expired',
        lastkeytimestamp: lastKey,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        const _prevIds = [...prevIds];
        prevIds.push(lastKey);

        let count = Math.ceil(res?.data?.promoCodes.length / limit);

        const _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + limit / 2;

          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled = index + 1 > count ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);

        setTotalDiscGiven(res?.data.totalDiscounts);
        setData(res?.data?.promoCodes);

        setLastKey(res?.data?.lastKey);
        setPrevIds(_.clone(_prevIds));
      });
    }
    if (event.first < first) {
      getPromoCodes({
        promoname: '',
        status: 'expired',
        lastkeytimestamp: lastKey,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        const _prevIds = [...prevIds];
        _prevIds.splice(event.page, 1);

        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);

        setTotalDiscGiven(res?.data.totalDiscounts);
        setData(res?.data?.promoCodes);

        setLastKey(res?.data?.lastKey);
        setPrevIds(_.clone(_prevIds));
      });
    }
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
      disabled={lastKey === ''}
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
        className={styles.deleteDataTableStyle}
        responsive
        paginator
        paginatorTemplate=""
        rows={searchValue === '' ? limit : data.length}
        totalRecords={data.length}
        selectionMode="single"
        dataKey="id"
        ref={dt}
        sortOrder={1}
      >
        <Column
          sortable
          field="codeName"
          header={COMMON_CONST.NAME}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
        />
        <Column
          sortable
          field="discountPercentage"
          header={ALL_PROMO_CODE_CONST.DISCOUNT}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
          body={(rowData) => `${rowData['discountPercentage']}%`}
        />
        <Column
          sortable
          field="validFrom"
          header={ALL_PROMO_CODE_CONST.VALID_FROM}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
          body={(rowData) => dayjs(rowData['validFrom']).format('DD.MM.YY')}
        />
        <Column
          sortable
          field="validTo"
          header={ALL_PROMO_CODE_CONST.VALID_TO}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
          body={(rowData) => dayjs(rowData['validTo']).format('DD.MM.YY')}
        />
        <Column
          sortable
          field="usedCount"
          header={ALL_PROMO_CODE_CONST.USED_TIMES}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
        />

        <Column
          sortable
          field="totalDiscounts"
          header={`${DELETE_PROMO_CODE_CONST.TOTAL_DISCOUNT_GIVEN} (${totalDiscGiven} ${getCountryPoint(true)})`}
          headerClassName={styles.deleteNameHeaderStyle}
          className={styles.deleteNameColumnStyle}
          body={(rowData) => `${rowData['totalDiscounts'].toFixed(2)} ${getCountryPoint(true)}`}
        />
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames('pagination', styles.moveRight)}>
          {searchValue === '' && (
            <>
              {paginatorLeft}
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
                    className={`page-item mr-3 ${(page.active && classNames(styles.activeGreen),
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
          )}
        </ul>
      </nav>
    </>
  );
};

export default Deleted;

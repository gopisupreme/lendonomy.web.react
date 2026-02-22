import classNames from 'classnames';
import dayjs from 'dayjs';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import React, {useEffect, useRef, useState} from 'react';
import _ from 'underscore';
import {getPromoCodesHistory} from '../../../common/api/promocodes.api';
import {tabTitle} from './promoCodes.component';
import styles from './promocodestyles.module.scss';
import {getCountryPoint} from 'app/common/config/config';
import { HISTORY_PROMO_CODE_CONST, COMMON_CONST, ALL_PROMO_CODE_CONST } from 'app/common/constants/constant';

const History = ({selectedOption, setSelectedOption, setOptions, setTitle}) => {
  let dt = useRef();
  const limit = useRef(20).current;

  const [data, setData] = useState([]);
  const [finalMatchFee, setFinalMatchFee] = useState(0);
  const [actualMatchFee, setActualMatchFee] = useState(0);

  const [lastKeyCode, setLastKeyCode] = useState('');
  const [lastKeyTimeStamp, setLastKeyTimeStamp] = useState('');
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);

  const [prevKeyCodes, setPrevCodes] = useState([]);
  const [prevKeyTimeStamps, setPrevKeyTimeStamps] = useState([]);

  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });
  const dataVisibilityTooltip = 15;

  useEffect(() => {
    setTitle(tabTitle.history);

    return () => {
      setSelectedOption(null);
      setOptions([]);
    };
  }, []);

  useEffect(onLoad, [selectedOption]);

  function onLoad() {
    if (selectedOption) {
      getPromoCodesHistory({
        promoname: selectedOption,
        lastKeyCodeName: '',
        lastKeyTimeStamp: '',
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        setOptions(res?.data?.distinctCodes);

        if (res?.data?.codeList) {
          dt.current.state.rows = res?.data?.codeList?.length;
          setData(res.data?.codeList);
        } else {
          dt.current.state.rows = 0;
          setData([]);
        }

        setFinalMatchFee(res.data.finalMatchFee);
        setActualMatchFee(res.data.actualMatchFee);
      });
    } else {
      dt.current.state.rows = limit;

      getPromoCodesHistory({
        promoname: '',
        lastKeyCodeName: '',
        lastKeyTimeStamp: '',
      }).then((res) => {
        console.log(res);
        if (res.status !== 200) {
          return;
        }

        setOptions(res?.data?.distinctCodes);

        let length = Math.ceil(res?.data?.codeList.length / limit);
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

        const _prevKeyCodes = [...prevKeyCodes];
        const _prevKeyTimeStamps = [...prevKeyTimeStamps];

        _prevKeyCodes.push(lastKeyCode);
        _prevKeyTimeStamps.push(lastKeyTimeStamp);

        setPrevCodes(_prevKeyCodes);
        setPrevKeyTimeStamps(_prevKeyTimeStamps);

        setLastKeyTimeStamp(res?.data?.lastKeyTimeStamp);
        setLastKeyCode(res?.data?.lastKeyCode);
        setPagination(_pagination);

        setFinalMatchFee(res.data.finalMatchFee);
        setActualMatchFee(res.data.actualMatchFee);
        setData(res.data.codeList);
      });
    }
  }

  console.log(selectedOption);

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({...pagination, pages: __pages});
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
      getPromoCodesHistory({
        promoname: '',
        lastKeyCodeName: lastKeyCode,
        lastKeyTimeStamp: lastKeyTimeStamp,
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }
        setOptions(res?.data?.distinctCodes);

        const prevIds1 = _.clone(prevKeyCodes);
        const prevIds2 = _.clone(prevKeyTimeStamps);

        prevIds1[event.page] = lastKeyCode;
        prevIds2[event.page] = lastKeyTimeStamp;

        let count = Math.ceil(res?.data?.codeList.length / limit);

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

        setFinalMatchFee(res.data.finalMatchFee);
        setActualMatchFee(res.data.actualMatchFee);
        setData(res?.data?.codeList);

        setLastKeyCode(res?.data?.lastKeyCode);
        setLastKeyTimeStamp(res?.data?.lastKeyTimeStamp);

        setPrevCodes(_.clone(prevIds1));
        setPrevKeyTimeStamps(_.clone(prevIds2));
      });
    }
    if (event.first < first) {
      getPromoCodesHistory({
        promoname: '',
        lastKeyCodeName: prevKeyCodes[event.page],
        lastKeyTimeStamp: prevKeyTimeStamps[event.page],
      }).then((res) => {
        if (res.status !== 200) {
          return;
        }

        setOptions(res?.data?.distinctCodes);

        const prevIds1 = [...prevKeyCodes];
        const prevIds2 = [...prevKeyTimeStamps];

        prevIds1.splice(event.page + 1);
        prevIds2.splice(event.page + 1);

        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);

        setFinalMatchFee(res?.data?.finalMatchFee);
        setActualMatchFee(res.data?.actualMatchFee);
        setData(res?.data?.codeList);

        setLastKeyCode(res?.data?.lastKeyCode);
        setLastKeyTimeStamp(res?.data?.lastKeyTimeStamp);

        setPrevCodes(_.clone(prevIds1));
        setPrevKeyTimeStamps(_.clone(prevIds2));
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
      disabled={lastKeyCode === '' && lastKeyTimeStamp === ''}
      className="btn btn-dark btn-pill ml-4"
      onClick={onNextPage}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  const profile = (rowData, column) => {
    console.log(rowData);
    return (
      <div className="row">
        {rowData?.picture && (
          <div className={classNames('pr-0', 'col-sm-6')}>
            <img
              style={{width: '48px', height: '48px', borderRadius: '24px'}}
              src={
                rowData.picture
                // "https://png.pngtree.com/png-vector/20190704/ourmid/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg"
              }
            />
          </div>
        )}
        <div className={`col-sm-6 pr-0 pl-0 ${styles.pPoppins}`}>
          <div>
            <p className={'text-truncate text-left mb-0'}>{rowData.name}</p>
            <p className={'text-truncate text-left mb-0 ml-2'}>
              {rowData.surname}
            </p>
          </div>
        </div>
      </div>
    );
  };

  console.log(data);

  return (
    <>
      <DataTable
        value={data}
        emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
        scrollHeight="400px"
        scrollable={true}
        className={styles.historyDataTableStyle}
        responsive
        paginator
        rows={!selectedOption ? limit : data.length}
        paginatorTemplate=""
        totalRecords={data.length}
        selectionMode="single"
        dataKey="id"
        sortOrder={1}
        ref={dt}
      >
        <Column
          sortable
          field="name"
          header={COMMON_CONST.NAME}
          headerClassName={styles.historyNameHeaderStyle}
          className={styles.historyNameColumnStyle}
          // body={profile}
          body={(rowData) => `${rowData.name} ${rowData.surname}`}
        />

        <Column
          field="email"
          header={COMMON_CONST.CONTACTS}
          headerClassName={styles.historyContactHeaderStyle}
          className={styles.historyNameColumnStyle}
          body={(rowData) => (
            <>
            {rowData.email.length > dataVisibilityTooltip ? 
            <div className="d-flex flex-column">
              <p title={rowData.phoneNumber}>{rowData?.phoneNumber}</p>
              <p className="m-0 text-truncate" title={rowData.email}>{rowData?.email}</p>
            </div>
            :
            <div className="d-flex flex-column">
              <p>{rowData?.phoneNumber}</p>
              <p className="m-0 text-truncate">{rowData?.email}</p>
            </div>
            }
            </>
          )}
        />
        <Column
          field="codeName"
          header={HISTORY_PROMO_CODE_CONST.PROMO_CODE}
          headerClassName={styles.historyNameHeaderStyle}
          className={styles.historyNameColumnStyle}
        />

        <Column
          field="discountPercentage"
          header={ALL_PROMO_CODE_CONST.DISCOUNT}
          headerClassName={styles.historyDiscountHeaderStyle}
          className={styles.historyDiscountColumnStyle}
          body={(rowData) => `${rowData['discountPercentage']}%`}
        />

        <Column
          field="usedDate"
          header={HISTORY_PROMO_CODE_CONST.DATE_USED}
          headerClassName={styles.historyNameHeaderStyle}
          className={styles.historyNameColumnStyle}
          body={(rowData) => dayjs(rowData['usedDate']).format('DD.MM.YY')}
        />

        <Column
          field="actualMatchFee"
          header={`${HISTORY_PROMO_CODE_CONST.BMF_BEFORE_DISCOUNT} (${actualMatchFee} ${getCountryPoint(true)})`}
          headerClassName={styles.historyNameHeaderStyle}
          className={styles.historyNameColumnStyle}
        />

        <Column
          field="finalMatchFee"
          header={`${HISTORY_PROMO_CODE_CONST.FINAL_BMF} (${finalMatchFee} ${getCountryPoint(true)})`}
          headerClassName={styles.historyNameHeaderStyle}
          className={styles.historyNameColumnStyle}
        />
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames('pagination', styles.moveRight)}>
          {!selectedOption && (
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
          )}
        </ul>
      </nav>
    </>
  );
};

export default History;

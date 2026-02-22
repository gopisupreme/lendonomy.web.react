import { GetNotificatioRiskyLoans } from 'app/common/api/Notification.api';
import contentAction from 'app/store/actions/Notification.list';
import { Column } from 'primereact/column';
import classNames from 'classnames';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { clone } from 'underscore';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './riskassessment.module.scss';
import ActiveLoanDialog from './ActiveLoan.dialog.component'
import { COMMON_CONST, NOTIFICATION_ACTIVE_LOAN_CONST, ANALYTICS_DIALOG_CONST } from 'app/common/constants/constant';

const ActiveLoans = (props) => {
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
  const dataVisibilityTooltip = 15;

  const dt = React.useRef();
  const limit = React.useRef(20).current;

  React.useEffect(() => {
    if (history?.location?.state?.Status) {
      props.TabControl(history?.location?.state?.Status);
      history.location.state = '';
    }
  }, []);

  React.useEffect(onload, [props.status, props.Search]);

  function onload() {
    const tempUserData = JSON.parse(localStorage?.okta_userdata);
    dt.current.state.rows = limit;
    var data = {};
    data.payload = {
      status: props.status,
      searchValue: props.Search ? props.Search : '',
      lastLoan: '',
      lastDate: 0,
      adminUser: tempUserData?.userName, // additionally added this key
    };
    GetNotificatioRiskyLoans(data).then((res) => {
      if (res.status === 200) {
        props.triggerAction(props.status, res?.data?.notification);
        dispatch(
          contentAction.NotificationCount({ status: res?.data?.notification })
        );
        let length = Math.ceil(res?.data?.loans.length / limit);
        const _pagination = {
          pages: [],
          count: res?.data?.loans?.length,
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

        setData(clone(res?.data?.loans));
      }
    });
  }

  const onPageTransactions = (event) => {
    // const tempUserData = JSON.parse(sessionStorage?.okta_userdata);
    const tempUserData = JSON.parse(localStorage?.okta_userdata);
    if (event.first > first) {
      var data = {};
      data.payload = {
        status: props.status,
        searchValue: props.Search ? props.Search : '',
        lastLoan: state.lastLoan ? state.lastLoan : '',
        lastDate: state.lastDate ? state.lastDate : 0,
        adminUser: tempUserData?.userName, // additionally added this key
      };
      GetNotificatioRiskyLoans(data).then((res) => {
        if (res.status !== 200) {
          return;
        }
        let count = Math.ceil(res?.data?.risks.length / limit);

        const _pagination = clone(pagination);

        _pagination['pages'] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + limit / 2;

          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled = index + 1 > count ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setState(res?.data);
        setData(res?.data?.loans);

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
        searchValue: props.Search ? props.Search : '',
        lastLoan: _prev.lastLoan ? _prev.lastLoan : '',
        lastDate: _prev.lastDate ? _prev.lastDate : 0,
        adminUser: tempUserData?.userName, // additionally added this key
      };
      GetNotificatioRiskyLoans(data).then((res) => {
        if (res.status !== 200) {
          return;
        }

        let _pagination = clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - limit / 2;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setState(res?.data);
        setData(res?.data?.loans);

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
      className='btn btn-dark btn-pill mr-4'
      onClick={() => onPreviousPage()}>
      {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
    </button>
  );

  const paginatorRight = (
    <button
      disabled={endReached}
      className='btn btn-dark btn-pill ml-4'
      onClick={() => onNextPage()}>
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
  };

  const navigateToProfile = (e, from) => {
    history.push({
      pathname: '/admin/Notifications/induvidual',
      state: {
        userData: e,
        Status: props.status,
        showBlockUnBlock: true,
      },
    });
  };

  const ShowTable = (item) => {
    return item?.length > 0 ? styles.actTableBlockStyle : styles.actDataTableNoneStyle;
  };

  const ShowTitle = (item) => {
    return item?.length > 0 ? false : true;
  };

  const Subtitle = (props) => {
    let subTitle = `Active Loans as on ${state?.processedDay}, ${state?.processedDate}`;
    return subTitle;
  };

  const NoData = (props) => {
    let subTitle = 'There are no Active loans on the platform.';
    return subTitle;
  };


  const onSortAllAccount = (event) => {
    var sorteduser = [];
    if (event.sortField === 'borrName') {
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

  const getContractDetails = (loanPreProcess) => {
    if (loanPreProcess?.revisedContract && loanPreProcess?.revisedContract.lenderSigned && loanPreProcess?.revisedContract.borrowerSigned) {
      return loanPreProcess?.revisedContract
    }
    else {
      return loanPreProcess?.loanContract
    }

  }

  const openContractModal = (item) => {
    const { loanPreProcess } = item;
    const AggrementDetails = getContractDetails(loanPreProcess)
    let contractList = AggrementDetails?.contractEnglish
      ? AggrementDetails?.contractEnglish
      : AggrementDetails?.contract;
    setSelectedList(contractList);
    setSelectedData(item);
    showModal(true);
  };

  return (
    <>
      <ActiveLoanDialog
        visible={Modal}
        borrowerId={selectedData?.borrowerId}
        userId={selectedData?.id}
        BorrowerName={selectedData?.bName + ' ' + selectedData?.bSurname}
        LenderName={selectedData?.lName + ' ' + selectedData?.lSurname}
        dueDate={selectedData?.dueDate}
        selectedList={selectedList}
        onHide={() => showModal(false)}
      />
      <div className='len-datatable'>
        {ShowTitle(data) ? (
          <p className={styles.subTitleNOLoan}>{NoData(props)}</p>
        ) : (
          <p className={styles.subTitle}>{Subtitle(props)}</p>
        )}
        <DataTable
          value={data}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          scrollHeight='400px'
          scrollable={true}
          // style={{ width: '100%', display: ShowTable(data) }}
          className={`${styles.actDataTableStyle} ${ShowTable(data)}`}
          responsive
          paginator
          rows={data?.length}
          totalRecords={data?.length}
          onSort={onSortAllAccount}
          paginatorTemplate=' '
          selectionMode='single'
          dataKey='id'
          ref={dt}
          // onSelectionChange={(e) => navigateToProfile(e, "all")}
          sortOrder={1}>
            <Column
            header=''
            headerClassName={styles.actTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.bImg && (
                    <img
                      className={styles.actTableProfileImgStyle}
                      src={rowData.bImg}
                    />
                  )}
                {/* </div> */}
                </>
            )}
          />  
          <Column
            field='borrName'
            header='borrower name'
            sortable
            headerClassName={styles.actTableBnameHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <>
              {rowData.bName?.length + rowData.bSurname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? 
              <div
                // className='pr-3'
                onClick={() => navigateToProfile(rowData.borrowerId)}>
                    <p className={'text-truncate mb-0'} title={`${rowData.bName} ${rowData.bSurname}`}>
                      {rowData.bName} {rowData.bSurname}
                    </p>
                  </div>
                  :
                  <div
                // className='pr-3'
                onClick={() => navigateToProfile(rowData.borrowerId)}>
                    <p className={'text-truncate mb-0'}>
                      {rowData.bName} {rowData.bSurname}
                    </p>
                  </div>
                  }
              </>
            )}
          />
          <Column
            field='phone'
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.actTableContactHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <>
                {rowData.bEmail.length > dataVisibilityTooltip ? 
              <div className={`d-flex flex-column ${styles.actTableBnameColumnStyle}`} >
                <p className='mb-0 text-dark' title={rowData.bPhone}>{rowData.bPhone}</p>
                <p
                  className={`mb-0 text-truncate text-dark ${styles.actTableContactValueStyle}`}
                  title={rowData.bEmail}>
                  {rowData.bEmail}
                </p>
              </div>
              :
              <div className={`d-flex flex-column ${styles.actTableBnameColumnStyle}`} >
              <p className='mb-0 text-dark'>{rowData.bPhone}</p>
              <p
                className={`mb-0 text-truncate text-dark ${styles.actTableContactValueStyle}`}
                >
                {rowData.bEmail}
              </p>
              </div>
              }
              </>
            )}
          />
           <Column
            header=''
            headerClassName={styles.actTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.lImg && (
                    <img
                      className={styles.actTableProfileImgStyle}
                      src={rowData.lImg}
                    />
                  )}
                {/* </div> */}
                </>
            )}
          />  
          <Column
            field='lendName'
            header='Investor name'
            headerClassName={styles.actTableBnameHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <>
               {rowData.lName?.length + rowData.lSurname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP? 
              <div
                // className='pr-3'
                onClick={() => navigateToProfile(rowData.lenderId)}>
                    <p className={'text-truncate mb-0'} title={`${rowData.lName} ${rowData.lSurname}`}>
                      {rowData.lName} {rowData.lSurname}
                    </p>
                  </div>
                  :
                  <div
                // className='pr-3'
                onClick={() => navigateToProfile(rowData.lenderId)}>
                    <p className={'text-truncate mb-0'}>
                      {rowData.lName} {rowData.lSurname}
                    </p>
                  </div>
                  }
              </>  
            )}
          />
          <Column
            field='id'
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOANID}
            headerClassName={styles.actTableContactHeaderStyle}
            className={styles.actTableBnameColumnStyle}
          />
          <Column
            field='loanId'
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOAN_AMOUNT}
            headerClassName={styles.actTableContactHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <p className='mb-0 text-dark'>
                {`${rowData?.loanPreProcess?.requestedAmount} ${rowData?.loanPreProcess?.bCurrency}`}
              </p>
            )}
          />
          <Column
            field='createdOn'
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_DATE_LOAN_WAS_TAKEN}
            headerClassName={styles.actTableContactHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <p className='mb-0 text-dark'>
                {dayjs.utc(rowData.createdOn).format('DD.MM.YYYY')}
              </p>
            )}
          />
          <Column
            field='dueDate'
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_LOAN_DUE_DATE}
            headerClassName={styles.actTableContactHeaderStyle}
            className={styles.actTableBnameColumnStyle}
            body={(rowData) => (
              <p className='mb-0 text-dark'>
                {dayjs.utc(rowData.dueDate).format('DD.MM.YYYY')}
              </p>
            )}
          />
          <Column
            field='Loan Contract'
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_CONTRACT}
            headerClassName={styles.actTableContractHeaderStyle}
            body={(rowData) => (
              <p
                className={`mb-0 text-dark ${styles.actTableContractValueStyle}`}
                onClick={() => {
                  openContractModal(rowData);
                }}>
                {'VIEW'}
              </p>
            )}
          />
        </DataTable>
      </div>
      <nav
        // style={{ display: ShowTable(data) }}
        aria-label='...'
        className={`mr-auto pt-5 ${ShowTable(data)}`}>
        <ul className={classNames('pagination', styles.moveRight)}>
          {
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
                      }`}>
                    <span
                      className={classes}
                      onClick={(e) =>
                        !page?.disabled && onPageChange(page, index)
                      }>
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

export default ActiveLoans;

import ContentTable from 'app/common/components/Content-table/content-table.component';
import Header from 'app/common/components/Header/header.component';
import APP_CONST from 'app/common/constants/app.constant'; 
import { GetNotificatioRiskyLoans } from 'app/common/api/Notification.api';
import { Storagehelper } from 'app/common/shared/utils';
import contentAction from 'app/store/actions/Notification.list';
import { Column } from 'primereact/column';
import classNames from 'classnames';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { clone } from 'underscore';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './riskassessment.module.scss';
import {getCountryPoint} from 'app/common/config/config';
import { COMMON_CONST, NOTIFICATION_MATCHING_FEE_ALERT_CONST, NOTIFICATION_ACTIVE_LOAN_CONST, RISK_ASSESSMENT_PEP_TABLE_CONST } from 'app/common/constants/constant';
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
  const dt = React.useRef();
  const limit = React.useRef(20).current;
  const dataVisibilityTooltip = 15;

  React.useEffect(() => {
    if (history?.location?.state?.Status) {
      props.TabControl(history?.location?.state?.Status);
      history.location.state = "";
    }
  }, []);

  React.useEffect(onload, [props.status, props.Search]);

  function onload() {
    // const tempUserData = JSON.parse(sessionStorage?.okta_userdata);
    const tempUserData = JSON.parse(localStorage?.okta_userdata);
    dt.current.state.rows = limit;
    var data = {};
    data.payload = {
      status: props.status, // For new users tab "NEW_USERS"
      searchValue: props.Search ? props.Search : '',
      lastLoan: '',
      lastDate: 0,
      adminUser: tempUserData?.userName,
      lastEvaluatedKey: '', // represents "userId" -> added for "NEW_USERS" pagination
      lastRegisteredOn: '', // added for "NEW_USERS" pagination
    };
    GetNotificatioRiskyLoans(data).then((res) => {
      if (res.status === 200) {
        props.triggerAction(props.status, res?.data?.notification);
        dispatch(
          contentAction.NotificationCount({ status: res?.data?.notification })
        );
        let _length = Math.ceil(res?.data?.risks.length / limit);
        const _pagination = {
          pages: [],
          count: res?.data?.risks?.length,
        };

        for (let i = 1; i <= _length; i++) {
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

        setData(clone(res?.data?.risks));
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
    // if (!e.value) return;
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
    return item?.length > 0 ? styles.mfeeTableBlockStyle : styles.mfeeDataTableNoneStyle;
  };

  const ShowTitle = (item) => {
    return item?.length > 0 ? false : true;
  };

  const RiskDescription = () => (
    <table className={styles.table}>
      <tbody>
        <tr>
          <th>{RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPES_HEADER}</th>
          <th>{RISK_ASSESSMENT_PEP_TABLE_CONST.DESCRIPTION}</th>
        </tr>

        <tr>
          <td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_1}</td>
          <td className={`mt-4 font-weight-bold py-3 px-md-2`}>
            {`${NOTIFICATION_MATCHING_FEE_ALERT_CONST.MATCHING_FEE_TYPE1_DESCRIPTION1} ${getCountryPoint(true)} ${NOTIFICATION_MATCHING_FEE_ALERT_CONST.MATCHING_FEE_TYPE1_DESCRIPTION2}`}
          </td>
        </tr>

        <tr>
          <td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_2}</td>
          <td className={`mt-4 font-weight-bold py-3 px-md-2`}>
            {NOTIFICATION_MATCHING_FEE_ALERT_CONST.MATCHING_FEE_TYPE2_DESCRIPTION1}
          </td>
        </tr>
      </tbody>
    </table>
  );

  const Subtitle = () => {
    let subTitle = `${NOTIFICATION_MATCHING_FEE_ALERT_CONST.USER_WITH_UNPAID_MATCHING_FEE} ${state?.processedDay}, ${state?.processedDate}`;
    return subTitle;
  };

  const NoData = () => {
    let subTitle = `${NOTIFICATION_MATCHING_FEE_ALERT_CONST.NO_USER_WITH_UNPAID_MATCHING_FEE} ${state?.processedDay}, ${state?.processedDate}`;
    return subTitle;
  };


  const onSortAllAccount = (event) => {
   

    var sorteduser = [];
      
        // var sortedUsers = [];
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
        setSortMeta(updatedMeta)
        setData(sorteduser)
      };
    

  return (
    <>
      <div className='len-datatable'>
        <div className='d-flex justify-content-center pt-5 pb-5'>
          {data?.length > 0 && <RiskDescription />}
        </div>
        {ShowTitle(data) ? (
          <p className={styles.subTitleNOLoan}>{NoData()}</p>
        ) : (
          <p className={styles.subTitle}>{Subtitle()}</p>
        )}
        <DataTable
          value={data}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          scrollHeight='400px'
          scrollable={true}
          // style={{ width: '100%', display: ShowTable(data) }}
          className={`${styles.mfeeDataTableStyle} ${ShowTable(data)}`}
          responsive
          paginator
          rows={data?.length}
          totalRecords={data?.length}
          paginatorTemplate=' '
          selectionMode='single'
          onSort={onSortAllAccount}
          dataKey='id'
          ref={dt}
          // onSelectionChange={(e) => navigateToProfile(e, "all")}
          sortOrder={1}>
           <Column
            header=''
            headerClassName={styles.mfeeTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.borrImg && (
                    <img
                      className={styles.mfeeTableProfileImgStyle}
                      src={rowData.borrImg}
                    />
                  )}
                {/* </div> */}
                </>
            )}
          />  
          <Column
            field='borrName'
            sortable
            header={NOTIFICATION_ACTIVE_LOAN_CONST.ACTIVE_LOAN_BORROWER_NAME}
            headerClassName={styles.mfeeTableBnameHeaderStyle}
            body={(rowData) => (
              <>
              {rowData.borrName?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? 
              <div onClick={() => navigateToProfile(rowData.borrId)} >
                  <p className={'text-truncate mb-0'} title={rowData.borrName}>
                  {rowData.borrName}
                </p>
              </div>
              :
              <div onClick={() => navigateToProfile(rowData.borrId)} >
                  <p className={'text-truncate mb-0'}>
                  {rowData.borrName}
                </p>
              </div>
              }
              </> 
            )}
            className={styles.mfeeTableBnameColumnStyle}
          />
          <Column
            field='phone'
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.mfeeTableContactHeaderStyle}
            body={(rowData) => (
              <>
              {rowData.email.length > dataVisibilityTooltip ? 
              <div className='d-flex flex-column'>
                <p className='mb-0 text-dark' title={rowData.phone}>{rowData.phone}</p>
                <p
                  className={`mb-0 text-truncate text-dark ${styles.mfeeTableContactValueStyle}`}
                  title={rowData.email}>
                  {rowData.email}
                </p>
              </div>
              :
              <div className='d-flex flex-column'>
                <p className='mb-0 text-dark'>{rowData.phone}</p>
                <p
                  className={`mb-0 text-truncate text-dark ${styles.mfeeTableContactValueStyle}`}>
                  {rowData.email}
                </p>
              </div>
              }
              </>
            )}
            className={styles.mfeeTableBnameColumnStyle}
          />
          <Column
            field='lendName'
            header={NOTIFICATION_MATCHING_FEE_ALERT_CONST.MATCHING_FEES_ACCRUED}
            headerClassName={styles.mfeeTableContactHeaderStyle}
            body={(rowData) => (
              <div
                className='row'
                onClick={() => navigateToProfile(rowData.lendId)}>
                <div
                  className={`col-sm-8 pr-0 pl-10 mt-10 ${styles.mfeeTableAccuredValueStyle}`}
                  >
                  <p className={'text-truncate text-center mb-0'}>
                    {rowData.amount}
                  </p>
                </div>
              </div>
            )}
          />
          <Column
            field='createdDate'
            header={NOTIFICATION_MATCHING_FEE_ALERT_CONST.REASON_FOR_ALERT}
            headerClassName={styles.mfeeTableContactHeaderStyle}
            body={(rowData) => (
              <p className='mb-0 text-center text-dark'>{rowData.reason}</p>
            )}
          />

          <Column
            field='createdDate'
            header={NOTIFICATION_MATCHING_FEE_ALERT_CONST.DATE_OF_ALERT}
            headerClassName={styles.mfeeTableContactHeaderStyle}
            body={(rowData) => (
              <p className='mb-0 text-center text-dark'>
                {dayjs.utc(rowData.dueDate).format('DD.MM.YYYY')}
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

export default RiskyLoans;

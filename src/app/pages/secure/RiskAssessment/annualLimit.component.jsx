import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ReactComponent as Icon_pencil } from 'assets/icon/icon_pencil.svg';
import { ReactComponent as Icon_tick } from 'assets/icon/icon_tick.svg';
import { default as React, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { clone } from 'underscore';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import {
  getLendingRisk,
  revertConsent,
  updateLendingRiskNotes
} from '../../../common/api/riskassessment.api';
import {getCountryPoint} from 'app/common/config/config';
import {RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST, COMMON_CONST, RISK_ASSESSMENT_PEP_TABLE_CONST, USER_ROLE_CONFIG_KEY} from 'app/common/constants/constant';
import styles from './riskassessment.module.scss';
import { useHistory } from 'react-router-dom';
import UtilsHelper from 'app/common/services/utilsHelper';

dayjs.extend(utc);

const AnnualLimit = ({ searchValue }) => {
  let dt = useRef();
  const mounted = useRef(false);
  const limit = useRef(20).current;
  const history = useHistory();
  const [endReached, setEndReached] = useState(false);
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });
  const [prevUser, setPrevUser] = useState([]);
  const [prevConsent, setPrevConsent] = useState([]);

  const [dialogData, setDialogData] = useState({
    show: false,
    value: null
  });
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({ lastUser: 0, lastConsent: 0 });
  const dataVisibilityTooltip = 15;

  useEffect(() => onLoad('', 0, 0), []);
  useEffect(onSearch, [searchValue]);

  function onSearch() {
    if (mounted.current) {
      setEndReached(false);
      setPages(0);
      setFirst(0);
      setPagination({ ...pagination, pages: [], count: 0 });
      setPrevUser(clone([]));
      setPrevConsent(clone([]));
      setConfig({
        ...config,
        lastUser: 0,
        lastConsent: 0
      });

      onLoad(searchValue, 0, 0);
    }
  }

  function onLoad(...args) {
    dt.current.state.rows = limit;
    getLendingRisk(args[0], args[1], args[2]).then((res) => {
      if (res.status !== 200) {
        return;
      }

      mounted.current = true;

      let length = Math.ceil(res?.data?.riskInvestors.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.riskInvestors.length,
      };

      for (let i = 1; i <= length; i++) {
        _pagination.pages.push({
          page: i,
          displayPage: i,
          active: i === 1 ? true : false,
        });
      }

      const _prevUser = [...prevUser];
      const _prevConsent = [...prevConsent];

      _prevUser.push(config.lastUser);
      _prevConsent.push(config.lastConsent);

      setPagination(_pagination);
      setPrevUser(_prevUser);
      setPrevConsent(_prevConsent);

      if (res.data?.lastUser !== 0 && res.data?.lastConsent !== 0) {
        if (endReached) {
          setEndReached(false);
        }
        setConfig({ ...config, lastUser: res.data.lastUser, lastConsent: res.data.lastConsent });
      } else {
        setEndReached(true)
      }

      setData(clone(res.data.riskInvestors));
    });
  }

  const dataIndex = (rowData) => data.findIndex((e) => e.userId === rowData.userId);

  const handleEditedRow = (rowData) => {
    const d = clone(data);
    d[dataIndex(rowData)] = rowData;
    setData(d);
  };

  const resetLendingConsent = () => {
    const { value } = dialogData;
    revertConsent(value?.userId, value?.flaggedOn).then(res => {
      closeDialog();

      if (res.status !== 200) {
        return;
      }

      const d = clone(data);
      const index = dataIndex(value);
      d.splice(index, 1);
      setData(d);
    });
  }

  const closeDialog = () => setDialogData({ ...dialogData, show: false, value: null });

  const onPageAnnualLimit = (event) => {
    if (event.first > first) {
      getLendingRisk(searchValue, config.lastUser, config.lastConsent).then((res) => {

        if (res.status !== 200) {
          return;
        }

        let count = Math.ceil(res?.data?.riskInvestors.length / limit);

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

        setData(res?.data?.riskInvestors);

        const _prevUser = [...prevUser];
        const _prevConsent = [...prevConsent];

        _prevUser.push(config.lastUser);
        _prevConsent.push(config.lastConsent);

        setPrevUser(_prevUser);
        setPrevConsent(_prevConsent);

        if (res.data?.lastUser !== 0 && res.data?.lastConsent !== 0) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({ ...config, lastUser: res.data.lastUser, lastConsent: res.data.lastConsent });
        } else {
          setEndReached(true)
        }
      });
    }
    if (event.first < first) {
      getLendingRisk(searchValue, prevUser[prevUser.length - 2], prevConsent[prevConsent.length - 2]).then((res) => {
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

        setData(res?.data?.riskInvestors);

        const _prevUser = [...prevUser];
        const _prevConsent = [...prevConsent];

        _prevUser.splice(_prevUser.length - 1, 1);
        _prevConsent.splice(_prevConsent.length - 1, 1);

        setPrevUser(clone(_prevUser));
        setPrevConsent(clone(_prevConsent));

        if (res.data?.lastUser !== 0 && res.data?.lastConsent !== 0) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({ ...config, lastUser: res.data.lastUser, lastConsent: res.data.lastConsent });
        } else {
          setEndReached(true)
        }
      });
    }
  }

  const onPreviousPage = () => {
    const event = {
      first: first - limit,
      page: pages - 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAnnualLimit(event);
  };
  const onNextPage = () => {
    const event = {
      first: first + limit,
      page: pages + 1,
    };

    setPages(event.page);

    dt.current.state.first = 0;

    onPageAnnualLimit(event);
  };

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;
    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
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

  const navigateToProfile = (e, from) => {
    console.log(e,from)
    if (!e) return;
    history.push({
      pathname: '/admin/account/induvidual',
      state: {
        userData: e,
        showBlockUnBlock: true,
        activeTab: from,
        pagination: "",
        search: "",
        lastEvaluatedKey: "",
        first: "",
        prevIds: "",
        pages: "",
        pageEnd: "",
        localFirst: "",
        defaultUserCount: "",
        from:'Risk_Assessment'
      },
    });
  };

  return (
    <>
      <p className={styles.subHeader}>{`${RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.ANNUAL_LIMIT_SUB_HEADER} ${getCountryPoint(true)}`}</p>
      <DataTable
        value={data}
        emptyMessage={`${RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.ANNUAL_TABLE_EMPTY_MSG1} ${getCountryPoint(true)} ${RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.ANNUAL_TABLE_EMPTY_MSG2}`}
        scrollHeight="400px"
        scrollable={true}
        className={styles.annualDataTableStyle}
        responsive
        paginator
        rows={searchValue === '' ? limit : data.length}
        totalRecords={data.length}
        paginatorTemplate=" "
        dataKey="userId"
        ref={dt}
        sortOrder={1}
      >
        <Column
            header=''
            headerClassName={styles.annualTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.image && (
                    <img
                      className={styles.annualTableProfileImgStyle}
                      src={rowData.image}
                    />
                  )}
                {/* </div> */}
                </>
            )}
          /> 
        <Column
          sortable
          field="name"
          header={COMMON_CONST.NAME}
          headerClassName={styles.annualTableNameHeaderStyle}
          className={styles.annualTableNameColumnStyle}
          body={(rowData) => (
            <div className={`${styles.pPoppins}`} onClick={(e) => navigateToProfile(rowData, 'all')}>
               {(rowData?.name?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) || (rowData?.surName?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) ?  
                  <>
                  <p className={'text-truncate mb-0'} title={`${rowData.name} ${rowData.surName}`}>
                    {rowData.name}
                  </p>
                  <p className={'text-truncate mb-0'} title={`${rowData.name} ${rowData.surName}`}>
                    {rowData.surName}
                  </p>
                  </>
                  :
                  <>
                  <p className={'text-truncate mb-0'}>
                    {rowData.name}
                  </p>
                  <p className={'text-truncate mb-0'}>
                    {rowData.surName}
                  </p>
                  </>
                  }
                </div>
          )}
        />
        <Column
          field="Contacts"
          header={COMMON_CONST.CONTACTS}
          headerClassName={styles.annualTableContactHeaderStyle}
          className={styles.annualTableContactColumnStyle}
          body={(rowData) => (
            <>
            {rowData.email.length > dataVisibilityTooltip ? 
            <div className="d-flex flex-column">
              <p className="mb-0" title={rowData.phone}>{rowData.phone}</p>
              <p className={`mb-0 text-truncate ${styles.annualTableContactValueStyle}`} title={rowData.email}>
                {rowData.email}
              </p>
            </div>
            :
            <div className="d-flex flex-column">
              <p className="mb-0">{rowData.phone}</p>
              <p className={`mb-0 text-truncate ${styles.annualTableContactValueStyle}`}>
                {rowData.email}
              </p>
            </div>
            }
            </>
          )}
        />
        <Column
          field="flaggedOn"
          header={RISK_ASSESSMENT_PEP_TABLE_CONST.FLAGGED_ON}
          headerClassName={styles.annualTableFlagHeaderStyle}
          className={styles.annualTableFlagColumnStyle}
          body={(rowData) => <p>{dayjs.utc(rowData.flaggedOn).format("DD.MM.YYYY")}</p>}
          sortable
        />
        <Column
          field="totLendingInYear"
          header={RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.AMOUNT_LEND_ON_LENDWILL}
          headerClassName={styles.annualTableNameHeaderStyle}
          className={styles.annualTableFlagColumnStyle}
          body={rowData => <p>{rowData.totLendingInYear} {getCountryPoint(true)}</p>}
          sortable
        />
        <Column
          field="withinMillion"
          header={`${RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.TOTAL_AMOUNT_LEND_WITHIN_1M} ${getCountryPoint(true)}?`}
          className={styles.annualTableFlagColumnStyle}
          headerClassName={styles.annualTableWithMillHeaderStyle}
          sortable
        />
        <Column
          field="notes"
          header={COMMON_CONST.NOTES}
          className={styles.annualTableFlagColumnStyle}
          headerClassName={styles.annualTableWithMillHeaderStyle}
          body={(rowData) => <NotesComponent {...{ rowData, handleEditedRow }} />}
        />
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.RISK_ANNUAL_RESET_INVEST) && 
        <Column
          header=""
          headerClassName={styles.annualTableResetHeaderStyle}
          bodyClassName={styles.annualTableResetColumnStyle}
          body={(rowData) => (
            <button
              disabled={rowData?.withinMillion === 'YES'}
              className={classNames(
                'btn btn-pill',
                rowData?.withinMillion === 'YES' ? 'btn-light' : 'btn-success',
                styles.center
              )}
              onClick={() => setDialogData({ ...dialogData, value: rowData, show: true })}
            >
              <span className='text-capitalize'>{COMMON_CONST.RESET_INVESTMENT_LIMIT}</span> 
            </button>
          )}
        />
        }
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
        <ul className={classNames('pagination', styles.moveRight)}>
          {
            pagination?.pages?.length > 0 &&
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
          }
        </ul>
      </nav>
      <ConfirmDialog
        visible={dialogData.show}
        header={RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.ANNUAL_DIALOG_HEADER}
        desc={RISK_ASSESSMENT_ANNNUAL_LIMIT_CONST.ANNUAL_DIALOG_SUB_TEXT}
        footer={(
          <div className="text-left">
            <button
              className="btn btn-primary btn-pill"
              onClick={resetLendingConsent}
            >
              {COMMON_CONST.RESET}
            </button>
            <button
              className="btn btn-dark btn-pill"
              onClick={closeDialog}
            >
              {COMMON_CONST.CANCEL}
            </button>
          </div>
        )}
        onHide={closeDialog}
      />
    </>
  );
}

const NotesComponent = ({ rowData, handleEditedRow }) => {
  const { notes } = rowData;

  const touched = useRef(false);

  const [isEditable, setIsEditable] = useState(false);
  const [text, setText] = useState(notes);

  const updateRowData = () => {
    updateLendingRiskNotes(rowData.userId, text, rowData.flaggedOn).then((res) => {
      touched.current = false;
      setIsEditable(false);

      handleEditedRow({ ...rowData, notes: text });
    });
  };

  const updateNotes = ({ target: { value } }) => {
    if (!touched.current) {
      touched.current = true;
    }
    setText(value);
  };

  const revertChanges = () => {
    touched.current = false;
    setText(notes);
    setIsEditable(false);
  };

  return (
    <>
      {!isEditable ? (
        <div className={styles.wrapper}>
          {notes.trim() ?
            <p>{notes}</p> :
            <textarea
              disabled={!isEditable}
              className={classNames('form-control', styles.txtArea, 'mr-3')}
              placeholder={COMMON_CONST.NOTES_TEXT_PLACEHOLDER} />
          }
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.RISK_ANNUAL_RESET_INVEST) && 
          <Icon_pencil onClick={() => setIsEditable(true)} />
          }
        </div>
      ) : (
        <div
          className={styles.annualTableTextAreaStyle}
        >
          <textarea
            autoCapitalize={true}
            onChange={updateNotes}
            value={text}
            className={classNames('form-control', styles.txtArea)}
          />
          <div className={styles.iconCancel} onClick={revertChanges}>
            <Icon_cancel />
          </div>
          <div
            className={classNames(
              styles.iconTick,
              touched.current ? null : styles.disabled
            )}
            onClick={updateRowData}
          >
            <Icon_tick />
          </div>
        </div>
      )}
    </>
  );
};


export default AnnualLimit;
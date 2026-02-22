import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Multiselect from 'multiselect-react-dropdown';
import { clone } from 'underscore';
import classNames from 'classnames';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import { ReactComponent as Icon_lock } from 'assets/icon/icon_lock.svg';
import { ReactComponent as Icon_pencil } from 'assets/icon/icon_pencil.svg';
import { ReactComponent as Icon_tick } from 'assets/icon/icon_tick.svg';
import { ReactComponent as Icon_cancel_close } from 'assets/icon/icon_cancel-close.svg';

import styles from './riskassessment.module.scss';
import { getTransactionsRisk, resolveFlaggedUser, updateTransactionRiskNotes } from 'app/common/api/riskassessment.api';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import {getCountryPoint} from 'app/common/config/config';
import {RISK_ASSESSMENT_TRANSACTION_RISK_CONST, COMMON_CONST, RISK_ASSESSMENT_PEP_TABLE_CONST, USER_ROLE_CONFIG_KEY} from 'app/common/constants/constant';
import UtilsHelper from 'app/common/services/utilsHelper';

dayjs.extend(utc);

const types = [
  { name: 'Type 1', id: 1 },
  { name: 'Type 2', id: 2 },
  { name: 'Type 3', id: 3 },
  { name: 'Type 4', id: 4 },
  { name: 'Type 5', id: 4 },
];
const status = [
  { name: 'Active', id: 1 },
  { name: 'Resolved', id: 2 },
  { name: 'All', id: 3 }
];

const TransactionsRisk = ({ searchValue, setSearchValue }) => {
  const mounted = useRef(false);
  const preventSearch = useRef(false);
  const dataVisibilityTooltip = 15;

  const dt = useRef();
  const limit = useRef(20).current;

  const [endReached, setEndReached] = useState(false);
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [dialogData, setDialogData] = useState({
    show: false,
    data: null
  });
  const [data, setData] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([{ name: 'All', id: 3 }]);

  const [prevConfig, setPrevConfig] = useState([]);
  const [config, setConfig] = useState({
    lastUser: 0,
    lastFlagged: 0,
    lastStatus: ''
  });

  useEffect(() => {
    onLoad(selectedStatus[0].name, '', config.lastUser, config.lastFlagged, config.lastStatus, selectedTypes.map(t => t.name) || []);
  }, []);

  useEffect(onSearchChange, [searchValue]);

  function onSearchChange() {
    if (preventSearch.current) { return; }

    if (mounted.current) {
      console.log('searching....');
      setEndReached(false);
      setPages(0);
      setFirst(0)
      setPagination({
        pages: [],
        count: 0
      });
      setSelectedTypes([]);
      setSelectedStatus([{ name: 'All', id: 3 }]);
      setPrevConfig(clone([]));
      setConfig({
        ...config,
        lastUser: 0,
        lastFlagged: 0,
        lastStatus: ''
      });

      onLoad('All', searchValue, 0, 0, '', []);
    }
  }

  function onLoad(...args) {
    dt.current.state.rows = limit;
    getTransactionsRisk(args[0], args[1], args[2], args[3], args[4], args[5]).then(res => {
      mounted.current = true;
      preventSearch.current = false;

      if (res.status !== 200) return;

      let length = Math.ceil(res?.data?.risks.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.risks.length,
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

      if (res.data?.lastUser) {
        if (endReached) {
          setEndReached(false);
        }
        setConfig({
          ...config,
          lastUser: res.data.lastUser,
          lastFlagged: res.data.lastFlagged,
          lastStatus: res.data.lastStatus,
        });
      } else {
        setEndReached(true);
      }
      setData(clone(res.data.risks));
    });
  };

  const onPageTransactions = (event) => {
    if (event.first > first) {
      getTransactionsRisk(selectedStatus[0].name.toLowerCase(),
        searchValue,
        config.lastUser, config.lastFlagged, config.lastStatus,
        selectedTypes.map(type => type.name) || []
      ).then(res => {

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

        setData(res?.data?.risks);

        const _prevConfig = clone(prevConfig);
        _prevConfig.push(config);

        setPrevConfig(_prevConfig);

        if (res.data?.lastUser) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            lastUser: res.data.lastUser,
            lastFlagged: res.data.lastFlagged,
            lastStatus: res.data.lastStatus,
          });
        } else {
          setEndReached(true);
        }
      });
    }
    if (event.first < first) {
      const _prev = prevConfig[prevConfig.length - 2];
      getTransactionsRisk(selectedStatus[0].name.toLowerCase(),
        searchValue,
        _prev.lastUser, _prev.lastFlagged, _prev.lastStatus,
        selectedTypes.map(type => type.name) || []
      ).then(res => {
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

        setData(res?.data?.risks);

        const _prevConfig = clone(prevConfig);
        _prevConfig.splice(_prevConfig.length - 1, 1);

        setPrevConfig(_prevConfig);

        if (res.data?.lastUser) {
          if (endReached) {
            setEndReached(false);
          }
          setConfig({
            ...config,
            lastUser: res.data.lastUser,
            lastFlagged: res.data.lastFlagged,
            lastStatus: res.data.lastStatus,
          });
        } else {
          setEndReached(true);
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
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({ ...pagination, pages: __pages });
  };

  const onChangeType = (val) => {
    preventSearch.current = true;

    setSelectedTypes(clone(val));
    setSearchValue('');
    setEndReached(false);
    setPages(0);
    setFirst(0)
    setPagination({
      pages: [],
      count: 0
    });
    setSelectedStatus([{ name: 'All', id: 3 }]);
    setPrevConfig(clone([]));
    setConfig({
      ...config,
      lastUser: 0,
      lastFlagged: 0,
      lastStatus: ''
    });

    onLoad('All', '', 0, 0, '', val.map(t => t.name));
  };

  const onChangeStatus = (val) => {
    preventSearch.current = true;

    const status = val ? clone(val) : [{ name: 'All', id: 3 }];

    setSelectedStatus(status);
    setSearchValue('');
    setEndReached(false);
    setPages(0);
    setFirst(0)
    setPagination({
      pages: [],
      count: 0
    });
    setSelectedTypes(clone([]));
    setPrevConfig(clone([]));
    setConfig({
      ...config,
      lastUser: 0,
      lastFlagged: 0,
      lastStatus: ''
    });

    onLoad(status[0].name, '', 0, 0, '', []);
  };

  const dataIndex = (rowData) => data.findIndex(e =>
  (
    (e.userId === rowData.userId) &&
    (e.flaggedOn === rowData.flaggedOn) &&
    (e.riskStatus === rowData.riskStatus)
  )
  );

  const handleEditedRow = (rowData) => {
    const d = clone(data);
    d[dataIndex(rowData)] = clone(rowData);
    setData(d);
  };

  const onSave = (rowData) => {
    setDialogData({ ...dialogData, data: rowData, show: true })
  };

  const onSelectionChange = ({ target: { value } }, rowData) => {
    const d = clone(data);

    d[dataIndex(rowData)] = {
      ...rowData,
      riskStatus: value,
      toggled: !rowData?.toggled,
    };

    setData(d);
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

  const resolveUser = () => {
    const { data } = dialogData;
    resolveFlaggedUser(data).then(res => {
      closeDialog();

      if (res.status !== 200) {
        return;
      }
      handleEditedRow({ ...data, toggled: undefined });
    });
  };
  const closeDialog = () => setDialogData({ ...dialogData, show: false, data: null });

  return (
    <div>
      <div className="d-flex justify-content-center pt-5 pb-5">
        <RiskDescription />
      </div>

      <p className={styles.subTitle}>{RISK_ASSESSMENT_PEP_TABLE_CONST.LIST_OF_FLAGGED_USERS}</p>
      <div className="row">
        <div className="col-sm-4">
          <p className={styles.label}>{RISK_ASSESSMENT_PEP_TABLE_CONST.NATURE_OF_RISK}</p>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <Multiselect
                onSelect={onChangeType}
                onRemove={onChangeType}
                options={types}
                selectedValues={selectedTypes}
                displayValue="name"
                singleSelect={false}
                showCheckbox
                customCloseIcon={<Icon_cancel_close width="24px" fill="#0FB377" className={styles.tranSelectCustomIconStyle} />}
                placeholder={RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE_PLACEHOLDER}
                style={{ ...selectStyles.common, ...selectStyles.typeStyles }}
              />
            </div>
            <div className="pl-3">
              <Button
                onClick={() => onChangeType([])}
                disabled={!selectedTypes.length}
                icon="pi pi-times"
                className={`p-button-rounded ${styles.tranSelectCloseIconStyle}`} />
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <p className={styles.label}>{RISK_ASSESSMENT_TRANSACTION_RISK_CONST.FLAG_STATUS}</p>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <Multiselect
                onSelect={onChangeStatus}
                onRemove={onChangeStatus}
                options={status}
                singleSelect
                showArrow={false}
                selectedValues={selectedStatus}
                displayValue="name"
                placeholder={RISK_ASSESSMENT_PEP_TABLE_CONST.USERS_USING_APP_PLACEHOLDER}
                style={selectStyles.common}
              />
            </div>
            <div className="pl-3">
              <Button
                onClick={() => onChangeStatus(null)}
                disabled={!selectedStatus.length}
                icon="pi pi-times"
                className={`p-button-rounded ${styles.tranSelectCloseIconStyle}`} />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        value={data}
        emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
        scrollHeight="400px"
        scrollable={true}
        className={styles.tranDataTableStyle}
        responsive
        paginator
        rows={searchValue === '' ? limit : data.length}
        totalRecords={data.length}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="id"
        ref={dt}
        sortOrder={1}
      >
        <Column
            header=''
            headerClassName={styles.tranTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.picture && (
                    <img
                      className={styles.tranTableProfileImgStyle}
                      src={rowData.picture}
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
          headerClassName={styles.tranTableNameHeaderStyle}
          className={styles.tranTableNameColumnStyle}
          body={(rowData) => (
            <div className={`${styles.pPoppins}`}>
               {(rowData.name?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) || (rowData.surName?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) ? 
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
          headerClassName={styles.tranTableNameHeaderStyle}
          className={styles.tranTableContactColumnStyle}
          body={(rowData) => (
            <>
            {rowData.email.length >  dataVisibilityTooltip ? 
            <div className="d-flex flex-column">
              <p className="mb-0" title={rowData.phone}>{rowData.phone}</p>
              <p className={`mb-0 text-truncate ${styles.tranTableContactValueStyle}`} title={rowData.email}>
                {rowData.email}
              </p>
            </div>
            :
             <div className="d-flex flex-column">
              <p className="mb-0">{rowData.phone}</p>
              <p className={`mb-0 text-truncate ${styles.tranTableContactValueStyle}`} >
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
          headerClassName={styles.tranTableFlagHeaderStyle}
          className={styles.tranTableContactColumnStyle}
          body={(rowData) => <p>{dayjs.utc(rowData.flaggedOn).format("DD.MM.YYYY")}</p>}
          sortable
        />
        <Column
          field="nature"
          header={RISK_ASSESSMENT_PEP_TABLE_CONST.NATURE_OF_RISK}
          className={styles.tranTableContactColumnStyle}
          headerClassName={styles.tranTableNameHeaderStyle}
          sortable
        />
        <Column
          field="flagStatus"
          header={RISK_ASSESSMENT_TRANSACTION_RISK_CONST.FLAG_STATUS}
          className={styles.tranTableContactColumnStyle}
          headerClassName={styles.tranTableNameHeaderStyle}
          body={(rowData) => {
            return (
              <div className="d-flex justify-content-around align-items-center">
                <select
                  disabled={rowData.riskStatus === 'Resolved'}
                  onChange={(e) => onSelectionChange(e, rowData)}
                  value={rowData?.riskStatus}
                  className={styles.tranTableFlagStatusSelectStyle}
                >
                  <option value={'Active'}>{'Active'}</option>
                  <option value={'Resolved'}>{'Resolved'}</option>
                </select>
                {(rowData.riskStatus === 'Resolved' && rowData?.toggled === undefined) && <Icon_lock />}
              </div>)
          }}
        />
        <Column
          field="notes"
          header={COMMON_CONST.NOTES}
          headerClassName={styles.tranTableNotesHeaderStyle}
          className={styles.tranTableContactColumnStyle}
          body={(rowData) => <NotesComponent {...{ rowData, handleEditedRow }} />}
        />
        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.RISK_TRANS_FLAG_STAT) && 
        <Column
          header=""
          headerClassName={styles.tranTableSaveHeaderStyle}
          bodyClassName={styles.tranTableSaveColumnStyle}
          body={(rowData) => (
            <button
              disabled={!rowData?.toggled}
              className={classNames(
                'btn btn-pill',
                rowData.toggled ? 'btn-success' : 'btn-light',
                styles.center
              )}
              onClick={() => onSave(rowData)}
            >
              {COMMON_CONST.SAVE}
            </button>
          )}
        />
        }
      </DataTable>
      <nav aria-label="..." className="mr-auto pt-5">
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
        header={RISK_ASSESSMENT_TRANSACTION_RISK_CONST.TRANSACTION_DIALOG_HEADER}
        desc={RISK_ASSESSMENT_TRANSACTION_RISK_CONST.TRANSACTION_DIALOG_SUB_TEXT}
        footer={(
          <div className="text-left">
            <button
              className="btn btn-primary btn-pill"
              onClick={resolveUser}
            >
              {RISK_ASSESSMENT_TRANSACTION_RISK_CONST.RESOLVE}
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
    </div>
  );
};

const NotesComponent = ({ rowData, handleEditedRow }) => {
  const { notes } = rowData;

  const touched = useRef(false);

  const [isEditable, setIsEditable] = useState(false);
  const [text, setText] = useState(notes);

  const updateRowData = () => {
    const payload = { ...rowData, notes: text };
    updateTransactionRiskNotes(payload).then((res) => {
      touched.current = false;
      setIsEditable(false);

      handleEditedRow(payload);
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
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.RISK_TRANS_FLAG_STAT) &&
          <Icon_pencil onClick={() => setIsEditable(true)} />
          }
        </div>
      ) : (
        <div
          className={styles.tranTableTextAreaStyle}
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


const RiskDescription = () => (
  <table className={styles.table}>
    <tbody>
      <tr><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.NATURE_OF_RISK}</th><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.DESCRIPTION}</th></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_1}</td><td>{`${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE1_DECRIPTION1} (>10K ${getCountryPoint(true)}) ${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE1_DECRIPTION2}`}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_2}</td><td>{`${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE1_DECRIPTION1} (>50K ${getCountryPoint(true)}) ${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE2_DECRIPTION1}`}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_3}</td><td>{`${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE3_DECRIPTION1} (3+ times, >10K ${getCountryPoint(true)}) ${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE3_DECRIPTION2}`}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_4}</td><td>{RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE4_DECRIPTION1}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_5}</td><td>{`${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE5_DECRIPTION1} (>30K ${getCountryPoint(true)}) ${RISK_ASSESSMENT_TRANSACTION_RISK_CONST.NATURE_OF_RISK_TYPE5_DECRIPTION2}`}</td></tr>
    </tbody>
  </table>

);

const selectStyles = {
  typeStyles: {
    chips: {
      backgroundColor: 'white',
      border: '1px solid #0FB377',
      color: '#1E1E1E'
    }
  },
  common: {
    option: {
      fontSize: '12px',
      color: '#776B6B',
      background: 'white',
      borderBottom: '1px solid #0FB377',
    },
    optionContainer: {
      borderRadius: '12px',
      border: '1px solid #0FB377',
    },
    searchBox: {
      fontSize: '12px',
      border: '1px solid #0FB377',
      borderRadius: '12px'
    },
    inputField: {
      paddingTop: '4px',
      paddingBottom: '4px'
    }
  }
};

export default TransactionsRisk;

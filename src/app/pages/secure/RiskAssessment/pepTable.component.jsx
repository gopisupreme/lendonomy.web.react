import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import { ReactComponent as Icon_pencil } from 'assets/icon/icon_pencil.svg';
import { ReactComponent as Icon_tick } from 'assets/icon/icon_tick.svg';
import { ReactComponent as Icon_lock } from 'assets/icon/icon_lock.svg';
import classNames from 'classnames';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import { clone, has } from 'underscore';
import { Dialog } from 'primereact/dialog';
import Multiselect from 'multiselect-react-dropdown';
import { Button } from 'primereact/button';
import { ReactComponent as Icon_cancel_close } from 'assets/icon/icon_cancel-close.svg';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import * as ApiConstants from 'app/common/constants/api.constants'
import { getCountryPoint } from 'app/common/config/config';
import { RISK_ASSESSMENT_PEP_TABLE_CONST, COMMON_CONST, USER_ROLE_CONFIG_KEY, NAVIGATION_ROUTE_FROM } from 'app/common/constants/constant';
import { useHistory } from 'react-router-dom';

import {
  getAmlUsers,
  saveAmlUser,
  updateAmlNotes,
} from '../../../common/api/riskassessment.api';
import styles from './riskassessment.module.scss';
import { APICONFIG, getEndPoint } from 'app/common/config/config';
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
  { name: 'Yes', id: 1 },
  { name: 'No', id: 2 }
]

const PepTable = ({ searchValue, setSearchValue }) => {
  const mounted = useRef(false);
  const preventSearch = useRef(false);
  const history = useHistory();
  let dt = useRef();
  const limit = useRef(20).current;
  const dataVisibilityTooltip = 15;

  const [endReached, setEndReached] = useState(false);
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [actionData, setActionData] = useState({
    visible: false,
    data: null,
  });
  const [data, setData] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [prevConfig, setPrevConfig] = useState([]);
  const [config, setConfig] = useState({
    lastUser: 0,
    lastCreatedDate: 0,
  });

  useEffect(() => onLoad({
    useApp: "",
    lastCreatedDate: 0,
    lastUser: 0,
    searchValue: '',
    types: []
  }), []);

  useEffect(onSearchChange, [searchValue]);

  function onSearchChange() {
    if (preventSearch.current) { return; }

    if (mounted.current) {
      setEndReached(false);
      setPages(0);
      setFirst(0)
      setPagination({
        pages: [],
        count: 0
      });
      setSelectedTypes([]);
      setSelectedStatus([]);
      setPrevConfig(clone([]));
      setConfig({
        ...config,
        lastUser: 0,
        lastCreatedDate: 0,
      });

      onLoad({
        useApp: '',
        lastCreatedDate: 0,
        lastUser: 0,
        searchValue,
        types: []
      })
    }
  }

  function onLoad(payload) {
    dt.current.state.rows = limit;
    getAmlUsers(payload).then(res => {

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
          lastCreatedDate: res.data.lastCreatedDate,
        });
      } else {
        setEndReached(true);
      }
      setData(clone(res.data.risks));
    });
  }

  const dataIndex = (rowData) => data.findIndex((e) => e.id === rowData.id && e.createdDt === rowData.createdDt);

  const handleEditedRow = (rowData) => {
    const d = clone(data);
    d[dataIndex(rowData)] = rowData;
    setData(clone(d));
  };

  const blockUnblockUser = (rowData) => {
    setActionData({ visible: true, data: clone(rowData) });
  };


  const hideDialog = () => setActionData({ visible: false, data: null });

  const onSave = ({ useAppTouched, natureTouched, newNature, ...payload }) => {
    if (useAppTouched) {
      blockUnblockUser(payload);
    } else {
      saveAmlUser({
        url: `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AML}`,
        payload: payload
      }).then(res => {
        if (res.status !== 200) return;

        const d = clone(data);
        const index = dataIndex(payload);
        d.splice(index, 1);

        setData(clone(d));
      });
    }
  };

  const onBlockUnBlock = ({ target: { value } }, rowData) => {
    const d = clone(data);
    d[dataIndex(rowData)] = {
      ...rowData,
      useApp: value,
      useAppTouched: !rowData?.useAppTouched,
    };

    setData(clone(d));
  };

  const onChangeNature = ({ target: { value } }, rowData) => {
    const d = clone(data);
    d[dataIndex(rowData)] = {
      ...rowData,
      newNature: value,
      natureTouched: !rowData?.natureTouched
    };

    setData(clone(d));
  };

  const makeAction = (payload) => {
    saveAmlUser({
      url: `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.AML}${ApiConstants.BLOCK}`,
      payload
    }).then(res => {
      hideDialog();

      if (res.status !== 200) return

      const d = clone(payload);
      delete d['useAppTouched'];
      handleEditedRow(d);
    });
  }

  const onChangeType = (val) => {
    preventSearch.current = true;

    setSelectedTypes(clone(val));
    setEndReached(false);
    setPages(0);
    setFirst(0)
    setPagination({
      pages: [],
      count: 0
    });
    setPrevConfig(clone([]));

    setConfig({
      ...config,
      lastUser: 0,
      lastCreatedDate: 0
    });

    onLoad({
      useApp: selectedStatus.length ? selectedStatus[0].name : '',
      lastCreatedDate: 0,
      lastUser: 0,
      searchValue,
      types: val.map(t => t.name)
    })
  };

  const onChangeStatus = (val) => {
    preventSearch.current = true;

    setSelectedStatus(clone(val));
    setEndReached(false);
    setPages(0);
    setFirst(0)
    setPagination({
      pages: [],
      count: 0
    });
    setPrevConfig(clone([]));

    setConfig({
      ...config,
      lastUser: 0,
      lastCreatedDate: 0
    });

    onLoad({
      useApp: val?.length ? val[0].name : '',
      lastCreatedDate: 0,
      lastUser: 0,
      searchValue,
      types: selectedTypes.map(t => t.name)
    })
  };

  const onPageTransactions = (event) => {
    if (event.first > first) {
      getAmlUsers({
        searchValue,
        lastUser: config.lastUser,
        lastCreatedDate: config.lastCreatedDate,
        useApp: '',
        types: [],
      }).then(res => {

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

        setData(clone(res?.data?.risks));

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
            lastCreatedDate: res.data.lastCreatedDate,
          });
        } else {
          setEndReached(true);
        }
      });
    }
    if (event.first < first) {
      const _prev = prevConfig[prevConfig.length - 2];
      getAmlUsers({
        useApp: '',
        searchValue,
        lastUser: _prev.lastUser,
        lastCreatedDate: _prev.lastCreatedDate,
        types: []
      }).then(res => {
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

        setData(clone(res?.data?.risks));

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
            lastCreatedDate: res.data.lastCreatedDate,
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
    const {ADMIN,SIDEBAR_ACCOUNT,INDIVIDUAL} = ApiConstants;
    const {RISK_ASSESSMENT} = NAVIGATION_ROUTE_FROM;
    const navigationRoutePath = ADMIN + SIDEBAR_ACCOUNT + INDIVIDUAL;
    if (!e) return;
    history.push({
      pathname: navigationRoutePath,
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
        from: RISK_ASSESSMENT
      },
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-center pt-5 pb-5">
        <RiskDescription />
      </div>
      <p className={styles.subTitle}>{RISK_ASSESSMENT_PEP_TABLE_CONST.LIST_OF_FLAGGED_USERS}</p>
      <div className="row">
        <div className="col-sm-4">
          <p className={styles.label}>{RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE}</p>
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
                customCloseIcon={<Icon_cancel_close width="24px" fill="#0FB377" className={styles.pepSelectCustomIconStyle} />}
                placeholder={RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE_PLACEHOLDER}
                style={{ ...selectStyles.common, ...selectStyles.typeStyles }}
              />
            </div>
            <div className="pl-3">
              <Button
                onClick={() => onChangeType([])}
                disabled={!selectedTypes.length}
                icon="pi pi-times"
                className={`p-button-rounded ${styles.pepSelectCloseIconStyle}`} />
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <p className={styles.label}>{RISK_ASSESSMENT_PEP_TABLE_CONST.USERS_USING_APP}</p>
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
                onClick={() => onChangeStatus([])}
                disabled={!selectedStatus.length}
                icon="pi pi-times"
                className={`p-button-rounded ${styles.pepSelectCloseIconStyle}`} />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        value={data}
        emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
        scrollHeight="400px"
        scrollable={true}
        className={styles.pepDataTableStyle}
        responsive
        paginator
        rows={searchValue === '' ? limit : data.length}
        totalRecords={data.length}
        // onSelectionChange={(e) => navigateToProfile(e, 'all')}
        paginatorTemplate=" "
        selectionMode="single"
        dataKey="createdDt"
        ref={dt}
        sortOrder={1}
      >
        <Column
            header=''
            headerClassName={styles.pepTableProfileHeaderStyle}
            body={(rowData) => (
              <>
              {/* <div class="col-sm-6 col-md-2 "> */}
                  {rowData?.picture && (
                    <img
                      className={styles.pepTableProfileImgStyle}
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
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableNameColumnStyle}
          body={(rowData) => (
            <div className={`${styles.pPoppins}`} onClick={(e) => navigateToProfile(rowData, 'all')}>
              {(rowData?.name?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) || (rowData?.surname?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP) ? 
                  <>
                  <p className={'text-truncate mb-0'} title={`${rowData.name} ${rowData.surname}`}>
                    {rowData.name}
                  </p>
                  <p className={'text-truncate mb-0'} title={`${rowData.name} ${rowData.surname}`}>
                    {rowData.surname}
                  </p>
                  </>
                  :
                  <>
                  <p className={'text-truncate mb-0'}>
                    {rowData.name}
                  </p>
                  <p className={'text-truncate mb-0'}>
                    {rowData.surname}
                  </p>
                  </>
                  }
                </div>
          )}
        />
        <Column
          field="Contacts"
          header={COMMON_CONST.CONTACTS}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => (
            <>
            {rowData.email.length > dataVisibilityTooltip ? 
            <div className="d-flex flex-column">
              <p className="mb-0" title={rowData.phoneNumber}>{rowData.phoneNumber}</p>
              <p className={`mb-0 text-truncate ${styles.pepTableContactValueStyle}`} title={rowData.email}>
                {rowData.email}
              </p>
            </div>
            : 
            <div className="d-flex flex-column">
            <p className="mb-0">{rowData.phoneNumber}</p>
            <p className={`mb-0 text-truncate ${styles.pepTableContactValueStyle}`}>
              {rowData.email}
            </p>
            </div>
            }
            </>
          )}
        />

        <Column
          field="createdDt"
          header={RISK_ASSESSMENT_PEP_TABLE_CONST.FLAGGED_ON}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => <p>{dayjs.utc(rowData.createdDt).format("DD.MM.YYYY")}</p>}
          sortable
        />

        <Column
          field="nature"
          header={RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => {
            return (
              <select
                onChange={(e) => onChangeNature(e, rowData)}
                disabled={rowData?.nature === 'Type 5'}
                value={rowData?.newNature ? rowData?.newNature : rowData?.nature}
                className={styles.pepTableRisktypeSelectStyle}
              >
                <option value={rowData?.nature}>{rowData?.nature}</option>
                {!rowData.nature.includes('5') && <option value='False Positive'>{'False Positive'}</option>}
              </select>
            );
          }}
        />

        <Column
          field="useApp"
          header={`${RISK_ASSESSMENT_PEP_TABLE_CONST.ALLOW_USER_TO_USE_APP}?`}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => {
            return (
              <div className="d-flex justify-content-around align-items-center">
                <select
                  onChange={(e) => onBlockUnBlock(e, rowData)}
                  disabled={rowData?.nature.includes('3') || rowData?.nature === 'Type 5'}
                  value={rowData?.useApp}
                  className={styles.pepTableUseAppSelectStyle}
                >
                  <option value={'YES'}>{'Yes'}</option>
                  <option value={'NO'}>{'No'}</option>
                </select>
                {(rowData?.nature.includes('3') || rowData?.nature === 'Type 5') && <Icon_lock />}
              </div>
            );
          }}
        />

        <Column
          field="adminCmt"
          header={COMMON_CONST.NOTES}
          headerClassName={styles.pepTableNameHeaderStyle}
          className={styles.pepTableContactColumnStyle}
          body={(rowData) => <NotesComponent {...{ rowData, handleEditedRow }} />}
        />
         {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PEP_RISK_TYPE_UPDATE) && 
          UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PEP_USE_APP) &&
        <Column
          header=""
          bodyClassName={styles.pepTableSaveColumnStyle}
          headerClassName={styles.pepTableSaveHeaderStyle}
          body={(rowData) => {
            console.log(rowData)
            return (
              <button
                disabled={!(rowData?.useAppTouched || rowData?.natureTouched)}
                className={classNames(
                  'btn btn-pill',
                  !(rowData?.useAppTouched || rowData?.natureTouched) ? 'btn-light' : 'btn-success',
                  styles.center
                )}
                onClick={() => onSave(rowData)}
              >
                {COMMON_CONST.SAVE}
              </button>
            )
          }}
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
      <Dialog
        className={`len-dialog account-dialog ${styles.pepDialogStyle}`}
        closable={false}
        header={
          <>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex flex-column justify-content-between">
                <h4 className="len-header len-header-xs bold mb-4">{`${RISK_ASSESSMENT_PEP_TABLE_CONST.AML_DIALOG_HEADER1} ${actionData?.data?.useApp === 'NO' ? RISK_ASSESSMENT_PEP_TABLE_CONST.AML_BLOCK : RISK_ASSESSMENT_PEP_TABLE_CONST.AML_UNBLOCK} ${RISK_ASSESSMENT_PEP_TABLE_CONST.AML_DIALOG_HEADER2}`}</h4>
                <p className="header-desc-text header-desc-text-xxs">{`${RISK_ASSESSMENT_PEP_TABLE_CONST.AML_DIALOG_HEADER_SUB_TEXT1} ${actionData?.data?.useApp === 'NO' ? RISK_ASSESSMENT_PEP_TABLE_CONST.AML_UNBLOCK : RISK_ASSESSMENT_PEP_TABLE_CONST.AML_BLOCK} ${RISK_ASSESSMENT_PEP_TABLE_CONST.AML_DIALOG_HEADER_SUB_TEXT2} "${actionData?.data?.useApp === 'NO' ? COMMON_CONST.YES : COMMON_CONST.NO}" ${RISK_ASSESSMENT_PEP_TABLE_CONST.AML_DIALOG_HEADER_SUB_TEXT3}`}</p>
              </div>
              <a href="javascript:void(0)" onClick={hideDialog}>
                <Icon_cancel />
              </a>
            </div>
          </>
        }
        contentStyle={{
          display: 'none'
        }}
        footer={
          <div className="text-left">
            <button
              className="btn btn-primary btn-pill"
              type="button"
              onClick={() => makeAction(actionData.data)}
            >
              {`${RISK_ASSESSMENT_PEP_TABLE_CONST.AML} - ${actionData?.data?.useApp === 'NO' ? COMMON_CONST.BLOCK : COMMON_CONST.UNBLOCK}`}
            </button>
            <button
              className="btn btn-dark btn-pill"
              onClick={hideDialog}
            >
              {COMMON_CONST.CANCEL}
            </button>
          </div>
        }
        visible={actionData.visible}
        modal={true}
        onHide={hideDialog}
      />
    </div>
  );
};

const RiskDescription = () => (
  <table className={styles.table}>
    <tbody>
      <tr><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPES_HEADER}</th><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.NATURE_OF_RISK}</th><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.DESCRIPTION}</th></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_1}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.PEP}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.PEP_DESCRIPTION}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_2}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.RCA}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.RCA_DESCRIPTION}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_3}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.SANCTION}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.SANCTION_DESCRIPTION}</td></tr>
      <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_4}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.HIGH_RISK_COUNTRY}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.HIGH_RISK_COUNTRY_DESCRIPTION}</td></tr>
      {getCountryPoint() === 'Lithuania' ?
        <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_5}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.KYC_NOT_VERIFIED}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.KYC_NOT_VERIFIED_DESCRIPTION}</td></tr>
        :
        <tr><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_5}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.BANK_ID_NOT_VERIFIED}</td><td>{RISK_ASSESSMENT_PEP_TABLE_CONST.BANK_ID_NOT_VERIFIED_DESCRIPTION}</td></tr>
      }
    </tbody>
  </table>

);


export default PepTable;

const NotesComponent = ({ rowData, handleEditedRow }) => {
  const { adminCmt } = rowData;

  const touched = useRef(false);

  const [isEditable, setIsEditable] = useState(false);
  const [text, setText] = useState(adminCmt);

  const updateRowData = () => {
    updateAmlNotes({ ...rowData, adminCmt: text }).then((res) => {
      touched.current = false;
      setIsEditable(false);

      handleEditedRow({ ...rowData, adminCmt: text });
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
    setText(adminCmt);
    setIsEditable(false);
  };

  return (
    <>
      {!isEditable ? (
        <div className={styles.wrapper}>
          {adminCmt.trim() ?
            <p>{adminCmt}</p> :
            <textarea
              disabled={!isEditable}
              className={classNames('form-control', styles.txtArea, 'mr-3')}
              placeholder={COMMON_CONST.NOTES_TEXT_PLACEHOLDER} />
          }
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PEP_RISK_TYPE_UPDATE) && 
          UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PEP_USE_APP) &&
          <Icon_pencil onClick={() => setIsEditable(true)} />
          }
        </div>
      ) : (
        <div
          className={styles.pepTableTextAreaStyle}
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
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
import { getTransactionsRisk, resolveFlaggedUser, updateTransactionRiskNotes, KYCDetails, SaveKYCDetails } from 'app/common/api/riskassessment.api';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import { AnalyticsDialog } from './dialog/analytics.dialog.component'
import { useHistory } from 'react-router-dom';

dayjs.extend(utc);

const types = [
  { name: 'Clear', id: 1 },
  { name: 'Rejected', id: 2 },
  { name: 'Caution', id: 3 },
  { name: 'Suspected', id: 4 },
];
const status = [
  { name: 'Select', id: 1 },
  { name: 'Clear', id: 2 },
  { name: 'Re-verify', id: 3 },
  { name: 'Suspend', id: 4 }
];

const TransactionsRisk = ({ searchValue, setSearchValue }) => {
  const mounted = useRef(false);
  const preventSearch = useRef(false);
  const history = useHistory();
  const dt = useRef();
  const limit = useRef(20).current;

  const [endReached, setEndReached] = useState(false);
  const [pages, setPages] = useState(0);
  const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [showDefaultUserDialog, setShowDefaultUserDialog] = useState(false);

  const [dialogData, setDialogData] = useState({
    show: false,
    data: null
  });
  const [data, setData] = useState([]);
  const [getSelectedRow, setSelectedRow] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [prevConfig, setPrevConfig] = useState([]);
  const [config, setConfig] = useState({
    lastUser: 0,
    lastFlagged: 0,
    lastStatus: ''
  });

  useEffect(() => {
    onLoad('', [], '', '', 0);
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
      setSelectedStatus([]);
      setPrevConfig(clone([]));
      setConfig({
        ...config,
        lastUser: 0,
        lastFlagged: 0,
        lastStatus: ''
      });

      onLoad(searchValue, [], '', '', 0);
    }
  }

  function onLoad(...args) {
    dt.current.state.rows = limit;
    KYCDetails(args[0], args[1], args[2], args[3], args[4], args[5]).then(res => {

      mounted.current = true;
      preventSearch.current = false;

      if (res.status !== 200) return;

      let length = Math.ceil(res?.data?.kycDetails.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.kycDetails.length,
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
      setData(clone(res.data.kycDetails));
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

        let count = Math.ceil(res?.data?.kycDetails.length / limit);

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

        setData(res?.data?.kycDetails);

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

        setData(res?.data?.kycDetails);

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
    setSelectedStatus([]);
    setPrevConfig(clone([]));
    setConfig({
      ...config,
      lastUser: 0,
      lastFlagged: 0,
      lastStatus: ''
    });

    onLoad('', val.map(t => t.name), '', '', 0);
  };

  const onChangeStatus = (val) => {
    preventSearch.current = true;

    const status = val ? clone(val) : [];

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

    const FinalRequest = val ? status[0]?.name === 'Select' ? '' : status[0].name : ''
    // onLoad(status[0].name, '', 0, 0, '', []);
    onLoad('', [], FinalRequest, '', 0);
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
    rowData.toggled = undefined;
    setDialogData({ ...dialogData, data: rowData })
    SaveKYCDetails(rowData)
  };

  const onSelectionChange = ({ target: { value } }, rowData) => {
    const d = clone(data);

    d[dataIndex(rowData)] = {
      ...rowData,
      adminRemarks: value,
      // toggled: !rowData?.toggled,
      toggled: true,
    };

    setData(d);
  };

  const paginatorLeft = (
    <button
      disabled={pagination.pages[0]?.displayPage === 1 ? true : false}
      className="btn btn-dark btn-pill mr-4"
      onClick={onPreviousPage}
    >
      Previous page
    </button>
  );

  const paginatorRight = (
    <button
      disabled={endReached}
      className="btn btn-dark btn-pill ml-4"
      onClick={onNextPage}
    >
      Next page
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


  function functionCall(item) {
    setShowDefaultUserDialog(true)
    setSelectedRow(item)
  }

  function showDefaultedUserList() {

    return (
      <AnalyticsDialog
        onHide={() => setShowDefaultUserDialog(false)}
        visible={showDefaultUserDialog}
        defaultedUsersList={getSelectedRow?.checks}
        FullUserList={getSelectedRow}
        onDefaultedUserSelected={onNavigateToInduvidual}
      />
    );
  }

  function onNavigateToInduvidual(rowData) {
    setShowDefaultUserDialog(false);
    console.log("Row data", rowData);
    // props.history.push({
    //   pathname: "/admin/account/induvidual",
    //   state: {
    //     userData: rowData.data
    //   }
    // });
  }

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
    <div>
      <div className="d-flex justify-content-center pt-5 pb-5">
        <RiskDescription />
      </div>

      <p className={styles.subTitle}>List of flagged users</p>
      <div className="row">
        <div className="col-sm-4">
          <p className={styles.label}>Nature of risk</p>
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
                customCloseIcon={<Icon_cancel_close width="24px" fill="#0FB377" style={{ paddingLeft: '6px' }} />}
                placeholder="Select risk type"
                style={{ ...selectStyles.common, ...selectStyles.typeStyles }}
              />
            </div>
            <div className="pl-3">
              <Button
                style={{
                  backgroundColor: '#0FB377'
                }}
                onClick={() => onChangeType([])}
                disabled={!selectedTypes.length}
                icon="pi pi-times"
                className="p-button-rounded" />
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <p className={styles.label}>Flag status</p>
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
                placeholder="Select Status(All)"
                style={selectStyles.common}
              />
            </div>
            <div className="pl-3">
              <Button
                style={{
                  backgroundColor: '#0FB377'
                }}
                onClick={() => onChangeStatus(null)}
                disabled={!selectedStatus.length}
                icon="pi pi-times"
                className="p-button-rounded" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        value={data}
        emptyMessage="Sorry! There are no matching records. Please try again."
        scrollHeight="400px"
        scrollable={true}
        style={{ width: '100%' }}
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
          sortable
          field="name"
          header="Name"
          headerStyle={{ textAlign: 'center' }}
          style={{ fontWeight: 700, textAlign: 'center',cursor:'pointer' }}
          body={(rowData) => (
            <div className="row" onClick={(e) => navigateToProfile(rowData, 'all')}>
              <div className={classNames('pr-0', 'col-sm-6')}>
                {rowData.img && (
                  <img
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '24px',
                    }}
                    src={rowData.img}
                  />
                )}
              </div>
              <div className={`col-sm-6 pr-0 pl-0 ${styles.pPoppins}`}>
                <div>
                  <p className={'text-truncate text-left mb-0'}>
                    {rowData.name}
                  </p>
                  <p className={'text-truncate text-left mb-0'}>
                    {rowData.surName}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
        <Column
          field="Contacts"
          header="Contacts"
          style={{ textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          body={(rowData) => (
            <div className="d-flex flex-column">
              <p className="mb-0">{rowData.phone}</p>
              <p className="mb-0 text-truncate" style={{ fontSize: '12px' }}>
                {rowData.email}
              </p>
            </div>
          )}
        />
        <Column
          field="flaggedOn"
          header="FLAGGED ON"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '100px', textAlign: 'center' }}
          body={(rowData) => <p>{dayjs.utc(rowData.flaggedOn).format("DD.MM.YYYY")}</p>}
          sortable
        />
        <Column
          field="flaggedOn"
          header="NUMBER OF ATTEMPTS"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '100px', textAlign: 'center' }}
          body={(rowData) => <p onClick={() => functionCall(rowData)}><a style={{color:'blue',textDecorationLine: 'underline'}}>{rowData.checks?.length}</a></p>}
          sortable
        />
        <Column
          field="onfidoStatus"
          header="Nature of Risk"
          style={{ textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          sortable
        />
        <Column
          field="flagStatus"
          header="Flag Status"
          style={{ textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
          body={(rowData) => {
            return (
              <div className="d-flex justify-content-around align-items-center">
                <select
                  disabled={rowData.adminRemarks === 'Clear' && !rowData.toggled}
                  onChange={(e) => onSelectionChange(e, rowData)}
                  value={rowData?.adminRemarks}
                  style={{
                    border: 'none',
                    fontSize: '1rem',
                  }}
                >
                  <option value={'Select'}>{'Select'}</option>
                  <option value={'Clear'}>{'Clear'}</option>
                  <option value={'Re-verify'}>{'Re-verify'}</option>
                  <option value={'Suspend'}>{'Suspend'}</option>
                </select>
                {(rowData.adminRemarks === 'Clear') && <Icon_lock />}
              </div>)
          }}
        />
        <Column
          field="notes"
          header="Notes"
          style={{ textAlign: 'center' }}
          headerStyle={{ width: '172px', textAlign: 'center' }}
          body={(rowData) => <NotesComponent  {...{ rowData, handleEditedRow }} />}
        />
        <Column
          header=""
          bodyStyle={{
            border: 'none',
          }}
          headerStyle={{ border: 'none', width: '100px' }}
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
              Save
            </button>
          )}
        />
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
        header="Do you want to resolve this flagged incident?"
        desc={"Once you resolve a suspicious incident, you can’t re-activate it!"}
        footer={(
          <div className="text-left">
            <button
              className="btn btn-primary btn-pill"
              onClick={resolveUser}
            >
              Resolve
            </button>
            <button
              className="btn btn-dark btn-pill"
              onClick={closeDialog}
            >
              Cancel
            </button>
          </div>
        )}
        onHide={closeDialog}
      />
      {showDefaultedUserList()}
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
            disabled={true}
              className={classNames('form-control', styles.txtArea, 'mr-3')}
              placeholder="Enter Comments..." />
          }
          <Icon_pencil onClick={() => setIsEditable(true)} />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
          }}
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
      <tr><th>Nature of Risk</th><th>Description</th></tr>
      <tr><td>Clear</td><td>{'The KYC verification has been completed successfully'}</td></tr>
      <tr><td>Rejected</td><td>{'The document uploaded by the user has been rejected'}</td></tr>
      <tr><td>Caution</td><td>{'The document provided is cautious, will require manual update or re-verification process'}</td></tr>
      <tr><td>Suspected</td><td>{'The document provided is suspected  fake, will require manual update or re-verification process'}</td></tr>
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

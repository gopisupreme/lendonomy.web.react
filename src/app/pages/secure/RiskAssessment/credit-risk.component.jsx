import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { clone } from 'underscore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

import Multiselect from 'multiselect-react-dropdown';
import classNames from 'classnames';
import dayjs from "dayjs";
import * as ApiConstants from 'app/common/constants/api.constants'

import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';

import styles from './riskassessment.module.scss';
import { getClientRisk, saveCreditRiskUser, } from 'app/common/api/riskassessment.api';
import { APICONFIG, getEndPoint } from 'app/common/config/config';
import { RISK_ASSESSMENT_CREDIT_RISK_CONST, COMMON_CONST, RISK_ASSESSMENT_PEP_TABLE_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import { useHistory } from 'react-router-dom';
import UtilsHelper from 'app/common/services/utilsHelper';

const types = [
    { name: 'Type 1', id: 1 },
    { name: 'Type 2', id: 2 },
    { name: 'Type 3', id: 3 },
    { name: 'Type 4', id: 4 },
];

const status = [
    { name: 'YES', id: 1 },
    { name: 'NO', id: 2 },
]
const CreditRisk = ({ searchValue, setSearchValue }) => {
    const mounted = useRef(false);
    const preventSearch = useRef(false);
    const history = useHistory();
    const dt = useRef();
    const limit = useRef(20).current;
    const dataVisibilityTooltip = 15;

    const [endReached, setEndReached] = useState(false);
    const [pages, setPages] = useState(0);
    const [first, setFirst] = useState(0);
    const [lastexpand, setLastExpander] = useState(null);

    const [pagination, setPagination] = useState({
        pages: [],
        count: 0,
    });

    const [dialogData, setDialogData] = useState({
        show: false,
        data: null
    });
    const [actionData, setActionData] = useState({
        visible: false,
        data: null,
    });
    const [data, setData] = useState([]);


    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const [prevConfig, setPrevConfig] = useState([]);
    const [config, setConfig] = useState({
        lastUser: 0,
        lastFlagged: 0,
        lastStatus: ''
    });

    useEffect(() => {
        onLoad('All', '', config.lastUser, config.lastFlagged, config.lastStatus, selectedTypes.map(t => t.name) || []);
    }, []);


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
                lastFlagged: 0,
                lastStatus: ''
            });

            onLoad('All', searchValue, 0, 0, '', []);
        }
    }

    function onLoad(...args) {
        dt.current.state.rows = limit;
        getClientRisk(args[0], args[1], args[2], args[3], args[4], args[5]).then(res => {
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
    }

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
        // setSelectedStatus([]);
        setPrevConfig(clone([]));
        setConfig({
            ...config,
            lastUser: 0,
            lastFlagged: 0,
            lastStatus: ''
        });

        onLoad(selectedStatus.length ? selectedStatus[0].name : 'ALL',
            '', 0, 0, '', val.map(t => t.name));
    }

    const onChangeStatus = (val) => {
        preventSearch.current = true;
        setSelectedStatus(clone(val));
        setSearchValue('');
        setEndReached(false);
        setPages(0);
        setFirst(0)
        setPagination({
            pages: [],
            count: 0
        });
        // setSelectedTypes(clone([]));
        setPrevConfig(clone([]));
        setConfig({
            ...config,
            lastUser: 0,
            lastFlagged: 0,
            lastStatus: ''
        });

        onLoad(val?.length ? val[0].name : 'ALL',
            '', 0, 0, '', selectedTypes.map(t => t.name));
    };

    const paginatorLeft = (
        <button
            disabled={pagination.pages[0]?.displayPage === 1 ? true : false}
            className="btn btn-dark btn-pill mr-4"
            onClick={() => onPreviousPage}
        >
            {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
        </button>
    );

    const paginatorRight = (
        <button
            disabled={endReached}
            className="btn btn-dark btn-pill ml-4"
            onClick={() => onNextPage}
        >
            {COMMON_CONST.NEXT_PAGE_BUTTON}
        </button>
    );

    const onToggleRow = (e) => {
        setExpandedRows(e.data)
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
    const onPageTransactions = (event) => {
        /***CHECK API CALL OR FUNCTION */
    }

    const dataIndex = (rowData) => data.findIndex((e) => e.userId === rowData.userId && e.flaggedOn === rowData.flaggedOn);

    const onChangeNature = ({ target: { value } }, rowData) => {
        const d = clone(data);
        d[dataIndex(rowData)] = {
            ...rowData,
            riskType: value,
        };

        setData(clone(d));
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
    const retriggerUpdate = ({ target: { value } }, rowData) => {
        if(rowData.useApp === "NO"){
            const d = clone(data);
            d[dataIndex(rowData)] = {
                ...rowData,
                rStatus: value,
                retriggerTouched: true,
                useApp: "YES",
                useAppTouched: false,
                retriggerDisable: true
            };
    
            setData(clone(d));
        } else{
        const d = clone(data);
        d[dataIndex(rowData)] = {
            ...rowData,
            rStatus: value,
            retriggerTouched: true,
            useAppTouched: false,
            retriggerDisable: true
        };

        setData(clone(d));
    }
    };

    const dataIndexVal = (rowData) => data.findIndex((e) => e.userId === rowData.userId && e.flaggedOn === rowData.flaggedOn);

    const updateRemarks = (value, rowData) => {
        const d = clone(data);
        d[dataIndexVal(rowData)] = {
            ...rowData,
            adminRemarks: value,
            remarksEdited: true,
        };
        setData(clone(d));
    }


    const hideDialog = () => setActionData({ visible: false, data: null });
    const makeAction = (payload) => {
    }


    const onSave = ({ ...payload }) => { 

        saveCreditRiskUser({
            url: `${getEndPoint()}${ApiConstants.ADMIN}${ApiConstants.RISK}${ApiConstants.CREDIT_SAFE}`,
            payload: payload
        }).then(res => {

            if (res.status !== 200) return;
            const d = clone(data);
            const index = dataIndex(payload);
            d.splice(index, 1);

            setData(clone(d));
            setExpandedRows([])
            onLoad(selectedStatus?.length ? selectedStatus[0].name : 'ALL',
                '', 0, 0, '', selectedTypes.map(t => t.name));
        });
    };

    function rowExpansionTemplate(data) {
        return (
            <div className="orders-subtable">
                <DataTable value={[data]}>

                    <Column
                        header={RISK_ASSESSMENT_CREDIT_RISK_CONST.CREDIT_SAFE_REMARKS}
                        className={styles.creditRemarkTableColumnStyle}
                        headerClassName={styles.creditRemarkTableHeaderStyle}
                        body={(rowData) => <div className={styles.creditRemarksValueContainer}>
                            <div className={styles.creditRemarksValueHeaderStyles}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.GENERAL_REMARKS}:</div>
                            <div className={styles.creditRemarksValueStyles}>{rowData.generalRemarks.toString()}</div>

                            <div className={styles.creditRemarksNextValueHeaderStyles}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.PAYMENT_REMARKS}</div>
                            <div className={styles.creditRemarksValueStyles}>{rowData.paymentRemarks}</div>
                        </div>}
                    />
                    <Column
                        header={RISK_ASSESSMENT_CREDIT_RISK_CONST.ADMIN_REMARKS}
                        className={styles.creditRemarkTableColumnStyle}
                        headerClassName={styles.creditRemarkTableHeaderStyle}
                        body={(rowData) => <textarea
                            onChange={(e) => updateRemarks(e.target.value, rowData)}
                            value={rowData.adminRemarks}
                            className={classNames('form-control', styles.txtArea, 'mr-3')}
                            placeholder={COMMON_CONST.NOTES_TEXT_PLACEHOLDER} />
                        }
                    />


                    <Column
                        // field="useApp"
                        header={RISK_ASSESSMENT_PEP_TABLE_CONST.ALLOW_USER_TO_USE_APP}
                        className={styles.creditRemarkTableColumnStyle}
                        headerClassName={styles.creditRemarkTableHeaderStyle}
                        body={(rowData) =>{ 
                            let disable = rowData.rStatus === RISK_ASSESSMENT_CREDIT_RISK_CONST.RETRIGGER
                            return( <div className="d-flex justify-content-around align-items-center">
                            <select
                                onChange={(e) => onBlockUnBlock(e, rowData)}
                                value={rowData?.useApp}
                                disabled={disable}
                                className={styles.creditUseAppSelectStyle}
                            >
                                <option value={'YES'}>{COMMON_CONST.YES}</option>
                                <option value={'NO'}>{COMMON_CONST.NO}</option>
                            </select>
                        </div>)}}
                    />
                    { data?.riskType?.includes("4") &&
                    <Column
                        header={"Re-trigger CRA"}
                        className={styles.creditRemarkTableColumnStyle}
                        headerClassName={styles.creditRemarkTableHeaderStyle}
                        body={(rowData) => {
                                let disable = !rowData?.retriggerDisable && rowData?.rStatus === RISK_ASSESSMENT_CREDIT_RISK_CONST.RETRIGGER
                            return (
                                <select
                                    onChange={(e) => retriggerUpdate(e, rowData)}
                                    value={rowData?.rStatus}
                                    disabled={disable}
                                    className={`mb-0 text-dark ${styles.creditTableRiskSelectStyle}`}
                                >
                                      <option value={""} selected>
                                       {COMMON_CONST.SELECT}
                                      </option>
                                    <option value={RISK_ASSESSMENT_CREDIT_RISK_CONST.RETRIGGER}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.RETRIGGER}</option>
                                </select>
                            );
                        }}
                    />
                    }
                   {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CREDIT_RISK_USE_APP) && 
                    <Column
                        header=""
                        className={styles.creditRemarkTableColumnStyle}
                        headerClassName={styles.creditRemarkTableHeaderStyle}
                        body={(rowData) =>{ 
                            let disable = (rowData?.useAppTouched || (rowData?.remarksEdited && rowData?.adminRemarks?.trim()))
                            return( <button
                            disabled={!disable}
                            className={classNames(
                                'btn btn-pill',
                                !(rowData?.useAppTouched || (rowData?.remarksEdited && rowData?.adminRemarks?.trim())) ? 'btn-light' : 'btn-success',
                                styles.center
                            )}
                            onClick={() => onSave(rowData)}
                        >
                            {COMMON_CONST.SAVE}
                        </button>)}
                        }
                    />
                    }
                    <Column
                        headerClassName={styles.creditTableEmptyHeaderStyle}
                        bodyClassName={styles.creditTableEmptyColumnStyle}
                    />
                </DataTable>
            </div>
        )
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
            <p className={styles.subTitle}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.LIST_OF_CREDIT_RISK_FLAGGED_USERS}</p>
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
                                placeholder={RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE_PLACEHOLDER}
                                customCloseIcon={
                                    <Button
                                        icon="pi pi-times"
                                        className={`p-button-rounded px-md-2 ${styles.creditRiskCustomCloseIconStyle}`} />
                                }
                                style={{ ...selectStyles.common, ...selectStyles.typeStyles }}
                            />
                        </div>
                        <div className="pl-3">
                            <Button
                                onClick={() => onChangeType([])}
                                disabled={!selectedTypes.length}
                                icon="pi pi-times"
                                className={`p-button-rounded ${styles.creditRiskCloseIconStyle}`} />
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
                                className={`p-button-rounded ${styles.creditRiskCloseIconStyle}`} />
                        </div>
                    </div>
                </div>
            </div>
            {console.log("data", data)}
            <DataTable
                value={data}
                emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
                scrollHeight="400px"
                scrollable={true}
                className={styles.creditDataTableStyle}
                responsive={true}
                paginator
                rows={searchValue === '' ? limit : data.length}
                totalRecords={data.length}
                paginatorTemplate=""
                selectionMode="single"
                // dataKey="userId"
                dataKey="flaggedOn"

                ref={dt}
                sortOrder={1}
                expandedRows={expandedRows}
                onRowToggle={(e) => onToggleRow(e)}
                // onRowExpand={(e) => rowExpand(e)}
                // onRowCollapse={(e) => rowCollapse(e)}
                rowExpansionTemplate={(e) => rowExpansionTemplate(e)}
            >
                <Column
                   header=''
                   headerClassName={styles.creditTableProfileHeaderStyle}
                   body={(rowData) => (
                     <>
                     {/* <div class="col-sm-6 col-md-2 "> */}
                         {rowData?.userImage && (
                           <img
                             className={styles.creditTableProfileImgStyle}
                             src={rowData.userImage}
                           />
                         )}
                       {/* </div> */}
                       </>
                   )}
                />

                <Column
                    sortable
                    field="firstName"
                    header={COMMON_CONST.NAME}
                    headerClassName={styles.creditTableNameHeaderStyle}
                    className={styles.creditTableNameColumnStyle}
                    body={(rowData) => (
                        <div className={`${styles.pPoppins}`} onClick={(e) => navigateToProfile(rowData, 'all')}>
                            {rowData.firstName?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? 
                                    <p className={'text-truncate mb-0'} title={rowData.firstName}>
                                        {rowData.firstName}
                                    </p>
                                    :
                                    <p className={'text-truncate mb-0'}>
                                        {rowData.firstName}
                                    </p>
                                    }
                                </div>
                    )}

                />
                <Column
                    field="Contacts"
                    header={COMMON_CONST.CONTACTS}
                    headerClassName={styles.creditTableNameHeaderStyle}
                    className={styles.creditTablecontactColumnStyle}
                    body={(rowData) => (
                        <>
                        {rowData.email.length > dataVisibilityTooltip ? 
                        <div className="d-flex flex-column">
                            <p className="mb-0 text-dark" title={rowData.phone}>{rowData.phone}</p>
                            <p className={`mb-0 text-truncate text-dark ${styles.creditTableContactValueStyle}`} title={rowData.email}>
                                {rowData.email}
                            </p>
                        </div>
                        :
                        <div className="d-flex flex-column">
                        <p className="mb-0 text-dark">{rowData.phone}</p>
                        <p className={`mb-0 text-truncate text-dark ${styles.creditTableContactValueStyle}`}>
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
                    headerClassName={styles.creditTableFlagHeaderStyle}
                    className={styles.creditTablecontactColumnStyle}
                    body={(rowData) => <p className="mb-0 text-dark">{dayjs.utc(rowData.flaggedOn).format("DD.MM.YYYY")}</p>}
                    sortable
                />
                <Column
                    field="riskType"
                    header={RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPE}
                    // style={{ textAlign: 'center' }}
                    headerClassName={styles.creditTableNameHeaderStyle}
                    body={(rowData) => {
                        return (
                            <select
                                value={rowData?.riskType}
                                className={`mb-0 text-dark ${styles.creditTableRiskSelectStyle}`}
                            >
                                <option value={rowData?.riskType}>{rowData?.riskType}</option>
                            </select>
                        );
                    }}
                />
                <Column
                    field="creditSafe"
                    header={RISK_ASSESSMENT_CREDIT_RISK_CONST.CREDIT_SAFE_RISK_BAND}
                    className={styles.creditTablecontactColumnStyle}
                    headerClassName={styles.creditTableNameHeaderStyle}
                    body={(rowData) => <p className="mb-0 text-dark">{rowData.decision}</p>}
                />

                <Column
                    field="creditSafeScore"
                    header={COMMON_CONST.CREDIT_SAFE_SCORE}
                    className={styles.creditTablecontactColumnStyle}
                    headerClassName={styles.creditTableNameHeaderStyle}
                    body={(rowData) => <p className="mb-0 text-dark" >{rowData.csScore}</p>}
                />

                <Column
                    bodyClassName={styles.creditTableExpandColumnStyle}
                    headerClassName={styles.creditTableExpandHeaderStyle}
                    expander
                // body={searchBodyTemplate}
                // field="expander"

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

            <Dialog
                className={`len-dialog account-dialog ${styles.creditDialogStyle}`}
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
                            onClick={() => onSave(actionData.data)}
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
    )
}

const RiskDescription = () => (
    <table className={styles.table}>
        <tbody>

            <tr>

                <th>{RISK_ASSESSMENT_PEP_TABLE_CONST.RISK_TYPES_HEADER}</th><th>{RISK_ASSESSMENT_PEP_TABLE_CONST.DESCRIPTION}</th>

            </tr>

            <tr><td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_1}</td><td className={`mt-4 font-weight-bold py-3 px-md-2`}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.TYPE1_DESCRIPTION}</td></tr>

            <tr><td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_2}</td><td className={`mt-4 font-weight-bold py-3 px-md-2`}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.TYPE2_DESCRIPTION}</td></tr>
            <tr><td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_3}</td><td className={`mt-4 font-weight-bold py-3 px-md-2`}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.TYPE3_DESCRIPTION}</td></tr>
            <tr><td className={`mt-4 font-weight-bold`}>{RISK_ASSESSMENT_PEP_TABLE_CONST.TYPE_4}</td><td className={`mt-4 font-weight-bold py-3 px-md-2`}>{RISK_ASSESSMENT_CREDIT_RISK_CONST.TYPE4_DESCRIPTION}</td></tr>
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
        },
        td_text_style: {
            textAlign: "center",
            paddingTop: '12px',
            paddingBottom: '12px',
            color: '#000000',
            fontWeight: 900,
            fontSize: 14,

        }
    }
}
export default CreditRisk;

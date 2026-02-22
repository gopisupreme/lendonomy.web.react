import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {Field, Form} from 'react-final-form';
import {PendingLoans, CloseManually} from 'app/common/api/content.api';
import {TextAreaRenderField} from 'app/common/components/widgets/common';
import { ACCOUNT_LOAN_DIALOG_CONST, COMMON_CONST, INDIVIDUAL_ACCOUNT_CONST, NOTIFICATION_RISKY_LOAN_CONST } from 'app/common/constants/constant';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';
import {useEffect, useRef} from 'react';
import classNames from 'classnames';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import styles from '../../RiskAssessment/riskassessment.module.scss';
import {ReactComponent as Icon_pencil} from 'assets/icon/icon_pencil.svg';
import {ReactComponent as Icon_tick} from 'assets/icon/icon_tick.svg';
import {ReactComponent as Icon_lock} from 'assets/icon/icon_lock.svg';
import {clone} from 'underscore';
import dialogStyles from '../accountstyles.module.scss';


export function LoanDialog(props) {
  const [value, setValue] = useState('');
  const [DefaultedLns, setDefaultedLns] = useState('');
  const [ActiveLns, setActiveLns] = useState('');
  let dt = useRef();
  const limit = useRef(20).current;

  useEffect(() => {
    onload();
  }, [props.visible]);

  function onload() {
    PendingLoans(props.userId).then((res) => {
      if (res.data == '') {
      } else {
        setDefaultedLns(res.data.defaultedLoans);
        setActiveLns(res.data.activeLoans);
      }
    });
  }

  const dialogHeader = (
    <>
      <div className='d-flex align-items-center justify-content-between'>
        <h4
          className={`len-header len-header-xs bold mb-0 ${dialogStyles.loanActHeaderStyle}`}
          >{`Active loans`}</h4>
        <a href='javascript:void(0)' onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );

  const handleEditedRow = (rowData) => {
    if (rowData.name === 'DefaultedLns') {
      const d = clone(DefaultedLns);
      const ActiveLoansDetails = DefaultedLns.filter(
        (res) => res.id === rowData.id
      );
      if (rowData.adminCmt && rowData.adminCmt.length > 0 && rowData.adminCmt.trim()) {
        ActiveLoansDetails[0].useAppTouched = true;
      } else {
        ActiveLoansDetails[0].useAppTouched = false;
      }

      ActiveLoansDetails[0].adminCmt = rowData.adminCmt;

      setDefaultedLns(d);
    } else {
      const d = clone(ActiveLns);
      const ActiveLoansDetails = ActiveLns.filter(
        (res) => res.id === rowData.id
      );

      if (rowData.adminCmt && rowData.adminCmt.length > 0 && rowData.adminCmt.trim()) {
        ActiveLoansDetails[0].useAppTouched = true;
      } else {
        ActiveLoansDetails[0].useAppTouched = false;
      }

      ActiveLoansDetails[0].adminCmt = rowData.adminCmt;

      setActiveLns(d);
    }
    setValue(rowData);
  };

  const dataIndex = (rowData) => DefaultedLns.findIndex((e) => e.id === rowData.id);

  const onSave = (rowData, index) => {
    let requestBody = {
      loanRequestId: rowData.id, // Field - "Id". Closing loan "ID" in the list
      transType: 'borrowing',
      loanAction: rowData.adminCmt, // ADMIN comments
      prospectUserId: rowData.borrowerId, // Current user
    };
    if(rowData.collectionStatus === NOTIFICATION_RISKY_LOAN_CONST.DEFAULTED || index === 'ActiveLns'){
     CloseManually(requestBody).then((res) => {
      if (index === 'DefaultedLns') {
        setDefaultedLns([]);
        const DefaultLoansDetails = DefaultedLns.filter((res, index) => {
          return res.id !== rowData.id;
        });
        setDefaultedLns(
          DefaultLoansDetails.map((i) => {
            i.useAppTouched = i.adminCmt?.length > 0 ? true : undefined;
            return i;
          })
        );
      } else {
        setActiveLns([]);
        const ActiveLoansDetails = ActiveLns.filter(
          (res) => res.id !== rowData.id 
        );
        setActiveLns(
          ActiveLoansDetails.map((i) => {
            i.useAppTouched = i.adminCmt?.length > 0 ? true : undefined;
            return i;
          })
        );
      }
     });
    } else {
      const cloneDefaultlns = clone(DefaultedLns);
      cloneDefaultlns[dataIndex(rowData)] = {
          ...rowData,
          err: true,
      };
  
      setDefaultedLns(clone(cloneDefaultlns));
    }
  };

  return (
    <>
      <Dialog
        className={`len-dialog account-dialog ${dialogStyles.loanDiaContainer}`}
        closable={false}
        header={dialogHeader}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}>
        {ActiveLns.length > 0 ? (
          <DataTable
            showGridlines={false}
            value={ActiveLns}
            scrollHeight='230px'
            scrollable={true}
            className={`${ActiveLns.length > 0 ? dialogStyles.loanDialogDataTableEmptyStyle : dialogStyles.loanDialogDataTableStyle }`}
            emptyMessage={ACCOUNT_LOAN_DIALOG_CONST.ACTIVE_LOAN_EMPTY_MSG}>
            <Column
              field='DATE OF LOAN'
              header={INDIVIDUAL_ACCOUNT_CONST.DATE_OF_LOAN}
              className={dialogStyles.loanActDateColStyle}
              headerClassName={dialogStyles.loanActDateColHeaderStyle}
              body={(rowData) => (
                <p>{dayjs.utc(rowData.createdOn).format('DD.MM.YYYY')}</p>
              )}
            />
            <Column
              field='Investor name'
              header={INDIVIDUAL_ACCOUNT_CONST.INVESTOR_NAME}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => <p>{rowData.lName ? rowData.lName : '-'}</p>}
            />

            <Column
              field='amount borrowed'
              header={INDIVIDUAL_ACCOUNT_CONST.AMOUNT_BORROWED}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => (
                <p>{rowData.loanPreProcess.requestedAmount}</p>
              )}
            />

            <Column
              field='loan duration'
              header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DURATION}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => {
                return (
                  <p>{`${
                    rowData.loanPreProcess.lendingPeriodInMonths >
                    rowData.loanPreProcess.borrowingPeriodInMonths
                      ? rowData.loanPreProcess.borrowingPeriodInMonths
                      : rowData.loanPreProcess.lendingPeriodInMonths
                  } Months`}</p>
                );
              }}
            />

            <Column
              field='loan due date'
              header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DUE_DATE}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => {
                return <p>{dayjs.utc(rowData.dueDate).format('DD.MM.YYYY')}</p>;
              }}
            />

            <Column
              field='Notes'
              header={COMMON_CONST.NOTES}
              headerClassName={dialogStyles.loanInvNoteSHeaderStyle}
              className={dialogStyles.loanInvNotColStyle}
              body={(rowData) => (
                <NotesComponent
                  {...{rowData, handleEditedRow}}
                  name={'ActiveLns'}
                />
              )}
            />

            <Column
              header=''
              bodyClassName={dialogStyles.loanActSaveColStyle}
              headerClassName={dialogStyles.loanInvNoteSHeaderStyle}
              className={dialogStyles.loanInvNotColStyle}
              body={(rowData, index) => {
                return (
                  <button
                    disabled={
                      !(rowData?.useAppTouched || rowData?.natureTouched)
                    }
                    className={classNames(
                      'btn btn-pill',
                      !(rowData?.useAppTouched || rowData?.natureTouched)
                        ? 'btn-light'
                        : 'btn-success',
                      styles.center
                    )}
                    onClick={() => onSave(rowData, 'ActiveLns')}>
                    {ACCOUNT_LOAN_DIALOG_CONST.CLOSE_LOAN}
                  </button>
                );
              }}
            />
          </DataTable>
        ) : (
          <h4
            className={`len-header len-header-xs bold mb-0 ${dialogStyles.loanActEmpStyle}`}
            >
            {ACCOUNT_LOAN_DIALOG_CONST.ACTIVE_LOAN_EMPTY_MSG}
          </h4>
        )}
        {DefaultedLns.length > 0 ? (
          <h4
            className={`len-header len-header-xs bold mb-0 ${dialogStyles.loanDefaultHeaderStyle}`}
            >
            {INDIVIDUAL_ACCOUNT_CONST.DEFAULTED_LOANS}
          </h4>
        ) : (
          <h4
            className={`len-header len-header-xs bold mb-0 ${dialogStyles.loanEmpDefaultHeader}`}>
            {INDIVIDUAL_ACCOUNT_CONST.DEFAULTED_LOANS}
          </h4>
        )}
        {DefaultedLns.length > 0 ? (
          <DataTable
            showGridlines={false}
            value={DefaultedLns}
            scrollHeight='230px'
            scrollable={true}
            footerStyle={{border: 'none'}}
            className={`${DefaultedLns.length > 0 ? dialogStyles.loanDefaultDataTableEmptyStyle : dialogStyles.loanDefaultDataTableStyle }`}
            emptyMessage={ACCOUNT_LOAN_DIALOG_CONST.DEFAULT_LOAN_EMPTY_MSG}>
            <Column
              field='Date of loan'
              header={INDIVIDUAL_ACCOUNT_CONST.DATE_OF_LOAN}
              className={dialogStyles.loanActDateColStyle}
              headerClassName={dialogStyles.loanActDateColHeaderStyle}
              body={(rowData) => (
                <p>{dayjs.utc(rowData.createdOn).format('DD.MM.YYYY')}</p>
              )}
            />
            <Column
              field='Investor name'
              header={INDIVIDUAL_ACCOUNT_CONST.INVESTOR_NAME}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) =>
              <>
               <p>{rowData.lName ? rowData.lName : '-'}</p>  
               { rowData.err &&
              <p className={dialogStyles.loanErrMsgStyle}>{ACCOUNT_LOAN_DIALOG_CONST.COLLECTION_ERR_MSG}</p>
               }</>}
            />

            <Column
              field='amount borrowed'
              header={INDIVIDUAL_ACCOUNT_CONST.AMOUNT_BORROWED}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => (
                <p>{rowData.loanPreProcess.requestedAmount}</p>
              )}
            />

            <Column
              field='loan duration'
              header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DURATION}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => {
                return (
                  <p>{`${
                    rowData.loanPreProcess.lendingPeriodInMonths >
                    rowData.loanPreProcess.borrowingPeriodInMonths
                      ? rowData.loanPreProcess.borrowingPeriodInMonths
                      : rowData.loanPreProcess.lendingPeriodInMonths
                  } Months`}</p>
                );
              }}
            />

            <Column
              field='loan due date'
              header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DUE_DATE}
              headerClassName={dialogStyles.loanInvColHeaderStyle}
              className={dialogStyles.loanInvColStyle}
              body={(rowData) => {
                return <p>{dayjs.utc(rowData.dueDate).format('DD.MM.YYYY')}</p>;
              }}
            />

            <Column
              field='Notes'
              header={COMMON_CONST.NOTES}
              headerClassName={dialogStyles.loanInvNoteSHeaderStyle}
              className={dialogStyles.loanInvNotColStyle}
              body={(rowData) => (
                <NotesComponent
                  {...{rowData, handleEditedRow}}
                  name={'DefaultedLns'}
                />
              )}
            />

            <Column
              header=''
              bodyClassName={dialogStyles.loanActSaveColStyle}
              headerClassName={dialogStyles.loanInvNoteSHeaderStyle}
              className={dialogStyles.loanInvNotColStyle}
              body={(rowData, index) => {
                return (
                  <button
                    disabled={
                      !(rowData?.useAppTouched || rowData?.natureTouched)
                    }
                    className={classNames(
                      'btn btn-pill',
                      !(rowData?.useAppTouched || rowData?.natureTouched)
                        ? 'btn-light'
                        : 'btn-success',
                      styles.center
                    )}
                    onClick={() => onSave(rowData, 'DefaultedLns')}>
                    {ACCOUNT_LOAN_DIALOG_CONST.CLOSE_LOAN}
                  </button>
                );
              }}
            />
          </DataTable>
        ) : (
          <h4
            className={`len-header len-header-xs bold mb-0 ${dialogStyles.loanEmpDefaultStyle}`}>
            {ACCOUNT_LOAN_DIALOG_CONST.DEFAULT_LOAN_EMPTY_MSG}
          </h4>
        )}
      </Dialog>
    </>
  );
}

const NotesComponent = ({rowData, handleEditedRow, name}) => {
  console.log(rowData);
  const {adminCmt} = rowData;
  const touched = useRef(false);

  const [isEditable, setIsEditable] = useState(false);
  const [text, setText] = useState(adminCmt);

  const updateRowData = () => {
    touched.current = false;
    setIsEditable(false);
    handleEditedRow({...rowData, adminCmt: text, name: name});
  };

  const updateNotes = ({target: {value}}) => {
    if (!touched.current) {
      touched.current = true;
    }
    setText(value);
    handleEditedRow({...rowData, adminCmt: value, name: name});
  };

  const revertChanges = () => {
    touched.current = false;
    setText(adminCmt);
    setIsEditable(false);
  };

  return (
    <>
      <div className={styles.wrapper}>
        <textarea
         value={text}
          className={classNames('form-control', styles.txtArea, 'mr-3')}
          onChange={updateNotes}
          placeholder={COMMON_CONST.NOTES_TEXT_PLACEHOLDER}
        />
      </div>
    </>
  );
};

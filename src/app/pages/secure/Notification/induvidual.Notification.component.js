import {getProfileUser} from 'app/common/api/account.list.api';
import {resetLendingConsent as resetLendConst} from 'app/common/api/content.api';
import Header from 'app/common/components/Header/header.component';
import APP_CONST from 'app/common/constants/app.constant';
import {Storagehelper} from 'app/common/shared/utils';
import {AccountDialog} from 'app/pages/secure/Account/dialog/account.dialog.component';
import {LoanDialog} from 'app/pages/secure/Account/dialog/Loan.dialog.component';
import {
  blockOrUnblockAccount,
  reloadProfile,
  updateTrustScore,
  updateNavigatedFrom,
} from 'app/store/actions/account.list.action';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import styles from '../Account/accountstyles.module.scss';
import notificationStyles from './riskassessment.module.scss';
import {getCountryPoint} from 'app/common/config/config';
import { COMMON_CONST, ACCOUNT_LIST_CONST, INDIVIDUAL_ACCOUNT_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import UtilsHelper from 'app/common/services/utilsHelper';

function InduvidualAccount(props) {
  const [userData, setUserData] = useState({});
  const [visible, setVisible] = useState(false);
  const [ShowLoanModal, setShowLoanModal] = useState(false);
  const userId = props.location.state?.userData;
  const [isActive, setIsActive] = useState(
    // props.location?.state?.userData?.isActive
  );
  const dispatch = useDispatch();

  useEffect(onload, []);

  function onload() {
    props.reloadProfile(false);
    getProfileUser(userId)
      .then((res) => {
        setUserData(res.data);
        setIsActive(res.data.isActive)
      })
      .catch((err) => {});
  }

  function onHide() {
    setVisible(false);
  }

  function resetLendingConsent() {
    resetLendConst(userData.id).then((res) => {
      if (res.status === 200) {
        setUserData({...userData, lendingConsent: 'REQUIRED'});
      }
    });
  }

  function blockAccount(index, reason) {
    if (reason.trim() === '') return;
    props.blockOrUnblockAccount({
      userID: userId,
      block: true,
      reason,
      id: Storagehelper.getUserData().userId,
    });
    setIsActive(!isActive);
    onHide();
  }
  function unBlockAccount(index, reason) {
    if (reason.trim() === '') return;
    props.blockOrUnblockAccount({
      userID: userId,
      block: false,
      reason,
      id: Storagehelper.getUserData().userId,
    });
    setIsActive(!isActive);
    onHide();
  }

  function handleChangeReason(e) {
    // setBlockReason(e.target.value);
  }

  function checkValid(value) {
    if (value === undefined || value === null) return false;
    return true;
  }
  function formatDate(value) {
    const formated = dayjs(value).format('DD-MM-YYYY');
    return formated;
  }

  function GetBankIdStatus(UserVerifiedStatus) {
    return UserVerifiedStatus ? 'Yes' : 'No';
  }

  function getProfile() {
    return (
      <div className={'mt-3 container-area'}>
        <div className='row'>
          <div
            className={`col-sm-2 ${notificationStyles.indGetProfileImgContainer}`}
            >
            {userData && userData.picture ? (
              <img
                className={notificationStyles.indGetProfileImgStyle}
                src={userData.picture}
              />
            ) : null}
          </div>
          <div>
            <div className='row ml-0 mr-0'>
              <h3
                className={`font-weight-bold sol-sm-10 ${styles.profileName}`}>
                {`${checkValid(userData.name) ? userData.name : APP_CONST.NA} ${
                  userData.surname ? userData.surname : APP_CONST.NA
                }`}
              </h3>
            </div>
            <div className={`row ${classNames(styles.addressInfo)}`}>
              <div>
                <p className='mt-2 mb-0 text-muted'>
                  {INDIVIDUAL_ACCOUNT_CONST.BIRTHDAY}: {userData.dob ? userData.dob : APP_CONST.NA}
                </p>
                <p className='mt-0 mb-0 text-muted'>
                  {userData.email ? userData.email : APP_CONST.NA}
                </p>
                <p className=' mt-0 mb-0 text-muted'>
                  {userData.phoneNumber ? userData.phoneNumber : APP_CONST.NA}
                </p>
                <p className=' mt-0 mb-0 text-muted'>
                  {userData.csDecision
                    ? `${INDIVIDUAL_ACCOUNT_CONST.CREDIT_RISK_BAND} - ${userData.csDecision}`
                    : `${INDIVIDUAL_ACCOUNT_CONST.CREDIT_RISK_BAND} - ${APP_CONST.NA}`}
                </p>
              </div>
              <div className={notificationStyles.indGetProfileContentSpace}>
                <p className='mt-2 mb-0 text-muted'>
                  {userData.address ? userData.address : APP_CONST.NA}
                </p>
                <p className='mt-0 mb-0 text-muted'>
                  {getCountryPoint() === 'Lithuania'
                    ? INDIVIDUAL_ACCOUNT_CONST.KYC_VERIFIED
                    : INDIVIDUAL_ACCOUNT_CONST.BANKID_VERIFIED}{' '}
                  -{' '}
                  {GetBankIdStatus(
                    getCountryPoint() === 'Lithuania'
                      ? userData.kycVerified
                      : userData.bankIdVerified
                  )}
                  {/* BankID verified - {userData.bankIdVerified ? 'Yes' : 'No'} */}
                </p>
                <p className='mt-0 mb-0 text-muted'>
                  {INDIVIDUAL_ACCOUNT_CONST.INVESTMENT_ON_OTHER_PLATFORM} - {userData.otherInvestments}
                </p>
                <p className='mt-0 mb-0 text-muted'>
                  {userData.csScore
                    ? `${COMMON_CONST.CREDIT_SAFE_SCORE} - ${userData.csScore}`
                    : `${COMMON_CONST.CREDIT_SAFE_SCORE} - ${APP_CONST.NA}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getAccountOverview() {
    return (
      <div
        className={`mt-2 pb-4 container-area ${notificationStyles.indGetAccountContainer}`}>
        <h2
          className={`mt-4 font-weight-bold ${classNames(
            styles.subTabHeading
          )}`}>
          {INDIVIDUAL_ACCOUNT_CONST.ACCOUNT_OVERVIEW}
        </h2>
        <div className='mt-3'>
          <div className={styles.rowData}>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.lastLogin)
                  ? formatDate(userData.lastLogin)
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.LAST_TIME_ONLINE}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.registeredOn)
                  ? formatDate(userData.registeredOn)
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.JOINED}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.trustScore)
                  ? userData.trustScore
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {COMMON_CONST.TRUSTSCORE}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.matchingFeePaid)
                  ? userData.matchingFeePaid
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.matchingFeePaid) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_MATCHING_FEES_PAID}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getBorrowingTrans() {
    return (
      <div className={`mt-4  container-area ${styles.whiteBG}`}>
        <h2 className={`font-weight-bold ${classNames(styles.subTabHeading)}`}>
          {INDIVIDUAL_ACCOUNT_CONST.BORROWING_TRANSACTIONS} (
          {checkValid(userData.totalLoansTaken)
            ? userData.totalLoansTaken
            : APP_CONST.NA}
          )
        </h2>
        <div className='mt-3'>
          {/* <div className={styles.rowData}> */}
          <div className='row'>
            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalAmountBorrowed)
                  ? userData.totalAmountBorrowed
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totalAmountBorrowed) &&
                    getCountryPoint(true)}
                </span>
              </h1>

              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_BORROWED_ALL_TIME}
              </p>
            </div>
            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totPayBack)
                  ? userData.totPayBack
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totPayBack) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_PAID_BACK_ALL_TIME}
              </p>
            </div>
            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalNotPaidAmtAsBorrower)
                  ? userData.totalNotPaidAmtAsBorrower
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totalNotPaidAmtAsBorrower) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_ACTIVE_LOANS}
              </p>
            </div>

            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totInterestPaid)
                  ? userData.totInterestPaid
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totInterestPaid) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_INTEREST_PAID}
              </p>
            </div>

            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalDefaultedAmtAsBorrower)
                  ? userData.totalDefaultedAmtAsBorrower
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totalDefaultedAmtAsBorrower) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_DEFAULTED} ({INDIVIDUAL_ACCOUNT_CONST.OWED_BY_USER})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getLendingTrans() {
    return (
      <div
        className={`mt-2 pb-4 container-area ${notificationStyles.indGetAccountContainer}`}>
        <h2
          className={`mt-4 font-weight-bold ${classNames(
            styles.subTabHeading
          )}`}>
          {INDIVIDUAL_ACCOUNT_CONST.LENDING_TRANSACTIONS} (
          {checkValid(userData.totalInvestmentsDone)
            ? userData.totalInvestmentsDone
            : APP_CONST.NA}
          )
        </h2>
        <div className='mt-3'>
          <div className='row'>
            <div className='col-sm'>
              {checkValid(userData.totalAmountInvested) ? (
                <h1
                  className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                  {userData.totalAmountInvested}
                  <span
                    className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                    {getCountryPoint(true)}
                  </span>
                </h1>
              ) : (
                <h1
                  className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                  {APP_CONST.NA}
                </h1>
              )}

              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_LEND_ALL_TIME}
              </p>
            </div>
            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totGotBack)
                  ? userData.totGotBack
                  : APP_CONST.NA}

                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totGotBack) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_GOT_BACK_ALL_TIME}
              </p>
            </div>
            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalNotPaidAmtAsLender)
                  ? userData.totalNotPaidAmtAsLender
                  : APP_CONST.NA}

                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totalNotPaidAmtAsLender) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_ACTIVE_INVESTMENTS}
              </p>
            </div>

            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totInterestReceived)
                  ? userData.totInterestReceived
                  : APP_CONST.NA}

                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totInterestReceived) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_INTEREST_RECEIVED}
              </p>
            </div>

            <div className='col-sm'>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalDefaultedAmtAsLender)
                  ? userData.totalDefaultedAmtAsLender
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${notificationStyles.indGetAccountFeeText}`}>
                  {checkValid(userData.totalDefaultedAmtAsLender) &&
                    getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_DEFAULTED} ({INDIVIDUAL_ACCOUNT_CONST.OWED_TO_USER})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getOverview() {
    return (
      <div className={`mt-4  container-area ${styles.whiteBG}`}>
        <h2 className={`font-weight-bold ${classNames(styles.subTabHeading)}`}>
          {INDIVIDUAL_ACCOUNT_CONST.OVERVIEW}
        </h2>
        <div className='mt-3'>
          <div className={styles.rowData}>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalInvestmentsDone)
                  ? userData.totalInvestmentsDone
                  : APP_CONST.NA}
              </h1>

              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_TIMES_LENT}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalLoansTaken)
                  ? userData.totalLoansTaken
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_TIMES_BORROWED}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalDefaultedAsBorrower)
                  ? userData.totalDefaultedAsBorrower
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TIMES_DEFAULTED_AS_A_BORROWER}
              </p>
            </div>
            <div className={styles.col}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.totalDefaultedAsLender)
                  ? userData.totalDefaultedAsLender
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.TIMES_DEFAULTED_AS_A_LENDER}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getBehaviourLoanPurpose() {
    return (
      <div
        style={{backgroundColor: '#E7FED5', width: '93vw'}}
        className='mt-2 pb-4 container-area'>
        <h2
          className={`mt-4 font-weight-bold ${classNames(
            styles.subTabHeading
          )}`}>
          {INDIVIDUAL_ACCOUNT_CONST.BEHAVIOUR}: {INDIVIDUAL_ACCOUNT_CONST.DISCOVER}, {INDIVIDUAL_ACCOUNT_CONST.LOAN_PURPOSE}
        </h2>
        <div className='mt-3'>
          <div className={styles.rowDataBehaviour}>
            <div className={styles.colBehaviour}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.mostViewedArticle)
                  ? userData.mostViewedArticle
                  : APP_CONST.NA}
              </h1>

              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {COMMON_CONST.MOST_VIEWED_CONTENT}
              </p>
            </div>
            <div className={styles.colBehaviour}>
              <h1
                className={`display-5 ${notificationStyles.indGetBehaviourLeastText}`}>
                {checkValid(userData.leastViewedArticle)
                  ? userData.leastViewedArticle
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {COMMON_CONST.LEAST_VIEWED_CONTENT}
              </p>
            </div>
            <div className={styles.colBehaviour}>
              <h1
                className={`display-5 ${notificationStyles.indGetAccountLastOnline}`}>
                {checkValid(userData.mostLoanPurpose)
                  ? userData.mostLoanPurpose
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${classNames(
                  styles.bottomTexts
                )}`}>
                {INDIVIDUAL_ACCOUNT_CONST.MOST_POPULAR_LOAN_PURPOSE}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function GetAddDetect() {
    const [trustScore, setTrustScore] = useState(0);
    const [reason, setReason] = useState('');

    useEffect(() => {
      if (props.canReload) {
        onload();
      }
    }, [props.canReload]);

    const onSend = () => {
      if (trustScore !== 0 && reason.trim() !== '') {
        props.updateTrustScore({
          userId,
          delta: Math.abs(trustScore),
          sign: trustScore >= 0 ? '+' : '-',
          comments: reason,
        });
      }
    };

    return (
      <div
        className={classNames(
          'mt-5 container-area',
          props.location.state.activeTab === 'recoverable'
            ? styles.disCont
            : null
        )}>
        <h2 className='font-weight-bold'>{INDIVIDUAL_ACCOUNT_CONST.ADD}/{INDIVIDUAL_ACCOUNT_CONST.DEDUCT_TRUST_POINTS}</h2>
        <div className='mt-4'>
          <div className='row'>
            <div className='col-sm-6'>
              <p className={styles.header}>
               {INDIVIDUAL_ACCOUNT_CONST.ADD_DEDUCT_TRUSTPOINT_CONTENT}
              </p>
            </div>
            <div className='col-sm-6'>
              <p className={styles.header}>
                {INDIVIDUAL_ACCOUNT_CONST.ADD_DEDUCT_TRUSTPOINT_CONTENT}
              </p>
            </div>
          </div>
          <div className='row mt-4'>
            <div className='col-sm-6'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div
                  className={styles.iconBtnnLeft}
                  onClick={() => setTrustScore(trustScore - 1)}>
                  <span
                    className={`pi pi-minus ${notificationStyles.indGetAddDetuctIconStyle}`}
                    // style={{fontSize: '2em'}}
                  />
                </div>

                <div
                  className={notificationStyles.indGetAddDetuctPointContainer}>
                  <h1
                    className={`${trustScore >= 0 ? notificationStyles.indGetAddDetuctPositivePoint  : notificationStyles.indGetAddDetuctNegativePoint}`}>
                    {`${
                      trustScore > 0 ? '+' : trustScore < 0 ? '-' : ''
                    }${Math.abs(trustScore)}`}
                  </h1>
                </div>

                <div
                  className={styles.iconBtnnRight}
                  onClick={() => setTrustScore(trustScore + 1)}>
                  <span
                    className={`pi pi-plus ${notificationStyles.indGetAddDetuctIconStyle}`}
                    // style={{fontSize: '2em'}}
                  />
                </div>
              </div>
            </div>

            <div className='d-flex flex-row col-sm-6'>
              <div
                className={notificationStyles.indGetAddDetuctTextAreaContainer}>
                <textarea
                  value={reason}
                  placeholder={INDIVIDUAL_ACCOUNT_CONST.TEXTAREA_PLACEHOLDER}
                  className={notificationStyles.indGetAddDetuctTextAreaStyle}
                  rows={4}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              { UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_MANUAL_ADD_DETUCT) && 
              <div
                className={`d-flex align-items-center ${notificationStyles.indGetAddDetuctButtonStyle}`}
               >
                <button
                  onClick={onSend}
                  className={classNames(
                    'btn btn-primary btn-pill',
                    trustScore !== 0 && reason.trim() !== ''
                      ? ''
                      : 'btn-disabled'
                  )}>
                  {COMMON_CONST.SEND}
                </button>
              </div>
               }
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getHistoryOFTrustScore() {
    return (
      <div className={styles.trustScoreCont}>
        <h2 className='font-weight-bold'>
          {INDIVIDUAL_ACCOUNT_CONST.HISTORY_OF_MANUAL_TRUSTSCORE_CHANGES}
        </h2>
        <div className='row mt-4'>
          {userData?.tsAudit ? (
            <div className='col-sm-8 ts-table'>
              <DataTable
                value={userData?.tsAudit?.reverse()}
                scrollHeight='230px'
                scrollable={true}
                className={notificationStyles.indDataTableStyle}
                emptyMessage={INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}>
                <Column
                  field='createdOn'
                  header={INDIVIDUAL_ACCOUNT_CONST.DATE}
                  body={(rowData) => (
                    <span>
                      {dayjs(rowData?.createdOn).format('DD.MM.YYYY')}
                    </span>
                  )}></Column>
                <Column field='trustScore' header={COMMON_CONST.TRUSTSCORE}></Column>
                <Column field='delta' header={INDIVIDUAL_ACCOUNT_CONST.DELTA}></Column>
                <Column field='result' header={INDIVIDUAL_ACCOUNT_CONST.RESULT}></Column>
                <Column
                  // headerStyle={{
                  //   width: '349px',
                  // }}
                  // bodyStyle={{
                  //   width: '349px',
                  // }}
                  headerClassName={notificationStyles.indDataTableCommentStyle}
                  bodyClassName={notificationStyles.indDataTableCommentStyle}
                  field='comments'
                  header={INDIVIDUAL_ACCOUNT_CONST.COMMENT}></Column>
              </DataTable>
            </div>
          ) : (
            <h6>{INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}</h6>
          )}
        </div>
      </div>
    );
  }

  function getHistoryOFBlockingUnBlocking() {
    return (
      <div className={styles.trustScoreCont}>
        <h2 className='font-weight-bold'>{INDIVIDUAL_ACCOUNT_CONST.HISTORY_OF_BLOCKING}</h2>
        <div className='row mt-4'>
          {userData?.blockHistory ? (
            <div className='col-sm-8 ts-table'>
              <DataTable
                value={userData?.blockHistory}
                scrollHeight='230px'
                scrollable={true}
                className={notificationStyles.indDataTableStyle}
                emptyMessage={INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}>
                <Column
                  field='actedAt'
                  header={INDIVIDUAL_ACCOUNT_CONST.DATE}
                  body={(rowData) => (
                    <span>
                      {dayjs(rowData?.createdOn).format('DD.MM.YYYY')}
                    </span>
                  )}></Column>
                <Column field='userTS' header={COMMON_CONST.TRUSTSCORE}></Column>
                <Column field='adminAction' header={INDIVIDUAL_ACCOUNT_CONST.ACTION}></Column>
                <Column
                  // headerStyle={{
                  //   width: '349px',
                  // }}
                  // bodyStyle={{
                  //   width: '349px',
                  // }}
                  headerClassName={notificationStyles.indDataTableCommentStyle}
                  bodyClassName={notificationStyles.indDataTableCommentStyle}
                  field='details'
                  header={`${INDIVIDUAL_ACCOUNT_CONST.REASON} / ${INDIVIDUAL_ACCOUNT_CONST.COMMENT}`}></Column>
              </DataTable>
            </div>
          ) : (
            <h6>{INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}</h6>
          )}
        </div>
      </div>
    );
  }

  function getHistoryOFDefault() {
    return (
      <div className={styles.trustScoreCont}>
        <h2 className='font-weight-bold'>{INDIVIDUAL_ACCOUNT_CONST.HISTORY_OF_DEFAULTS}</h2>
        <div className='row mt-4'>
          {userData?.defaultedLoans ? (
            <div className='col-sm-12 ts-table'>
              <DataTable
                value={userData?.defaultedLoans}
                scrollHeight='230px'
                scrollable={true}
                className={notificationStyles.indDataTableStyle}
                emptyMessage={INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}>
                <Column
                  field='actedAt'
                  header={INDIVIDUAL_ACCOUNT_CONST.DATE_OF_LOAN}
                  body={(rowData) => (
                    <span>
                      {dayjs(rowData?.createdOn).format('DD.MM.YYYY')}
                    </span>
                  )}></Column>
                <Column field='investorName' header={INDIVIDUAL_ACCOUNT_CONST.INVESTOR_NAME}></Column>
                <Column field='loanAmount' header={INDIVIDUAL_ACCOUNT_CONST.AMOUNT_BORROWED}></Column>
                <Column field='loanTenure' header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DURATION}></Column>
                <Column
                  field='dueDate'
                  header={INDIVIDUAL_ACCOUNT_CONST.LOAN_DUE_DATE}
                  body={(rowData) => (
                    <span>{dayjs(rowData?.dueDate).format('DD.MM.YYYY')}</span>
                  )}></Column>
                <Column
                  field='paidDate'
                  header={INDIVIDUAL_ACCOUNT_CONST.PAYBACK_DATE}
                  body={(rowData) => (
                    <span>
                      {rowData?.paidDate
                        ? dayjs(rowData?.paidDate).format('DD.MM.YYYY')
                        : '-'}
                    </span>
                  )}></Column>
                <Column field='status' header={INDIVIDUAL_ACCOUNT_CONST.CURRENT_STATUS}></Column>
              </DataTable>
            </div>
          ) : (
            <h6>{INDIVIDUAL_ACCOUNT_CONST.TABLE_EMPTY_MESSAGE}</h6>
          )}
        </div>
      </div>
    );
  }

  function navigateToAccountList() {
    const {history, location} = props;
    dispatch(updateNavigatedFrom({...location.state}));
    history.push({
      pathname: '/admin/Notifications/list',
      state: {...location.state},
    });
  }
  function ActiveDefaultLOans() {
    setShowLoanModal(!ShowLoanModal);
  }
  function onHideLoanModal() {
    setShowLoanModal(false);
  }

  return (
    <div className={`wrapper`}>
      <Header title={COMMON_CONST.ACCOUNT_CENTER} desc={ACCOUNT_LIST_CONST.REVIEW_LENDWILL_ACCOUNTS}></Header>
      <div
        className={`row container-area row justify-content-between ${styles.rowData}`}>
        <div className='col-12'>
        <div className='row'>
            <div className='d-flex justify-content-end col-12'>
            {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_MANUAL_LOAN_CLOSE) && 
              <button
                onClick={(e) => ActiveDefaultLOans()}
                className='btn btn-success btn-pill'>
                {INDIVIDUAL_ACCOUNT_CONST.ACTIVE}/ {INDIVIDUAL_ACCOUNT_CONST.DEFAULTED_LOANS}
              </button>
            }
            </div>
          </div>
          <div className='row'>
            <span
              role='button'
              className={`pi pi-arrow-left ${notificationStyles.IndNavLeftIconStyle}`}
              // style={{fontSize: '2em'}}
              onClick={navigateToAccountList}
            />
            <h5 className='mt-1 font-weight-bold col-2'>
              {userData && `${userData.name} ${userData.surname}`}
            </h5>
          </div>
        </div>

        <div className='d-flex justify-content-end col-12'>
          {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_RESET_INVEST) && 
            <button
              className='btn btn-dark btn-pill'
              onClick={resetLendingConsent}>
              {COMMON_CONST.RESET_INVESTMENT_LIMIT}
            </button>
          }

          {props.location.state?.showBlockUnBlock && UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_BLK_UNBLK) && (
            <div
              className={classNames(
                'pl-4',
                props.location.state.activeTab === 'recoverable'
                  ? styles.disCont
                  : null
              )}>
              {isActive ? (
                <button
                  onClick={(e) => setVisible(!visible)}
                  className='btn btn-danger btn-pill'>
                  {COMMON_CONST.BLOCK}
                </button>
              ) : (
                <button
                  onClick={(e) => setVisible(!visible)}
                  className='btn btn-success btn-pill'>
                  {COMMON_CONST.UNBLOCK}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <hr />
      <div className={styles.profileWrapper}>
        {getProfile()}
        {getAccountOverview()}
        {getBorrowingTrans()}
        {getLendingTrans()}
        {getOverview()}
        {getBehaviourLoanPurpose()}
      </div>
      <GetAddDetect />
      {getHistoryOFTrustScore()}
      {getHistoryOFBlockingUnBlocking()}
      {getHistoryOFDefault()}

      <AccountDialog
        block={blockAccount}
        unBlock={unBlockAccount}
        onChange={handleChangeReason}
        onHide={onHide}
        visible={visible}
        action={isActive ? 'Block' : 'UnBlock'}
        profile={`${userData.name} ${userData.surname} `}
      />
        <LoanDialog
        block={blockAccount}
        unBlock={unBlockAccount}
        onChange={handleChangeReason}
        onHide={onHideLoanModal}
        visible={ShowLoanModal}
        userId={userId}
        action={isActive ? 'Block' : 'UnBlock'}
        profile={`${userData.name} ${userData.surname} `}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loggedUser: state.Login.userData ? state.Login.userData : {},
    canReload: state?.AccountListReducer?.reloadProfile,
  };
};

const mapDispatchToProps = (dispatch) => ({
  reloadProfile: (data) => dispatch(reloadProfile(data)),
  updateTrustScore: (data) => dispatch(updateTrustScore(data)),
  blockOrUnblockAccount: (data) => dispatch(blockOrUnblockAccount(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(InduvidualAccount);

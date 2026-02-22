import { getAnalyticsCase } from "app/common/api/analytics.api";
import Header from "app/common/components/Header/header.component";
import APP_CONST from "app/common/constants/app.constant";
import * as AnalyticsAction from "app/store/actions/analytics.action";
import { ReactComponent as Icon_info } from 'assets/icon/icon_info.svg';
import { hideLoader, showLoader } from "app/store/actions/app.action";
import { AnalyticsDialog } from "app/pages/secure/Analytics/dialog/analytics.dialog.component";
import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { epochToDate, epochTime } from "app/common/components/widgets/common"
import { getCountryPoint } from 'app/common/config/config';
import { StackedBarChartExample } from './Chart'
import { SetImages } from './ImportSvgImage'
import style from "./analytics.module.scss";
import { ANALYTICS_CONST, COMMON_CONST, INDIVIDUAL_ACCOUNT_CONST, NAVIGATION_ROUTE_FROM } from "app/common/constants/constant";
import * as ApiConstants from 'app/common/constants/api.constants'

function Analytics(props) {

  const retryCount = useRef(1);

  const dispatch = useDispatch();

  const [showDefaultUserDialog, setShowDefaultUserDialog] = useState(false);
  const [analyticsInfo, setanalyticsInfo] = useState("");

  const [TotalUsedCount, setTotalUsedCount] = useState(0);
  const [IAgeGroupCount, setIAgeGroupCount] = useState(0);
  const [IAgeGroupArray, setIAgeGroupArray] = useState([]);
  const [BAgeGroupCount, setBAgeGroupCount] = useState(0);
  const [BAgeGroupArray, setBAgeGroupArray] = useState(0);

  useEffect(onload, []);

  function onload() {


    if (retryCount.current === 1) {
      dispatch(showLoader());
    }

    getAnalyticsCase().then(res => {
      console.log(res)

      if (res.status !== 200) {
        retryCount.current = 1;
        dispatch(AnalyticsAction.analyticsError(res.data));
        dispatch(hideLoader());
      } else {

        const StaticJson = res.data
        var addFulllist = StaticJson.bCategoryConfigs.reduce(function (acc, obj) { return acc + obj.usedCount; }, 0);
        setTotalUsedCount(addFulllist)
        let Count = 0;
        let lagegroupArray = [];
        let lagegroupArrayPercentValue = [];
        for (let [key, value] of Object.entries(StaticJson.lAgeGroup)) {
          lagegroupArray.push(value)
          Count = Count + value
        }
        for (let [key, value] of Object.entries(lagegroupArray)) {
          lagegroupArrayPercentValue.push(Math.round(((value / Count) * 100)))
        }
        setIAgeGroupCount(Count)

        setIAgeGroupArray(lagegroupArrayPercentValue)
        let Count1 = 0;
        let BagegroupArray = [];
        let BagegroupArrayPercentValue = []
        for (let [key, value] of Object.entries(StaticJson.bAgeGroup)) {
          BagegroupArray.push(value)
          Count1 = Count1 + value
        }
        for (let [key, value] of Object.entries(BagegroupArray)) {
          BagegroupArrayPercentValue.push(Math.round(((value / Count1) * 100)))
        }
        setBAgeGroupCount(Count1)
        setBAgeGroupArray(BagegroupArrayPercentValue)
        setanalyticsInfo(res.data)

        if (retryCount.current > 5) {
          retryCount.current = 1;
          dispatch(AnalyticsAction.analyticsError(res.data));
          dispatch(hideLoader());
          return;
        }
        if (res.data.actionStatus !== "COMPLETED") {
          retryCount.current++;
          setTimeout(onload, 1000);
          return;
        }
        if (res.data.actionStatus === 'COMPLETED') {
          dispatch(AnalyticsAction.analyticsSucc(res.data));
          dispatch(hideLoader());
        }


      }


    })
  }

  return (
    <div className={`wrapper ${style.analyticsWrapper}`}>

      <Header title={COMMON_CONST.ANALYTICS} desc={`${ANALYTICS_CONST.ANALYTICS_SUB_TEXT} ${epochToDate(analyticsInfo?.lastAccessTime)} @ ${epochTime(analyticsInfo?.lastAccessTime)} ${ANALYTICS_CONST.ANALYTICS_SUB_TEXT_HOURS}`}></Header>
      <hr />
      {getUserAndStorage()}
      {getMatchesOverview()}
      {getTransactions()}
      {getBehaviourOverview()}
      {getDiscover()}
      {MatchingFeesOverview()}
      {getDemographics()}
      {showDefaultedUserList()}
    </div>
  );

  function checkValid(value) {
    if (value === undefined || value === null) return false;
    return true;
  }

  function getUserAndStorage() {
    return (
      <div className="mt-3 container-area">
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          {ANALYTICS_CONST.USERS_AND_USAGE}
        </h2>
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totUser)
                  ? analyticsInfo.totUser
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.TOTAL_USERS_ON_LENDWILL}
              </p>
              <p
                className={`${checkColor(analyticsInfo.lwTotUsers)} mt-4 text-uppercase font-weight-bold ${style.bottomText}`}
              >
                {`${Checknegative(analyticsInfo.lwTotUsers)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_WEEK}`}
              </p>
            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.activeUser)
                  ? analyticsInfo.activeUser
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.ACTIVE_USERS_IN_LAST_SIX_HOURS}
              </p>
            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totTrans)
                  ? analyticsInfo.totTrans
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.TOTAL_TRANSACTION_ON_LENDWILL}
              </p>
              <p
                className={`${checkColor(analyticsInfo.lwTotTransactions)} mt-4 text-uppercase font-weight-bold ${style.bottomText}`}
              >
                {`${Checknegative(analyticsInfo.lwTotTransactions)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_WEEK}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getDiscover() {
    return (
      <div className="mt-3 container-area">
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          {ANALYTICS_CONST.CONTENT_OVERVIEW}
        </h2>
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.contentViews)
                  ? analyticsInfo.contentViews
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.NUMBER_OF_VIEWS_FOR_ALL_CONTENT}
              </p>
            </div>
            <div className="col-sm-2">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.quizTaken)
                  ? analyticsInfo.quizTaken
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.QUIZZES_TAKEN}
              </p>
            </div>
            <div className="col-sm-2">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.quizAnswered)
                  ? analyticsInfo.quizAnswered
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.CORRECT_QUIZ_ANSWERS}
              </p>
            </div>
            <div className="col-sm-5">
              {analyticsInfo?.mostViewedContent?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? 
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5 text-truncate`}
                title={analyticsInfo.mostViewedContent}
              >
                {`${analyticsInfo.mostViewedContent}`}
              </h1>
              :
              <h1
              className={`${style.textGreen} ${style.analyticsHeadText} display-5 text-truncate`}
              >
              {`${analyticsInfo.mostViewedContent}`}
              </h1>
              }
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {COMMON_CONST.MOST_VIEWED_CONTENT}
              </p>
            </div>
            <div className="col-sm-4">
              <h1
                className={`${style.textRed} ${style.analyticsHeadText} display-5`}
              >
                {`${analyticsInfo.leastViewedContent}`}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {COMMON_CONST.LEAST_VIEWED_CONTENT}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function PercentageCalculator(id, status) {
    if (status == 1) {
      return Math.round(((id / IAgeGroupCount) * 100))
    }
    else {
      return Math.round(((id / BAgeGroupCount) * 100))
    }
  }



  function getDemographics() {
    return (<div className="mt-3 container-area">
      <h2 className={`font-weight-bold ${style.subTabHeading}`}>
        {ANALYTICS_CONST.DEMOGRAPHICS}
      </h2>

      <div className="mt-3">
        <div className="row">
          <div className="col-sm-6">
            {analyticsInfo.lAgeGroup &&
              <StackedBarChartExample
                title={ANALYTICS_CONST.STACK_BAR_CHART_TITLE1}
                color={'#ECDAFE'}
                IAgeGroupArray={IAgeGroupArray}
                labels={[
                  `21-25\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[25], 1)}%`,
                  `26-30\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[30], 1)}%`,
                  `31-40\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[40], 1)}%`,
                  `41-50\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[50], 1)}%`,
                  `51-60\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[60], 1)}%`,
                  `60+\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.lAgeGroup[150], 1)}%`,
                ]}
              // labels={ConstructLabel()}
              />
            }
            <div className={style.demographicBAgeStyle}>
              {analyticsInfo.bAgeGroup &&
                <StackedBarChartExample
                  title={ANALYTICS_CONST.STACK_BAR_CHART_TITLE2}
                  color={'#E7FED5'}
                  IAgeGroupArray={BAgeGroupArray}
                  labels={[
                    `21-25\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[25], 2)}%`,
                    `26-30\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[30], 2)}%`,
                    `31-40\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[40], 2)}%`,
                    `41-50\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[50], 2)}%`,
                    `51-60\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[60], 2)}%`,
                    `60+\t\t\t\t\t\t${PercentageCalculator(analyticsInfo.bAgeGroup[150], 2)}%`,
                  ]}
                />
              }
            </div>
          </div>
          <div className="col-sm-2"></div>
          <div className="col-sm-4">
            <div className="row"><p className={style.demographicLoanPurposeText}>{ANALYTICS_CONST.LOAN_PURPOSES}</p></div>
            <div className="row align-items-end">
              {analyticsInfo.bCategoryConfigs && analyticsInfo.bCategoryConfigs.map((item) => {
                return (<SetImages list={item} totalUsed={TotalUsedCount} />)
              })
              }
            </div>

          </div>
        </div>
      </div>

    </div>)

  }



  function getBehaviourOverview() {
    return (
      <div className={`mt-2 pb-3 container-area ${style.lightGreenBanner}`}>
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          {ANALYTICS_CONST.BEHAVIOUR_OVERVIEW}
        </h2>
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-3">
              <h1
                className={`display-5 ${style.textGreen} ${style.analyticsHeadText}`}
              >
                {checkValid(analyticsInfo.avgEarlyPayBackRate)
                  ? `${analyticsInfo.avgEarlyPayBackRate}%`
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.AVERAGE_USER_EARLY_PAYBACK_RATE_ALL_TIME}
              </p>
              <p
                className={`mt-4 text-uppercase font-weight-bold ${checkColor(analyticsInfo.lmEarlyPayback)} ${style.bottomText}`}
              >
                {`${Checknegative(analyticsInfo.lmEarlyPayback)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_MONTH}`}


              </p>
            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.avgDefaultLoanRate)
                  ? `${analyticsInfo.avgDefaultLoanRate}%`
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {" "}
                {ANALYTICS_CONST.AVERAGE_DEFAULT_LOAN_RATE}
              </p>
              <p
                className={`mt-4 text-uppercase font-weight-bold ${checkColor(analyticsInfo.lmDefLoans)} ${style.bottomText}`}
              >
                {" "}
                {`${Checknegative(analyticsInfo.lmDefLoans)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_MONTH}`}

              </p>
            </div>
            <div className="col-sm-2">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.avgTrustScore)
                  ? analyticsInfo.avgTrustScore
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.AVERAGE_TRUST_SCORE}
              </p>
              {/* <p
                className={`mt-4 text-uppercase font-weight-bold  ${style.textGreen}  ${style.bottomText}`}
              >
                +15% compared to last month
              </p> */}
            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {analyticsInfo && analyticsInfo?.bCategoryConfigs[0]?.name}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {INDIVIDUAL_ACCOUNT_CONST.MOST_POPULAR_LOAN_PURPOSE}
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }


  function MatchingFeesOverview() {
    return (
      <div className={`mt-2 pb-3 container-area ${style.lightGreenBanner}`}>
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          Matching Fees Overview
        </h2>
        <div className="mt-3">
          <div className="row">

          <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.paidMFEE)
                  ? analyticsInfo.paidMFEE
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.paidMFEE) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                Overall matching fees collected
              </p>
            </div>

            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.lmPaidMFEE)
                  ? analyticsInfo.lmPaidMFEE
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.lmPaidMFEE) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                Fees  PAid last month
              </p>
            </div> 
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.unpaidMFEE)
                  ? analyticsInfo.unpaidMFEE
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.unpaidMFEE) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
               Unpaid matching fees
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  function getTransactions() {
    return (
      <div className="mt-3 container-area">
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          {COMMON_CONST.TRANSACTIONS}
        </h2>
        <div className="mt-3">
          <div className={style.rowData}>

            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totBorrowedAmt)
                  ? analyticsInfo.totBorrowedAmt
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.totBorrowedAmt) && getCountryPoint(true)}
                </span>
              </h1>

              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_BORROWED_ALL_TIME}
              </p>
            </div>
            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totPaidAmt)
                  ? analyticsInfo.totPaidAmt
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.totPaidAmt) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_PAID_BACK_ALL_TIME}
              </p>
            </div>

            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totInterestPaid)
                  ? analyticsInfo.totInterestPaid
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.totInterestPaid) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.TOTAL_INTEREST_PAID_ALL_TIME}
              </p>
            </div>

            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.avgLoanAmtByBorr)
                  ? analyticsInfo.avgLoanAmtByBorr
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.avgLoanAmtByBorr) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
               {` ${ANALYTICS_CONST.AVERAGE_LOAN_AMOUNT_PER_BORROWER}
                (${ANALYTICS_CONST.SUM_OF_ALL_LOANS}/${ANALYTICS_CONST.TOTAL_NO_OF_BORROWERS}) `}
              </p>
            </div>



          </div>

          <div className={style.rowData}>

            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.avgLoanAmt)
                  ? analyticsInfo.avgLoanAmt
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.avgLoanAmt) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.AVERAGE_LOAN_AMOUNT}<br />
                ({ANALYTICS_CONST.SUM_OF_ALL_LOANS} / {ANALYTICS_CONST.TOTAL_NO_OF_LOANS} )
              </p>
            </div>


            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totActiveLoanAmt)
                  ? analyticsInfo.totActiveLoanAmt
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.totActiveLoanAmt) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.TOTAL_NOT_REPAID}
              </p>
            </div>

            <div className={style.col}>
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totDefaultAmt)
                  ? analyticsInfo.totDefaultAmt
                  : APP_CONST.NA}
                <span
                  className={`align-text-middle ml-2 ${style.currencyText}`}
                >
                  {checkValid(analyticsInfo.totDefaultAmt) && getCountryPoint(true)}
                </span>
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {INDIVIDUAL_ACCOUNT_CONST.TOTAL_DEFAULTED}
                <a href="javascript:void(0)" onClick={() => setShowDefaultUserDialog(true)} className={style.transactionInfoIconStyle}>
                  <Icon_info />
                </a>
              </p>
            </div>

            <div className={style.col}>

            </div>
          </div>
        </div>
      </div>
    );
  }

  function showDefaultedUserList() {

    return (
      <AnalyticsDialog
        onHide={() => setShowDefaultUserDialog(false)}
        visible={showDefaultUserDialog}
        defaultedUsersList={analyticsInfo.defUsers}
        onDefaultedUserSelected={onNavigateToInduvidual}
      />
    );
  }

  function onNavigateToInduvidual(rowData) {
    setShowDefaultUserDialog(false);
    const {ADMIN,SIDEBAR_ACCOUNT,INDIVIDUAL} = ApiConstants;
    const navigationRoutePath = ADMIN + SIDEBAR_ACCOUNT + INDIVIDUAL;
    const {ANALYTICS} = NAVIGATION_ROUTE_FROM;

    props.history.push({
      pathname: navigationRoutePath,
      state: {
        userData: rowData.data,
        from: ANALYTICS
      }
    });
  }

  function Checknegative(value) {
    if (!value) {
      return value
    } else {
      try {
        if (value.toString().charAt(0) === "-") {
          return value
        }
        else {
          return "+" + value
        }

      } catch (error) {
        return 0
      }
    }

  }

  function checkColor(value) {
    if (value) {
      if (value.toString().charAt(0) === "-") {
        return style.textRed

      } else {
        return style.textGreen
      }
    }
    // style.textGreen
  }


  function getMatchesOverview() {
    return (
      <div className={`mt-2 pb-3 container-area ${style.lightGreenBanner}`}>
        <h2 className={`font-weight-bold ${style.subTabHeading}`}>
          {ANALYTICS_CONST.MATCHES_OVERVIEW}
        </h2>
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totMatchLstWeek)
                  ? analyticsInfo.totMatchLstWeek
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.SUCCESS_MATCHES_LAST_WEEK}
              </p>
              <p
                className={`mt-4 text-uppercase font-weight-bold ${checkColor(analyticsInfo.lwTotMatches)} ${style.bottomText}`}
              >
                {`${Checknegative(analyticsInfo.lwTotMatches)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_WEEK}`}

              </p>

            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totMatchLstMonth)
                  ? analyticsInfo.totMatchLstMonth
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.SUCCESS_MATCHES_LAST_MONTH}
              </p>
              <p
                className={`mt-4 text-uppercase font-weight-bold ${checkColor(analyticsInfo.lmTotMatches)} ${style.bottomText}`}
              >
                {`${Checknegative(analyticsInfo.lmTotMatches)}% ${ANALYTICS_CONST.COMPARED_TO_LAST_MONTH}`}
              </p>

            </div>
            <div className="col-sm-3">
              <h1
                className={`${style.textGreen} ${style.analyticsHeadText} display-5`}
              >
                {checkValid(analyticsInfo.totMatchs)
                  ? analyticsInfo.totMatchs
                  : APP_CONST.NA}
              </h1>
              <p
                className={`mt-4 text-uppercase font-weight-bold text-muted ${style.bottomText}`}
              >
                {ANALYTICS_CONST.SUCCESS_MATCHES_ALL_TIME}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userData: state.Login.userData ? state.Login.userData : {},
    allAccountList: state.AccountListReducer.allAccountList
      ? state.AccountListReducer.allAccountList
      : [],
    analyticsInfo: state.AnalyticsReducer.analytics
      ? state.AnalyticsReducer.analytics
      : {},
  };
};

// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators(Object.assign(AnalyticsAction), dispatch),
// });

export default connect(mapStateToProps)(Analytics);

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "app/common/components/Header/header.component";
import styles from "./heartbeatstyles.module.scss";
import { hideLoader, showLoader } from "app/store/actions/app.action";
import {
  epochToDate,
  epochToDateDay,
  epochTimeAM_PM,
} from "app/common/components/widgets/common";
import { getHeartBeatCase, getUpdateCase } from "app/common/api/heartbeat.api";
import {
  COMMON_CONST,
  HEARTBEAT_CONST,
  USER_ROLE_CONFIG_KEY,
} from "app/common/constants/constant";
import UtilsHelper from "app/common/services/utilsHelper";
import {
  heartBeatFirstPoint,
  heartBeatSecondPoint,
  heartBeatThirdPoint,
  heartBeatFourthPoint,
  heartBeatInternalFirstPoint,
  heartBeatInternalSecondPoint,
  heartBeatInternalThirdPoint,
  heartBeatInternalFourthPoint,
  heartBeatInternalFifthPoint,
  heartBeatInternalSixthPoint,
  heartBeatInternalSeventhPoint,
  heartBeatBlockFirstPoint,
  heartBeatBlockSecondPoint,
  heartBeatBlockThirdPoint,
} from "./heartBeatIndicator";
import HeartBeatInternal from "./heartBeatInternal.component";

function HeartBeat() {
  const dispatch = useDispatch();
  const getStore = useSelector((store) => store.OTP);
  const servicePageName = [
    HEARTBEAT_CONST.HEARTBEAT_INTER_HEADER,
    HEARTBEAT_CONST.HEARTBEAT_BLOCKCHAIN_HEADER,
    HEARTBEAT_CONST.HEARTBEAT_PARTNERSCHECK_HEADER,
  ];
  const [lastSync, setLastSync] = useState([]);
  const [servicePageVisible, setServicePageVisible] = useState(false);
  const [selectServicePage, setSelectServicePage] = useState("");
  const [internalPageData, setInternalPageData] = useState([]);
  const [blockChainPageData, setBlockChainPageData] = useState([]);
  const [partnersPageData, setPartnersPageData] = useState([]);
  const [servicePageData, setServicePageData] = useState([]);
  const [internalIndicatorImg, setInternalIndicatorImg] = useState("");
  const [blockChainIndicatorImg, setBlockChainIndicatorImg] = useState("");
  const [partnersIndicatorImg, setPartnersIndicatorImg] = useState("");
  const [indicatorActiveCount, setIndicatorActiveCount] = useState(0);
  const totalSubIndicatorCount = 3;

  useEffect(() => {
    onload();
  }, []);

  function onload() {
    dispatch(showLoader());
    const CurrentNavigateState = getStore.TabNavigate;
    if (CurrentNavigateState) {
      dispatch({
        type: "NavigationState",
        TabNavigate: "",
      });
    }
    getHeartBeatCase().then((res) => {
      updateTable(res);
    });
  }

  const updateTable = (res) => {
    setInternalPageData(res?.data?.internalList);
    setBlockChainPageData(res?.data?.blockChainList);
    setPartnersPageData(res?.data?.externalList);
    let lastSyncData = res.data?.internalList.slice(0, 1);
    setLastSync(lastSyncData);
    let internalIndicatorRangeCheck = internalIndicatorCheck(
      res?.data?.internalCount
    );
    setInternalIndicatorImg(internalIndicatorRangeCheck);
    let blockChainIndicatorRangeCheck = blockChainPartnerIndicatorCheck(
      res?.data?.blockChainCount
    );
    setBlockChainIndicatorImg(blockChainIndicatorRangeCheck);
    let partnersIndicatorRangeCheck = blockChainPartnerIndicatorCheck(
      res?.data?.externalCount
    );
    setPartnersIndicatorImg(partnersIndicatorRangeCheck);
    dispatch(hideLoader());
  };

  const getUpdate = () => {
    dispatch(showLoader());
    setIndicatorActiveCount(0);
    getUpdateCase().then((res) => {
      updateTable(res);
    });
  };

  const internalIndicatorCheck = (indicatorValue) => {
    if (indicatorValue === 28) {
      setIndicatorActiveCount((prev) => prev + 1);
      return heartBeatInternalSeventhPoint;
    } else if (indicatorValue >= 25 && indicatorValue <= 27) {
      return heartBeatInternalSixthPoint;
    } else if (indicatorValue >= 19 && indicatorValue <= 24) {
      return heartBeatInternalFifthPoint;
    } else if (indicatorValue >= 13 && indicatorValue <= 18) {
      return heartBeatInternalFourthPoint;
    } else if (indicatorValue >= 7 && indicatorValue <= 12) {
      return heartBeatInternalThirdPoint;
    } else if (indicatorValue >= 1 && indicatorValue <= 6) {
      return heartBeatInternalSecondPoint;
    } else {
      return heartBeatInternalFirstPoint;
    }
  };

  const blockChainPartnerIndicatorCheck = (indicatorValue) => {
    if (indicatorValue === 2) {
      setIndicatorActiveCount((prev) => prev + 1);
      return heartBeatBlockThirdPoint;
    } else if (indicatorValue === 1) {
      return heartBeatBlockSecondPoint;
    } else {
      return heartBeatBlockFirstPoint;
    }
  };

  const UpdateButton = () => {
    return (
      <div>
        <button
          className={`btn btn-primary btn-pill btn-pill-lg text-uppercase ${styles.buttonPx}`}
          onClick={() => getUpdate()}
        >
          {HEARTBEAT_CONST.RETRIGER_NOW}
        </button>
      </div>
    );
  };

  const inactiveIndicator = totalSubIndicatorCount - indicatorActiveCount;

  const mainIndicatorImg =
    indicatorActiveCount === 3
      ? heartBeatFourthPoint
      : indicatorActiveCount === 2
      ? heartBeatThirdPoint
      : indicatorActiveCount === 1
      ? heartBeatSecondPoint
      : heartBeatFirstPoint;

  const servicePageNavigation = (servicePageName, servicePageData) => {
    setServicePageData([]);
    setSelectServicePage(servicePageName);
    setServicePageVisible(true);
    setServicePageData(servicePageData);
  };

  function getHeartbeatOverview() {
    return (
      <div className={`mt-2 pb-3 container-area ${styles.lightGreenBanner}`}>
        <h2 className={`font-weight-bold ${styles.subTabHeading}`}>
          {HEARTBEAT_CONST.STATUS_UPADTED_ON}{" "}
          <span className="text-uppercase">
            {epochToDateDay(lastSync?.[0]?.checkedOn)}
          </span>
          , {epochToDate(lastSync?.[0]?.checkedOn)} and{" "}
          {epochTimeAM_PM(lastSync?.[0]?.checkedOn)}
        </h2>
        <div className="mt-3">
          <div className="row">
            <div className="col-sm-3">
              <h1
                className={`${styles.textGreen} ${styles.heartBeatHeadText} display-5`}
              >
                {totalSubIndicatorCount}
              </h1>
              <p
                className={`mt-2 text-uppercase font-weight-bold ${styles.bottomText}`}
              >
                {HEARTBEAT_CONST.TOTAL_NUMBER_OF_SERVICES}
              </p>
            </div>
            <div className="col-sm-3">
              <h1
                className={`${styles.textGreen} ${styles.heartBeatHeadText} display-5`}
              >
                {indicatorActiveCount}
              </h1>
              <p
                className={`mt-2 text-uppercase font-weight-bold ${styles.bottomText}`}
              >
                {HEARTBEAT_CONST.ACTIVE_SERVICES}
              </p>
            </div>
            <div className="col-sm-3">
              <h1
                className={`${styles.textRed} ${styles.heartBeatHeadText} display-5`}
              >
                {inactiveIndicator}
              </h1>
              <p
                className={`mt-2 text-uppercase font-weight-bold ${styles.bottomText}`}
              >
                {HEARTBEAT_CONST.NUMBER_OF_SERVICES_DOWN}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!servicePageVisible ? (
        <div className="wrapper">
          <div className={styles.heartBeatHeaderContainer}>
            <Header
              title={COMMON_CONST.HEARTBEAT}
              desc={HEARTBEAT_CONST.HEADER_TITLE_SUBTEXT}
            ></Header>
            {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.HEARTBEAT) && (
              <div className={styles.buttonContainer}>
                <UpdateButton />
              </div>
            )}
          </div>
          {getHeartbeatOverview()}
          <div className="col-12 text-center pt-5">
            <img
              src={mainIndicatorImg}
              className={styles.heartbeatMainIndicatorImgStyle}
            />
            <p className={styles.heartbeatMainIndicatorTextStyle}>
              {COMMON_CONST.HEARTBEAT}
            </p>
          </div>
          <div className="row pt-5 px-5">
            <div className="col-4 text-center">
              <img
                src={internalIndicatorImg}
                className={styles.heartbeatSubIndicatorImgStyle}
              />
              <p
                className={styles.heartbeatSubIndicatorTextStyle}
                onClick={() => {
                  servicePageNavigation(servicePageName[0], internalPageData);
                }}
              >
                {HEARTBEAT_CONST.HEARTBEAT_INTER_HEADER}
              </p>
            </div>
            <div className="col-4 text-center">
              <img
                src={blockChainIndicatorImg}
                className={styles.heartbeatSubIndicatorImgStyle}
              />
              <p
                className={styles.heartbeatSubIndicatorTextStyle}
                onClick={() => {
                  servicePageNavigation(servicePageName[1], blockChainPageData);
                }}
              >
                {HEARTBEAT_CONST.HEARTBEAT_BLOCKCHAIN_HEADER}
              </p>
            </div>
            <div className="col-4 text-center">
              <img
                src={partnersIndicatorImg}
                className={styles.heartbeatSubIndicatorImgStyle}
              />
              <p
                className={styles.heartbeatSubIndicatorTextStyle}
                onClick={() => {
                  servicePageNavigation(servicePageName[2], partnersPageData);
                }}
              >
                {HEARTBEAT_CONST.HEARTBEAT_PARTNERSCHECK_HEADER}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <HeartBeatInternal
          {...{ setServicePageVisible, servicePageData }}
          servicePageName={selectServicePage}
        />
      )}
    </>
  );
}

export default HeartBeat;

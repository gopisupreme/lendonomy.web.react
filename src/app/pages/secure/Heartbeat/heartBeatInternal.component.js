import React, { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Header from "app/common/components/Header/header.component";
import styles from "./heartbeatstyles.module.scss";
import {
  epochToDate,
  epochToDateDay,
  epochTimeAM_PM,
} from "app/common/components/widgets/common";
import { ReactComponent as Icon_CircleGreen } from "assets/icon/icon_circle-green.svg";
import { ReactComponent as Icon_CircleRed } from "assets/icon/icon_circle-red.svg";
import { COMMON_CONST, HEARTBEAT_CONST } from "app/common/constants/constant";

function HeartBeatInternal(props) {
  const { servicePageName, setServicePageVisible, servicePageData } = props;
  const [leftTable, setLeftTable] = useState([]);
  const [rightTable, setRightTable] = useState([]);
  const [responseData, setServiceData] = useState([]);
  const [lastSync, setLastSync] = useState([]);
  const [activeService, setActiveService] = useState(0);
  const [inActiveService, setInActiveService] = useState(0);
  const tableVisibleLimit = 10;

  useEffect(() => {
    onload();
  }, []);

  function onload() {
    updateTable(servicePageData);
  }

  const updateTable = (servicePageData) => {
    setServiceData(servicePageData);
    let lastSyncData = servicePageData?.slice(0, 1);
    setLastSync(lastSyncData);
    const ActiveService = servicePageData?.filter((i) => i.isActive);
    const inactiveServices = servicePageData?.filter((i) => !i.isActive);
    setActiveService(ActiveService?.length);
    setInActiveService(inactiveServices?.length);

    const resDataLength = servicePageData?.length;
    const resDataHalfLength = Math.ceil(resDataLength / 2);
    let tableData1 = [];
    let tableData2 = [];
    let startIndex = 0;
    if (resDataLength > tableVisibleLimit) {
      tableData1 = servicePageData.slice(startIndex, resDataHalfLength);
      tableData2 = servicePageData.slice(resDataHalfLength, resDataLength);
      setLeftTable(tableData1);
      setRightTable(tableData2);
    } else {
      setLeftTable(servicePageData);
    }
  };

  const serviceTemplate = (rowData, column) => {
    return (
      <>
        {rowData.serviceName.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
          <div
            className={styles.serviceTemplateStyle}
            title={rowData.serviceName}
          >
            <p className={`mb-0 ${styles.serviceTemplateNormalStyle}`}>
              {rowData.serviceName}
            </p>
          </div>
        ) : (
          <div className={styles.serviceTemplateStyle}>
            <p className={`mb-0 ${styles.serviceTemplateNormalStyle}`}>
              {rowData.serviceName}
            </p>
          </div>
        )}
      </>
    );
  };

  const statusTemplate = (rowData, column) => {
    return (
      <div>
        {rowData.isActive === true ? <Icon_CircleGreen /> : <Icon_CircleRed />}
      </div>
    );
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
                {responseData?.length}
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
                {activeService}
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
                {inActiveService}
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

  const serviceRightTableVisible = responseData?.length > tableVisibleLimit;

  return (
    <div className="wrapper">
      <div className={styles.heartBeatHeaderContainer}>
        <Header
          title={COMMON_CONST.HEARTBEAT}
          desc={HEARTBEAT_CONST.HEADER_TITLE_SUBTEXT}
        ></Header>
      </div>
      <div className={`row ${styles.heartbeatInterContainer}`}>
        <span
          role="button"
          className={`pi pi-arrow-left ${styles.heartbeatInterLeftIconStyle}`}
          onClick={() => {
            setServicePageVisible(false);
          }}
        />
        <h5 className={`col-6 ${styles.heartbeatInterHeaderStyle}`}>
          {servicePageName}
        </h5>
      </div>
      {getHeartbeatOverview()}
      <div className="mt-3 p-1">
        <div
          className={`row ${
            serviceRightTableVisible
              ? styles.table_parent_container
              : styles.heartbeatTableContainer
          }`}
        >
          <div className="col-5">
            <div className="len-datatable">
              <DataTable
                value={leftTable}
                emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
              >
                <Column
                  field="service"
                  body={serviceTemplate}
                  header={HEARTBEAT_CONST.SERVICE_NAME}
                  headerClassName={styles.ServiceHeaderStyle}
                  className={styles.tableServiceColumnStyle}
                />
                <Column
                  field="status"
                  body={statusTemplate}
                  header={HEARTBEAT_CONST.STATUS}
                  headerClassName={styles.statusHeaderStyle}
                  className={styles.tableStatusColumnStyle}
                />
              </DataTable>
            </div>
          </div>
          {serviceRightTableVisible && (
            <div className="col-5">
              <div className="len-datatable">
                <DataTable
                  value={rightTable}
                  emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
                >
                  <Column
                    field="service"
                    body={serviceTemplate}
                    header="SERVICE NAME"
                    headerClassName={styles.ServiceHeaderStyle}
                    className={styles.tableServiceColumnStyle}
                  />
                  <Column
                    field="status"
                    body={statusTemplate}
                    header="STATUS"
                    headerClassName={styles.statusHeaderStyle}
                    className={styles.tableStatusColumnStyle}
                  />
                </DataTable>
              </div>
            </div>
          )}
        </div>
      </div>
      {servicePageName === HEARTBEAT_CONST.HEARTBEAT_PARTNERSCHECK_HEADER && (
        <div className={styles.heartbeatpartnerBottomContainer}>
          <p className={styles.heartbeatPartnerBottomTextStyle}>
            {HEARTBEAT_CONST.HEARTBEAT_PARTNERSCHECK_BOTTOM_TEXT}
          </p>
        </div>
      )}
    </div>
  );
}

export default HeartBeatInternal;

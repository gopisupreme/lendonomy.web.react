import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Field, Form } from "react-final-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { ReactComponent as Icon_cancel } from "assets/icon/icon_cancel.svg";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  ANALYTICS_DIALOG_CONST,
  VIOLATION_BLACKLIST_DIALOG_CONST,
  ACCOUNT_LIST_CONST,
  COMMON_CONST,
} from "app/common/constants/constant";
import style from "../violation.module.scss";

dayjs.extend(utc);

export function BlockDialog(props) {
  const { blockUsersList, user } = props;

  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="len-header len-header-xs bold mb-0">
          {VIOLATION_BLACKLIST_DIALOG_CONST.BLOCKED_LIST} {user}
        </h4>
        <a href="javascript:void(0)" onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );
  
  return (
    <>
      <Dialog
        className={`len-dialog account-dialog ${style.analyticsDiaStyle}`}
        closable={false}
        header={dialogHeader}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}
      >
        <div className="col-sm-16 ts-table" style={{ borderBottom: "none" }}>
          <DataTable
            value={blockUsersList}
            scrollHeight="400px"
            scrollable={true}
            className={style.analyticsDiaTableStyle}
            emptyMessage={ANALYTICS_DIALOG_CONST.TABLE_EMPTY_MESSAGE}
          >
            <Column
              header=""
              headerClassName={style.blockModalProfileHeader}
              body={(rowData) => (
                <>
                  {rowData?.profileImg && (
                    <img
                      className={style.pepTableProfileImgStyle}
                      src={rowData.profileImg}
                    />
                  )}
                </>
              )}
            />
            <Column
              field="blockerName"
              header={VIOLATION_BLACKLIST_DIALOG_CONST.BLOCKED_BY}
              className="font-weight-bold"
              body={(rowData) => (
                <div onClick={(e) => props.profileNavigation(rowData)}>
                  <p className={style.DialoguserColumnStyle}>
                    {rowData.blockerName}
                  </p>
                </div>
              )}
            ></Column>
            <Column
              field="blockedOn"
              header={ACCOUNT_LIST_CONST.DATE_OF_BLOCKING}
              body={(rowData) => (
                <p className={style.DialoguserColumnStyle}>
                  {dayjs.utc(rowData.blockedOn).format("DD.MM.YYYY")}
                </p>
              )}
            ></Column>
            <Column
              field="trustScore"
              header={COMMON_CONST.TRUSTSCORE}
              body={(rowData) => (
                <p className={style.DialoguserColumnStyle}>
                  {rowData.trustScore}
                </p>
              )}
            ></Column>
          </DataTable>
        </div>
      </Dialog>
    </>
  );
}

import React from "react";
import { Dialog } from "primereact/dialog";
import * as _ from "underscore";
import styles from "../userManage.module.scss";
import { COMMON_CONST } from "app/common/constants/constant";
import classNames from "classnames";

function OtpConfirmDialog(props) {
  const { otpConfirm, onHide, desc, header, buttonGray } = props;
  const buttonColor = !buttonGray
    ? "btn btn-primary btn-pill"
    : "btn btn-dark btn-pill";
  return (
    <div>
      <Dialog
        className={`len-dialog review-dialog ${styles.OtpDialogContainer}`}
        closable={false}
        closeOnEscape
        visible={otpConfirm}
        onHide={onHide}
      >
        <div className="pt-2">
          <div className={`${styles.otpContentContainer}`}>
            <h1 className={styles.otpHeaderStyle}>{header}</h1>
            <p className={`py-3 ${styles.otpSubHeaderStyle}`}>{desc}</p>
            <div className={classNames("d-flex py-2")}>
              <button onClick={onHide} type="button" className={buttonColor}>
                {COMMON_CONST.OKAY}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default OtpConfirmDialog;

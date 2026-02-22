import React, { useEffect, useState } from "react";
import {
  COMMON_CONST,
  USER_MANAGE_FORM_CONST,
  OTP_CONST,
} from "app/common/constants/constant";
import classNames from "classnames";
import { Dialog } from "primereact/dialog";
import * as _ from "underscore";
import styles from "../userManage.module.scss";
import { InputRenderField } from "app/common/components/widgets/common";
import { Field, Form } from "react-final-form";
import { Storagehelper } from "app/common/shared/utils";

function OtpDialog(props) {
  const { otpDialogShow, onHideOTP, onSubmit, reSendOtp } = props;
  const [initialValues, setInitialValues] = useState({});
  const userName = Storagehelper?.getUserData()?.userName;

  useEffect(() => {
    setInitialValues({
      otp: null,
    });
  }, []);

  const composeValidators =
    (...validators) =>
    (value) =>
      validators.reduce(
        (error, validator) => error || validator(value),
        undefined
      );

  const required = (value) =>
    value && value.trim() ? undefined : COMMON_CONST.REQUIRED_ERROR_MSG;

  const lengthErrMsg = (value) => {
    if (value) {
      return value.length != 6 ? OTP_CONST.OTP_LENGTH_ERROR_MSG : undefined;
    }
  };

  return (
    <div>
      <Dialog
        className={`len-dialog review-dialog ${styles.OtpDialogContainer}`}
        closable={false}
        closeOnEscape
        visible={otpDialogShow}
        onHide={onHideOTP}
      >
        <div className="pt-2">
          <div className={`${styles.otpContentContainer}`}>
            <div>
              <div>
                <h1 className={styles.otpHeaderStyle}>
                  {USER_MANAGE_FORM_CONST.OTP_HEADER}
                </h1>
                <p className={`py-3 ${styles.otpSubHeaderStyle}`}>
                  {USER_MANAGE_FORM_CONST.OTP_SUB_TEXT} {userName}
                </p>
              </div>
              <div>
                <Form
                  {...{ onSubmit, initialValues }}
                  render={({
                    handleSubmit,
                    submitting,
                    pristine,
                    form,
                    touched,
                    values,
                    errors,
                    valid,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-lg-7">
                          <Field
                            bold
                            name="otp"
                            type="number"
                            component={InputRenderField}
                            label={OTP_CONST.OTP}
                            placeholder={OTP_CONST.OTP_PLACEHOLDER}
                            validate={composeValidators(required, lengthErrMsg)}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div>
                          <a
                            href="javascript:void(0)"
                            className="text-primary link "
                            onClick={reSendOtp}
                          >
                            {OTP_CONST.RESEND_OTP}
                          </a>
                        </div>
                      </div>
                      <div className={classNames("d-flex py-2")}>
                        <button
                          disabled={!valid}
                          type="submit"
                          className="btn btn-primary btn-pill"
                        >
                          {COMMON_CONST.SUBMIT}
                        </button>
                        <div className="pl-4">
                          <button
                            type="button"
                            className="btn btn-dark btn-pill"
                            onClick={onHideOTP}
                          >
                            {COMMON_CONST.CANCEL}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default OtpDialog;

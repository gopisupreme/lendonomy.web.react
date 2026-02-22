import React from "react";
import AuthContainer from "app/common/components/Auth-container/Auth-container.component";
import { InputRenderField } from "app/common/components/widgets/common";
import {
  OTP_CONST,
  COMMON_CONST,
  LOGIN_CONST,
  USER_MANAGE_FORM_CONST,
  RESET_PASSWORD_CONST,
} from "app/common/constants/constant";
import { Field, Form } from "react-final-form";
import { useState } from "react";
import { triggerOtp } from "app/common/api/forgotpassword.api";
import history from "app/common/shared/history";
import styles from "./forgotOtp.module.scss";
import { useEffect } from "react";
import {
  FORGOT_RESET_PASSWORD,
  LOGIN,
} from "app/common/constants/api.constants";

function ForgotOtp(props) {
  const initialEmailFlag = props?.location?.state?.emailVisible || false;
  const initialOtpFlag = props?.location?.state?.emailVisible ? false : true;
  const initialEmailValue = props?.location?.state?.userEmail || "";
  const [initialValue, setInitialValue] = useState({});
  const [userEmail, setUserEmail] = useState(initialEmailValue);
  const [otpVisible, setOtpVisible] = useState(initialOtpFlag);
  const [emailVisible, setEmailVisible] = useState(initialEmailFlag);
  const [emailErrMsg, setEmailErrMsg] = useState("");
  const [otpErrMsg, setOtpErrMsg] = useState(props?.location?.state?.otpErrMsg);
  const emailValidation = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

  useEffect(() => {
    setInitialValue(
      !initialEmailFlag
        ? {
            userName: "",
          }
        : {
            userName: initialEmailValue,
          }
    );

    const onBackButtonEvent = (e) => {
      e.preventDefault();
      history.push({
        pathname: LOGIN,
      });
    };

    window.addEventListener("popstate", onBackButtonEvent);
  }, [initialEmailFlag]);

  const emailValidate = (values) => {
    const errors = {};
    if (!values.userName) {
      setEmailErrMsg("");
      errors.userName = COMMON_CONST.REQUIRED_ERROR_MSG;
    }
    if (values.userName && !emailValidation.test(values.userName)) {
      setEmailErrMsg("");
      errors.userName = OTP_CONST.ENTER_VALID_EMAIL;
    }
    return errors;
  };

  const otpValidate = (values) => {
    const errors = {};
    if (!values.otp) {
      errors.otp = COMMON_CONST.REQUIRED_ERROR_MSG;
    }
    if (values.otp && values.otp.toString().length !== 6) {
      setOtpErrMsg("");
      errors.otp = OTP_CONST.OTP_LENGTH_ERROR_MSG;
    }
    return errors;
  };

  const onSubmitOtp = (values) => {
    history.push({
      pathname: FORGOT_RESET_PASSWORD,
      state: {
        enteredOtp: values,
        userName: userEmail,
      },
    });
  };

  const onSubmitEmail = (values) => {
    setEmailErrMsg("");
    triggerOtp(values).then((res) => {
      if (res.status === 200) {
        setUserEmail(values.userName);
        setOtpVisible(false);
        setEmailVisible(true);
      } else if (res.status === 400) {
        setEmailErrMsg(res.data.message);
      }
    });
  };

  const resendOtp = (form) => {
    form.restart();
    let payload = {
      userName: userEmail,
    };
    triggerOtp(payload).then((res) => {
      if (res.status === 200) {
        setOtpErrMsg(RESET_PASSWORD_CONST.OTP_RESENT);
      }
    });
  };

  const emailButtonStyle = !emailVisible
    ? "btn btn-primary btn-pill btn-pill-lg btn-block"
    : "btn btn-secondary btn-pill btn-pill-lg btn-block";
  const otpButtonStyle = !otpVisible
    ? "btn btn-primary btn-pill btn-pill-lg btn-block"
    : "btn btn-secondary btn-pill btn-pill-lg btn-block";
  const ResentOtpLinkStyle = !otpVisible
    ? "text-primary link"
    : styles.disableResentOtpLinkStyle;

  const resentDisable = (form) => {
    return !otpVisible ? resendOtp(form) : null;
  };

  const onFocusEvent = () => setOtpErrMsg("");

  return (
    <AuthContainer>
      <div className={styles.forgotOtpContainer}>
        <Form
          onSubmit={onSubmitEmail}
          initialValues={initialValue}
          validateOnBlur={true}
          validate={emailValidate}
          render={({ handleSubmit, submitting, pristine, form, values }) => (
            <form onSubmit={handleSubmit}>
              <Field
                name="userName"
                type="text"
                component={InputRenderField}
                label={OTP_CONST.CONFIRM_EMAIL}
                placeholder={LOGIN_CONST.EMAIL_PLACEHOLDER}
                className="form-control-lg"
                disabled={emailVisible}
                bold
              />
              <p className={`error-text mb-2 ${styles.textFieldErrorStyle}`}>
                {emailErrMsg}
              </p>
              <div className={styles.generateOtpButtStyle}>
                <button
                  type="submit"
                  disabled={emailVisible}
                  className={emailButtonStyle}
                >
                  {OTP_CONST.GENERATE_OTP}
                </button>
              </div>
            </form>
          )}
        />
        <div className="pt-5">
          <Form
            onSubmit={onSubmitOtp}
            validate={otpValidate}
            render={({ handleSubmit, submitting, pristine, form, values }) => (
              <form onSubmit={handleSubmit}>
                <div className="p-fluid">
                  <h3 className="len-header mb-3">{OTP_CONST.INSERT_OTP}</h3>
                  <p className="otp-help">
                    {`${USER_MANAGE_FORM_CONST.OTP_SUB_TEXT} ${userEmail}`}
                  </p>
                  <Field
                    name="otp"
                    type="number"
                    component={InputRenderField}
                    label={OTP_CONST.OTP}
                    placeholder={OTP_CONST.OTP_PLACEHOLDER}
                    className="form-control-lg"
                    disabled={otpVisible}
                    bold
                    focusEvent={onFocusEvent}
                  />
                  <p
                    className={`error-text mb-2 ${styles.textFieldErrorStyle}`}
                  >
                    {otpErrMsg}
                  </p>
                  <div className="pb-3">
                    <a
                      href="javascript:void(0)"
                      className={ResentOtpLinkStyle}
                      onClick={() => {
                        resentDisable(form);
                      }}
                    >
                      {OTP_CONST.RESEND_OTP}
                    </a>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className={otpButtonStyle}
                      disabled={otpVisible}
                    >
                      {LOGIN_CONST.CONFIRM_BUTTON}
                    </button>
                  </div>
                </div>
              </form>
            )}
          />
        </div>
      </div>
    </AuthContainer>
  );
}

export default ForgotOtp;

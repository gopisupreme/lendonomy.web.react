import AuthContainer from "app/common/components/Auth-container/Auth-container.component";
import { InputRenderField } from "app/common/components/widgets/common";
import { Storagehelper } from "app/common/shared/utils";
import * as OtpConfirmActions from "app/store/actions/otp.confirm.action";
import * as ResendOtp from "app/store/actions/resend.otp.action";
import { OTP_CONST, COMMON_CONST, RESET_PASSWORD_CONST } from "app/common/constants/constant";
import React, { Component } from "react";
import { Field, Form } from "react-final-form";
import { connect } from "react-redux";

const validate = (values) => {
  const errors = {};
  if (!values.otp) {
    errors.otp = COMMON_CONST.REQUIRED_ERROR_MSG;
  }
  if (values.otp && values.otp.toString().length !== 6) {
    errors.otp = OTP_CONST.OTP_LENGTH_ERROR_MSG;
  }
  return errors;
};
export class OTP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      otp: "",
      otpResendErrMsg: ""
    };
  }
  disabledValidate = (values) => {
    let disabled = true;
    if (values.hasOwnProperty("otp")) {
      disabled = false;
    }
    if (Object.keys(validate(values)).length > 0) {
      disabled = true;
    }
    return disabled;
  };
  changeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = (values) => {
    const { confirmOTPRequest } = this.props;
    const tempUserData = Storagehelper.getTempData();
    const otpPayload = {
      userName: tempUserData.userName,
      accessToken: tempUserData.accessToken,
      otp: values.otp,
    };
    values.otp = ""
    confirmOTPRequest(otpPayload);
  };

  resendOtp = (e, form) => {
    e.preventDefault();
    form.restart();
    this.props.clearOTPState();
    this.props.clearResendOTPState()
    this.setState({ otpResendErrMsg: RESET_PASSWORD_CONST.OTP_RESENT });
    const { resendOtp } = this.props;
    // Will change when actual resend otp api comes
    const tempUserData = Storagehelper.getTempData();
    const resSendOtpPayload = {
      userName: tempUserData.userName,
      password: tempUserData.password,
    };
    resendOtp(resSendOtpPayload);
    // console.log("UserData", userData);
  };

  componentWillUnmount() {
    this.props.clearOTPState();
    this.props.clearResendOTPState()
  }

  otpFieldFocusEvent() {
    this.props.clearOTPState(); 
    this.props.clearResendOTPState()
    this.setState({ otpResendErrMsg: "" });
  }

  render() {
    const { error, resendOtpError } = this.props;
    const otpErrorMsg = resendOtpError ? resendOtpError.message : this.state.otpResendErrMsg

    return (
      <AuthContainer>
        <Form
          onSubmit={this.onSubmit}
          validate={validate}
          render={({ handleSubmit, submitting, pristine, form, values }) => (
            <form onSubmit={handleSubmit}>
              <div className="p-fluid">
                <h3 className="len-header mb-3">{OTP_CONST.INSERT_OTP}</h3>
                <p className="otp-help">
                  {OTP_CONST.OTP_STATUS_MSG}
                </p>
                <Field
                  name="otp"
                  type="number"
                  component={InputRenderField}
                  label={OTP_CONST.OTP}
                  placeholder={OTP_CONST.OTP_PLACEHOLDER}
                  className="form-control-lg"
                  // value={this.state.otp}
                  onChange={(e) => this.changeHandler(e)}
                  focusEvent={()=>{this.otpFieldFocusEvent()}}
                />
                <div className="mb-4">
                  <div className="pb-3">
                    <a
                      href="javascript:void(0)"
                      className="text-primary link "
                      onClick={(e)=>this.resendOtp(e, form)}
                    >
                      {OTP_CONST.RESEND_OTP}
                    </a>
                  </div>
                  <div className="error-text">{error && error.message}</div>
                  <div className="error-text">
                    {otpErrorMsg}
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-pill btn-pill-lg btn-block"
                    disabled={this.disabledValidate(values)}
                  >
                    {COMMON_CONST.LOG_IN}
                  </button>
                </div>
              </div>
            </form>
          )}
        />
      </AuthContainer>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userData: state.Login.userData
      ? state.Login.userData
      : state.ResetPassword.userData,
    error: state.OTP.error ? state.OTP.error : undefined,
    resendOtpError: state.ResendOTP?.error ? state.ResendOTP?.error : undefined,
  };
};

const mapDispatchToProps = (dispatch) => ({
  // actions: bindActionCreators(Object.assign(OtpConfirmActions,ResendOtp), dispatch),
  confirmOTPRequest: (data) => {
    dispatch(OtpConfirmActions.confirmOTPRequest(data));
  },
  resendOtp: (data) => {
    dispatch(ResendOtp.resendOtp(data));
  },
  clearOTPState: () => dispatch(OtpConfirmActions.clearOTPState()),
  clearResendOTPState: () => dispatch(ResendOtp.clearResendOtp())
});

export default connect(mapStateToProps, mapDispatchToProps)(OTP);

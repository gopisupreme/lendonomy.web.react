import AuthContainer from 'app/common/components/Auth-container/Auth-container.component';
import { InputRenderField } from 'app/common/components/widgets/common';
import { COMMON_CONST, LOGIN_CONST, RESET_PASSWORD_CONST } from 'app/common/constants/constant';
import * as ResetPasswordRequest from 'app/store/actions/reset.password.action';
import React, { Component } from 'react';
import { Field, Form } from 'react-final-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const validate = (values) => {
  const errors = {};
  if (!values.tempPassword) {
    errors.tempPassword = "Required";
  }
  if (!values.password) {
    errors.password = "Required";
  } else {
    if (values.confirmPassword && values.confirmPassword !== values.password) {
      errors.confirmPassword = "Password mismatch";
    }
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Required";
  } else {
    if (values.password && values.confirmPassword !== values.password) {
      errors.confirmPassword = "Password mismatch";
    }
  }
  return errors;
};

export class ResetPassword extends Component {
  constructor(props) {
    super(props);
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = (values) => {
    const { actions, location } = this.props;
    const confirmUserPayload = {
      userName: location.state.userName,
      tempPassword: values.tempPassword,
      password: values.confirmPassword,
    };
    actions.resetPasswordRequest(confirmUserPayload);
  };

  render() {
    const { error } = this.props;
    return (
      <AuthContainer>
        <Form
          onSubmit={this.onSubmit}
          validate={validate}
          render={({ handleSubmit, submitting, pristine, form }) => (
            <form onSubmit={handleSubmit}>
              <div className="p-fluid">
                <h3 className="len-header len-header-sm font-weight-bold mb-5">{RESET_PASSWORD_CONST.SET_UP_NEW_PASSWORD}</h3>
                <Field
                  name="tempPassword"
                  type="password"
                  component={InputRenderField}
                  label={RESET_PASSWORD_CONST.TEMPORARY_PASSWORD}
                  className="form-control-lg"
                />
                <Field
                  name="password"
                  type="password"
                  component={InputRenderField}
                  label={LOGIN_CONST.PASSWORD}
                  className="form-control-lg"
                />
                <Field
                  name="confirmPassword"
                  type="password"
                  component={InputRenderField}
                  label={RESET_PASSWORD_CONST.CONFIRM_PASSWORD}
                  className="form-control-lg"
                />
                <div className="error-text">{error && error.message}</div><br />
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-pill btn-pill-lg btn-block"
                    disabled={submitting}
                    // onClick={handle}
                  >
                    {COMMON_CONST.RESET}
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
    return state.ResetPassword.error ? state.ResetPassword : undefined;
  };

  const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(Object.assign(ResetPasswordRequest), dispatch),
  });
  export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);

// export default connect(mapStateToProps, mapDispatchToProps)(Login);

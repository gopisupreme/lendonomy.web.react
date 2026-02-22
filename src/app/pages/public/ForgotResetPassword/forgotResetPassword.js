import React, { useEffect } from 'react';
import AuthContainer from 'app/common/components/Auth-container/Auth-container.component';
import { InputRenderField } from 'app/common/components/widgets/common';
import { COMMON_CONST, LOGIN_CONST, RESET_PASSWORD_CONST } from 'app/common/constants/constant';
import { Field, Form } from 'react-final-form';
import { confirmPasswordCase } from 'app/common/api/forgotpassword.api';
import history from 'app/common/shared/history';
import styles from './forgotResetPassword.module.scss'
import { useState } from 'react';
import ConfirmPassword from './dialog/confirmPassword.dialog.component';
import { FORGOT_OTP, LOGIN } from 'app/common/constants/api.constants';

function ForgotResetPassword(props) {

    const enteredOtp = props?.location?.state?.enteredOtp;
    const userEmail = props?.location?.state?.userName;
    const [confirmPassword, setConfirmPassword] = useState(false);
    const passwordDigitValidation = /\d/;
    const passwordUpperCaseValidation = /[A-Z]/;
    const passwordLowerCaseValidation = /[a-z]/;
    const passwordSpecialCharValidation = /[!@#$%^&*]/;

    const rules = [
       RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_1,
       RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_2,
       RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_3,
       RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_4,
       RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_5,
    ]

    useEffect(()=>{
      const onBackButtonEvent = (e) => {
        e.preventDefault();
        history.push({
          pathname: FORGOT_OTP,
          state:{
            userEmail:userEmail,
            emailVisible: true,
        }
        })
        };

        window.addEventListener('popstate', onBackButtonEvent);
    },[])

    const validate = (values) => {
        const errors = {};
        if (!values.newPassword?.trim()) {
          errors.newPassword = COMMON_CONST.REQUIRED_ERROR_MSG;
        } else {
          if (values.confirmNewPassword && values.confirmNewPassword !== values.newPassword) {
            errors.confirmNewPassword = COMMON_CONST.PASSWORD_MISMATCH;
          }
        }
        if(values.newPassword){
          if(!(values.newPassword?.length >= 8 && values.newPassword?.length <=20)) 
          errors.newPassword = RESET_PASSWORD_CONST.ENTER_VALID_PASSWORD;
          else if(!(passwordDigitValidation.test(values.newPassword) && passwordUpperCaseValidation.test(values.newPassword) &&  passwordLowerCaseValidation.test(values.newPassword) && passwordSpecialCharValidation.test(values.newPassword)))
          errors.newPassword = RESET_PASSWORD_CONST.ENTER_VALID_PASSWORD;
        }
        if (!values.confirmNewPassword?.trim()) {
          errors.confirmNewPassword = COMMON_CONST.REQUIRED_ERROR_MSG;
        } else {
          if (values.newPassword && values.confirmNewPassword !== values.newPassword) {
            errors.confirmNewPassword = COMMON_CONST.PASSWORD_MISMATCH;
          }
        }
        return errors;
      };

    const onSubmit = (values) => {
        let payload = {
            userName: userEmail,
            otp: enteredOtp.otp,
            password: values.confirmNewPassword
        }
        confirmPasswordCase(payload).then((res)=>{
            if(res.status === 200){
                setConfirmPassword(true)
            }
            else if(res.status === 400){
                history.push({
                    pathname: FORGOT_OTP,
                    state:{
                        userEmail:userEmail,
                        emailVisible: true,
                        otpErrMsg: res.data.message
                    }
                   });
            }
        })

    }

    const disabledValidate = (values) => {
        let disabled = false;
        if (Object.keys(validate(values)).length > 0) {
          disabled = true;
        }
        return disabled;
      };  

     const confirmAction = () => {
        setConfirmPassword(false)
        history.push({
            pathname: LOGIN
           });
       
     } 

      const footerTmpl = (
        <div className="text-center">
          <button className="btn btn-primary btn-pill text-capitalize px-4" onClick={confirmAction}>
            {LOGIN_CONST.LOG_IN}
          </button>
        </div>
      );  


  return (
    <>
    <AuthContainer>
        <div className={styles.resetPassContainer}>
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit, submitting, pristine, form, values }) => (
        <form onSubmit={handleSubmit}>
          <div className="p-fluid">
            <h3 className="len-header mb-5">{RESET_PASSWORD_CONST.RESET_PASSWORD}</h3>
            <Field
              name="newPassword"
              type="password"
              component={InputRenderField}
              placeholder={RESET_PASSWORD_CONST.NEW_PASSWORD_PLACEHOLDER}
              label={RESET_PASSWORD_CONST.NEW_PASSWORD}
              className="form-control-lg"
              bold
            />
            <Field
              name="confirmNewPassword"
              type="password"
              component={InputRenderField}
              placeholder={RESET_PASSWORD_CONST.CONFIRM_NEW_PASSWORD_PLACEHOLDER}
              label={RESET_PASSWORD_CONST.CONFIRM_NEW_PASSWORD}
              className="form-control-lg"
              bold
            />
            <div>
              <button
                type="submit"
                className="btn btn-primary btn-pill btn-pill-lg btn-block"
                disabled={disabledValidate(values)}
              >
                {LOGIN_CONST.CONFIRM_BUTTON}
              </button>
            </div>
          </div>
        </form>
      )}
    />
    <div className='mt-5'>
        <p className={styles.rulesTextStyle}>{RESET_PASSWORD_CONST.RULES_FOR_PASSWORD_TITLE}</p>
        {
            rules.map((item)=>{return(
              <p className={`mb-0 ${styles.rulesTextStyle}`}>{item}</p>
            )})
        }
    </div>
    </div>
  </AuthContainer>
   <ConfirmPassword
   visible={confirmPassword}
   header={RESET_PASSWORD_CONST.PASS_CHANGED}
   desc={RESET_PASSWORD_CONST.PASS_CHANED_SUB_TEXT}
   footer={footerTmpl}
   />
   </>
  )
}

export default ForgotResetPassword

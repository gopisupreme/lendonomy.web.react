import {
  PrivateRoute,
  PublicRoute,
} from 'app/common/components/RouteRender/RouteRender';
import Login from 'app/pages/public/Login/login.component';
import OTPConfirm from 'app/pages/public/OTP/otp.component';
import ResetPassword from 'app/pages/public/ResetPassword/reset.password.component';
import Secure from 'app/pages/secure/secure.component';
import React from 'react';
import {Redirect, Switch} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import SessionExpired from './secure/SessionExpired/sessionExpired.component';
import ForgotOtp from './public/ForgotOTP/forgotOtp.component';
import ForgotResetPassword from './public/ForgotResetPassword/forgotResetPassword';
export const Routes = () => {
  const dispatch = useDispatch();

  const search = window.location.search;
  const params = new URLSearchParams(search);
  const CurrentNavigateState = params.get('navto');

  if (CurrentNavigateState) {
    dispatch({type: 'NavigationState', TabNavigate: CurrentNavigateState});
  }

  return (
    <Switch>
      <PublicRoute path='/login' component={Login} />
      <PublicRoute path='/otp' component={OTPConfirm} />
      <PublicRoute path='/resetpassword' component={ResetPassword} />
      <PublicRoute path='/forgototp' component={ForgotOtp} />
      <PublicRoute path='/forgotresetpassword' component={ForgotResetPassword} />
      <PrivateRoute path='/sessionout' component={SessionExpired} />
      <PrivateRoute path='/admin' component={Secure} />
      <Redirect from='/**' to='/admin' />
    </Switch>
  );
};

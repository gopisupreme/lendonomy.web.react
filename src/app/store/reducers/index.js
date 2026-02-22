import AccountListReducer from "app/store/reducers/account.list.reducer";
import AnalyticsReducer from "app/store/reducers/analytics.reducer";
import AppReducer from "app/store/reducers/app.reducer";
import { contentReducer } from "app/store/reducers/content.reducer";
import LoginReducer from "app/store/reducers/login.reducer";
import OTPConfirmReducer from "app/store/reducers/otp.confirm.reducer";
import ResendOTP from "app/store/reducers/resend.otp.reducer";
import NotificationCount from "app/store/reducers/Notification.list.reducer";
import ResetPasswordReducer from "app/store/reducers/reset.password.reducer";
import { combineReducers } from "redux";
import { reducer as forms } from "redux-form";

const allReducers = combineReducers({
  form: forms,
  Login: LoginReducer,
  ResetPassword: ResetPasswordReducer,
  OTP: OTPConfirmReducer,
  AccountListReducer: AccountListReducer,
  content: contentReducer,
  app: AppReducer,
  AnalyticsReducer: AnalyticsReducer,
  ResendOTP: ResendOTP,
  Notification: NotificationCount,
});

export default allReducers;

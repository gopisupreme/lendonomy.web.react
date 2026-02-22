import accountListSaga from 'app/store/sagas/account.list.saga';
import AnalyticsSaga from 'app/store/sagas/analytics.saga';
import ContentSaga from 'app/store/sagas/content.saga';
import loginSaga from 'app/store/sagas/login.saga';
import confirmOTPSaga from 'app/store/sagas/otp.confirm.saga';
import resendOtpSaaga from 'app/store/sagas/resend.otp.saga';
import resetPasswordSaga from 'app/store/sagas/reset.password.saga';
import { fork } from 'redux-saga/effects';


export default function* rootSagas() {
    yield* [
        fork(loginSaga),
        fork(resetPasswordSaga),
        fork(confirmOTPSaga),
        fork(accountListSaga),
        fork(ContentSaga),
        fork(AnalyticsSaga),
        fork(resendOtpSaaga),
    ];
}

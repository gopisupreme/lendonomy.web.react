import Sidebar from 'app/common/components/Sidebar/sidebar.component';
import Account from 'app/pages/secure/Account/account.component';
import Analytics from 'app/pages/secure/Analytics/analytics.component';
import Content from 'app/pages/secure/Content/content.component';
import Transactions from 'app/pages/secure/Transactions/transactions.component';
import PromoCodes from 'app/pages/secure/PromoCodes/promoCodes.component';
import RiskAssessment from 'app/pages/secure/RiskAssessment/riskassessment.component';
import Notifications from 'app/pages/secure/Notification/Notification.component';
import HeartBeat from './Heartbeat/heartBeat.component';
import Violation from './Violations/violation.component';
import PushNotification from './PushNotification/pushNotification.component';
import userManage from '../../pages/secure/UserManagement/userManage.component';
import React from 'react';
import {Redirect, Route} from 'react-router-dom';

const Seccure = () => {
  return (
    <>
      <div className="admin-wrapper">
        <Sidebar />
        <div className="admin-section">
          <Route
            path="/admin"
            render={({match: {url}}) => (
              <>
                <Route exact path={`${url}`}>
                  <Redirect to={`${url}/account`} />
                </Route>
                <Route path={`${url}/account`} component={Account} />
                <Route path={`${url}/content`} component={Content} />
                <Route path={`${url}/analytics`} component={Analytics} />
                <Route path={`${url}/transactions`} component={Transactions} />
                <Route path={`${url}/promocodes`} component={PromoCodes} />
                <Route path={`${url}/riskassessment`} component={RiskAssessment} />
                <Route path={`${url}/Notifications`} component={Notifications} />
                <Route path={`${url}/heartbeat`} component={HeartBeat} />
                <Route path={`${url}/violation`} component={Violation} />
                <Route path={`${url}/push-notification`} component={PushNotification} />
                <Route path={`${url}/userManagement`} component={userManage} />
              </>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default Seccure;

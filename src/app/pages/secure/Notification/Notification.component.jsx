import AccountList from 'app/pages/secure/Notification/Notification.list.component';
import AccountInduvidual from 'app/pages/secure/Notification/induvidual.Notification.component';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Account = () => {
  return (
    <>
      <div>
        <Route
          path="/admin/Notifications"
          render={({ match: { url } }) => (
            <>
              <Route exact path={`${url}`}>
                <Redirect to={`${url}/list`} />
              </Route>
              <Route path={`${url}/list`} component={AccountList} />
              <Route path={`${url}/induvidual`} component={AccountInduvidual} />
            </>
          )}
        />
      </div>
    </>
  );
};

export default Account;

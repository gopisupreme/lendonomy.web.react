import AccountList from 'app/pages/secure/Account/account.list.component';
import AccountInduvidual from 'app/pages/secure/Account/induvidual.account.component';
import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

const Account = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const getStore = useSelector((store) => store.OTP)
 
  React.useEffect(() => {
    let CurrentNavigateState=getStore.TabNavigate;
    if (CurrentNavigateState) {
      const LocalStorageList = JSON.parse(localStorage.okta_userdata);
      if (
        CurrentNavigateState === 'amlrisk' ||
        CurrentNavigateState === 'creditrisk' ||
        CurrentNavigateState === 'onemillion' ||
        CurrentNavigateState === 'transactions'
      ) {
        dispatch({
          type: 'NavigationState',
          TabNavigate: CurrentNavigateState,
        });
        history.push({pathname: `/admin/riskassessment`});
      } else if (
        CurrentNavigateState === 'defaultedloan' ||
        CurrentNavigateState === 'riskyloan' ||
        CurrentNavigateState === 'newusers'
      ) {
        dispatch({
          type: 'NavigationState',
          TabNavigate: CurrentNavigateState,
        });
        history.push({pathname: `/admin/Notifications`});
      } else if (CurrentNavigateState === 'reportuser') {
        dispatch({
          type: 'NavigationState',
          TabNavigate: CurrentNavigateState,
        });
        history.push({
          pathname: '/admin/violation',
          state: {
            userName: LocalStorageList.userName,
            CurrentState: CurrentNavigateState,
          },
        });
      } 
      else if (CurrentNavigateState === 'healthcheck') {
        dispatch({
          type: 'NavigationState',
          TabNavigate: CurrentNavigateState,
        });
        history.push({
          pathname: '/admin/heartbeat'
        });
      } 
    }
  }, []);

  return (
    <>
      <div>
        <Route
          path='/admin/account'
          render={({match: {url}}) => (
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

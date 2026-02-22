import React, { useEffect, useState } from 'react';
import { ReactComponent as Icon_clear } from 'assets/icon/icon_cancel.svg';
import { ReactComponent as Icon_search } from 'assets/icon/icon_search.svg';
import { useHistory } from 'react-router-dom';
import Header from '../../../common/components/Header/header.component';
import RiskyLoans from './RiskyLoans.components';
import NewUsers from './NewUsers.component';
import ActiveLoans from './ActiveLoans.component';
import MatchingFeeAlert from './matchingFeeAlert.components';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFICATION_LIST_CONST, COMMON_CONST, INDIVIDUAL_ACCOUNT_CONST } from 'app/common/constants/constant';

// import TransactionsRisk from './transactions-risk.component';
// import AnnualLimit from './annualLimit.component';
// import CreditRisk from './credit-risk.component';

export const tabNames = Object.freeze({
  newUsers: NOTIFICATION_LIST_CONST.NEW_USERS,
  activeLoans: NOTIFICATION_LIST_CONST.ACTIVE_LOANS,
  riskyLoans: NOTIFICATION_LIST_CONST.RISKY_LOAN,
  defaultedLoans: INDIVIDUAL_ACCOUNT_CONST.DEFAULTED_LOANS,
  mFeeRisks: NOTIFICATION_LIST_CONST.MATCHING_FEE_ALERTS,
});

export const SubTitle = Object.freeze({
  newUsers: 1,
  riskyLoans: 2,
  defaultedLoans: 3,
  mFeeRisks: 4,
  activeLoans: 5,
});

const RiskAssessment = (props) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, changeActiveTab] = useState(tabNames.newUsers);
  const [state, setState] = useState({ Notification: {} });
  const history = useHistory();
  const Notification_Status = useSelector((store) => store);

  useEffect(() => {
    setSearchValue('');
  }, [activeTab]);

  React.useEffect(() => {
    if (history?.location?.state?.Status) {
      props.TabControl(history?.location?.state?.Status);
      history.location.state = '';
    }
  }, []);

  const changeTabStatus = (TabStat) => {
    switch (TabStat) {
      case 'riskyloan':
        return tabNames.riskyLoans
      case 'ActiveLoans':
        return tabNames.ActiveLoans
      case 'newusers':
        return tabNames.newUsers
      case 'defaultedloan':
        return tabNames.defaultedLoans

      default:
        return tabNames.newUsers
    }
  }

  React.useEffect(() => {
    const TabStat = Notification_Status.OTP.TabNavigate;
    if (TabStat) {
      changeActiveTab(changeTabStatus(TabStat));
      dispatch({
        type: 'NavigationState',
        TabNavigate: '',
      });
    }
  }, []);

  React.useEffect(() => {
    if (Notification_Status.Notification) {
      setState({
        Notification:
          Notification_Status?.Notification?.NotificationCount?.status,
      });
    }
  }, [Notification_Status.Notification]);

  const ChangeNotificationCount = (status, NotificationStatus) => {
    // setState({
    //   Notification: NotificationStatus
    // })
  };

  const TabControls = (Tabstatus) => {
    changeActiveTab(changeTabStatus(Tabstatus));
  };

  const renderChildren = () => {

    if (activeTab === tabNames.newUsers) {
      return (
        <NewUsers
          status={'NEW_USERS'}
          Search={searchValue}
          subTitle={SubTitle.newUsers}
          triggerAction={ChangeNotificationCount}
          TabControl={TabControls}
        />
      );
    }
    if (activeTab === tabNames.activeLoans) {
      return (
        <ActiveLoans
          status={'ACTIVE'}
          Search={searchValue}
          subTitle={SubTitle.activeLoans}
          triggerAction={ChangeNotificationCount}
          TabControl={TabControls}
        />
      );
    }
    if (activeTab === tabNames.riskyLoans) {
      return (
        <RiskyLoans
          status={'RISKY_LOAN'}
          Search={searchValue}
          subTitle={SubTitle.riskyLoans}
          triggerAction={ChangeNotificationCount}
          TabControl={TabControls}
        />
      );
    }
    if (activeTab === tabNames.defaultedLoans) {
      return (
        <RiskyLoans
          status={'DEFAULTED_LOAN'}
          Search={searchValue}
          triggerAction={ChangeNotificationCount}
          subTitle={SubTitle.defaultedLoans}
          TabControl={TabControls}
        />
      );
    }
    if (activeTab === tabNames.mFeeRisks) {
      return (
        <MatchingFeeAlert
          status={'MFEE_PENDING'}
          Search={searchValue}
          subTitle={SubTitle.riskyLoans}
          triggerAction={ChangeNotificationCount}
          TabControl={TabControls}
        />
      );
    }
  };

  return (
    <div className='wrapper'>
      <Header
        title={COMMON_CONST.NOTIFICATIONS}
        desc={NOTIFICATION_LIST_CONST.NOTIFICATION_HEADER_SUB_TEXT}>
        <Search search={(e) => setSearchValue(e)} {...{ searchValue }} />
      </Header>
      <hr />
      <div className='container-area'>
        <ul className='nav len-menu'>
          {Object.entries(tabNames).map((name) => (
            <li className='nav-item' key={name[1]}>
              <a
                className={`nav-link ${activeTab === name[1] ? 'active' : ''}`}
                onClick={() => {
                  setSearchValue('');
                  changeActiveTab(name[1]);
                }}>
                {' '}
                {name[1]} {name[0] === "activeLoans" && state?.Notification?.[name[0]] !== 0 && `(${state?.Notification?.[name[0]]})`}
                {state?.Notification?.[name[0]] != 0 && name[0] !== "activeLoans" && (
                  <span style={{ position: 'relative', top: -9, right: -20 }}>
                    {' '}
                    <span
                      style={{
                        backgroundColor: '#FB4179',
                        color: '#fff',
                        display: 'inline-block',
                        paddingTop: 2,
                        textAlign: 'center',
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        fontSize: 12,
                      }}>
                      {state?.Notification?.[name[0]]}
                    </span>
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className='mt-4 len-datatable'>{renderChildren()}</div>
      </div>
    </div>
  );
};

export const Search = (props) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(props.searchValue);
  }, [props.searchValue]);

  return (
    <>
      <div className='search-input col-4 px-0'>
        <div className='prepend'>
          <Icon_search />
        </div>
        <form>
          <input
            name='search'
            type='text'
            className='form-control form-control-lg'
            placeholder={COMMON_CONST.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className='append'>
            {searchTerm && (
              <Icon_clear
                onClick={() => {
                  setSearchTerm('');
                  props.search('');
                }}
              />
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                props.search(searchTerm);
              }}
              className='btn btn-light'>
              {COMMON_CONST.SEARCH}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RiskAssessment;

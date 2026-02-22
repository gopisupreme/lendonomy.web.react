import React, { useEffect, useState } from 'react';
import { ReactComponent as Icon_clear } from 'assets/icon/icon_cancel.svg';
import { ReactComponent as Icon_search } from 'assets/icon/icon_search.svg';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../../common/components/Header/header.component';
import PepTable from './pepTable.component';
import TransactionsRisk from './transactions-risk.component';
import AnnualLimit from './annualLimit.component';
import CreditRisk from './credit-risk.component';
import KYCVerifications from './KYC-Verification.component'
import { getCountryPoint } from 'app/common/config/config';
import { RISK_ASSESSMENT_CONST, COMMON_CONST } from 'app/common/constants/constant';
// Object.freeze(
export const tabNames = {
  pep: RISK_ASSESSMENT_CONST.PEP_TAB_NAME,
  credit: RISK_ASSESSMENT_CONST.CREDIT_RISK_TAB_NAME,
  annualLimit: `${RISK_ASSESSMENT_CONST.ANNUAL_LIMIT_TAB_NAME1} ${getCountryPoint(true)} ${RISK_ASSESSMENT_CONST.ANNUAL_LIMIT_TAB_NAME2}`,
  transactions: RISK_ASSESSMENT_CONST.TRANSACTIONS_RISK_TAB_NAME,
  // KycVerification: 'KYC Verification'
}

const RiskAssessment = () => {
  const Notification_Status = useSelector((store) => store);
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, changeActiveTab] = useState(tabNames.pep);

  // const Dynamic_change = Object.freeze({
  //   KycVerification: 'KYC Verification'
  // });
  // tabNames.concat(Dynamic_change)
  if (getCountryPoint(true) !== "NOK") {

    tabNames.KycVerification = 'KYC Verification'
  }

  useEffect(() => {
    setSearchValue('');
  }, [activeTab]);

  React.useEffect(() => {
    const TabStat = Notification_Status.OTP?.TabNavigate;
    if (TabStat) {
      if (TabStat === 'amlrisk') {
        changeActiveTab(tabNames.pep);
        dispatch({
          type: 'NavigationState',
          TabNavigate: '',
        });
      } else if (TabStat === 'creditrisk') {
        changeActiveTab(tabNames.credit);
        dispatch({
          type: 'NavigationState',
          TabNavigate: '',
        });
      } else if (TabStat === 'onemillion') {
        changeActiveTab(tabNames.annualLimit);
        dispatch({
          type: 'NavigationState',
          TabNavigate: '',
        });
      } else if (TabStat === 'transactions') {
        changeActiveTab(tabNames.transactions);
        dispatch({
          type: 'NavigationState',
          TabNavigate: '',
        });
      } else if (TabStat === 'KycVerification') {
        changeActiveTab(tabNames.KycVerification);
      }
      else {
        changeActiveTab(tabNames.pep);
      }
    }
  }, []);

  const renderChildren = () => {
    if (activeTab === tabNames.pep) {
      return <PepTable {...{ searchValue, setSearchValue }} />;
    }
    if (activeTab === tabNames.annualLimit) {
      return <AnnualLimit {...{ searchValue }} />;
    }
    if (activeTab === tabNames.transactions) {
      return <TransactionsRisk {...{ searchValue, setSearchValue }} />;
    }
    if (activeTab === tabNames.KycVerification) {
      return <KYCVerifications {...{ searchValue, setSearchValue }} />;
    }
    if (activeTab === tabNames.credit) {
      return <CreditRisk {...{ searchValue, setSearchValue }} />;
    }
  };

  return (
    <div className='wrapper'>
      <Header title={COMMON_CONST.RISK_ASSESSMENT} desc={RISK_ASSESSMENT_CONST.RISK_ASSESSMENT_SUB_TEXT}>
        <Search search={(e) => setSearchValue(e)} {...{ searchValue }} />
      </Header>
      <hr />
      <div className='container-area'>
        <ul className='nav len-menu'>
          {Object.values(tabNames).map((name) => (
            <li className='nav-item' key={name}>
              <a
                className={`nav-link ${activeTab === name ? 'active' : ''}`}
                onClick={() => changeActiveTab(name)}>
                {name}
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

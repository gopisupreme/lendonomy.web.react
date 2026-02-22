import Header from 'app/common/components/Header/header.component';
import { PROMO_CODES_CONST, COMMON_CONST } from "app/common/constants/constant";
import {ReactComponent as Icon_clear} from 'assets/icon/icon_cancel.svg';
import {ReactComponent as Icon_search} from 'assets/icon/icon_search.svg';
import React, {useEffect, useState} from 'react';

import AllPromoCodes from './allPromocodes.component';
import Deleted from './deleted.component';
import GeneratePromoCodes from './generated.component';
import History from './history.component';

export const tabNames = Object.freeze({
  all: PROMO_CODES_CONST.TAB_NAME_ALL,
  generate: PROMO_CODES_CONST.TAB_NAME_GENERATE,
  history: PROMO_CODES_CONST.TAB_NAME_HISTORY,
  deleted: PROMO_CODES_CONST.TAB_NAME_DELETED,
});

export const tabTitle = Object.freeze({
  all: PROMO_CODES_CONST.PROMO_CODES_SUB_TEXT_ALL,
  generate: PROMO_CODES_CONST.PROMO_CODES_SUB_TEXT_GENERATE,
  history: PROMO_CODES_CONST.PROMO_CODES_SUB_TEXT_HISTORY,
  delete: PROMO_CODES_CONST.PROMO_CODES_SUB_TEXT_DELETE,
  edit: PROMO_CODES_CONST.PROMO_CODES_SUB_TEXT_EDIT,
});

const PromoCodes = () => {
  const [activeTab, changeActiveTab] = useState(tabNames.all);
  const [searchValue, setSearchValue] = useState('');
  const [title, setTitle] = useState(tabTitle.all);


  const [tabBarAllPromoCodesCount, setTabBarAllPromoCodesCount] = useState(0);
  const [toBeEditedData, setToBeEditedData] = useState(null);

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const renderChildren = () => {
    if (activeTab === tabNames.all) {
      return (
        <AllPromoCodes
          {...{
            searchValue,
            setTabBarAllPromoCodesCount,
            changeActiveTab,
            setToBeEditedData,
            setSearchValue,
            setTitle
          }}
        />
      );
    }
    if (activeTab === tabNames.generate) {
      return (
        <GeneratePromoCodes
          {...{toBeEditedData, setToBeEditedData, changeActiveTab, setTitle}}
        />
      );
    }
    if (activeTab === tabNames.history) {
      return <History {...{selectedOption, setSelectedOption, setOptions, setTitle}} />;
    }
    if (activeTab === tabNames.deleted) {
      return <Deleted {...{searchValue, setTitle, setSearchValue}} />;
    }
  };

  return (
    <div className={'wrapper'}>
      <Header
        title={COMMON_CONST.PROMO_CODES}
        desc={title}
      >
        {activeTab !== tabNames.generate && activeTab !== tabNames.history ? (
          <Search search={(e) => setSearchValue(e)} {...{searchValue}} />
        ) : null}
        {activeTab === tabNames.history && (
          <select
            onChange={(e) => {
              setSelectedOption(
                e.target.value === 'Select Code' ? null : e.target.value
              );
            }}
            value={selectedOption}
            className={`form-control col-4`}
          >
            <option value={null}>{PROMO_CODES_CONST.SELECT_CODE}</option>
            {options &&
              options.map((option, index) => {
                return (
                  <option key={index} className={`form-control`} value={option}>
                    {option}
                  </option>
                );
              })}
          </select>
        )}
      </Header>
      <>
        <hr />
        <div className="container-area">
          <ul className="nav len-menu">
            {Object.values(tabNames).map((name, index) => (
              <li className="nav-item" key={name}>
                <a
                  className={`nav-link ${activeTab === name ? 'active' : ''}`}
                  onClick={() => changeActiveTab(name)}
                >
                  {name + (index === 0 ? ` (${tabBarAllPromoCodesCount})` : '')}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-4 len-datatable">{renderChildren()}</div>
        </div>
      </>
    </div>
  );
};

export const Search = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {tabName} = props
  useEffect(() => {
    setSearchTerm(props.searchValue);
  }, [props.searchValue]);
  
  const searchPlaceholder = tabName === tabNames.generate ? COMMON_CONST.SEARCH_PLACEHOLDER: COMMON_CONST.SEARCH_CODES

  return (
    <>
      <div className="search-input col-4 px-0">
        <div className="prepend">
          <Icon_search />
        </div>
        <form>
          <input
            name="search"
            type="text"
            className="form-control form-control-lg"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="append">
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
              className="btn btn-light"
            >
              {COMMON_CONST.SEARCH}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PromoCodes;

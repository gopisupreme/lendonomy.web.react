import Header from "app/common/components/Header/header.component";
import {
  COMMON_CONST,
  USER_MANAGEMENT_CONST,
} from "app/common/constants/constant";
import { ReactComponent as Icon_clear } from "assets/icon/icon_cancel.svg";
import { ReactComponent as Icon_search } from "assets/icon/icon_search.svg";
import React, { useEffect, useState } from "react";

import ManageAdmin from "./manageAdmin.component";
import styles from "./userManage.module.scss";

export const tabNames = Object.freeze({
  all: USER_MANAGEMENT_CONST.MANAGE_ADMIN_ACCOUNT,
});

const UserManagement = () => {
  const [activeTab, changeActiveTab] = useState(tabNames.all);
  const [searchValue, setSearchValue] = useState("");
  const [userData, setUserData] = useState([]);
  const [addAdmin, setAddAdmin] = useState(false)

  const tabNamesList = [
    {
      tab: {
        title: USER_MANAGEMENT_CONST.MANAGE_ADMIN_ACCOUNT,
        titleCount: userData.dailyCount,
      },
    },
  ];

  const renderChildren = () => {
    if (activeTab === tabNames.all) {
      return (
        <ManageAdmin
          {...{
            searchValue,
            changeActiveTab,
            setSearchValue,
            setUserData,
            setAddAdmin,
            addAdmin
          }}
        />
      );
    }
  };

  return (
    <div className={"wrapper"}>
      <Header
        title={COMMON_CONST.USER_MANAGEMENT}
        desc={USER_MANAGEMENT_CONST.USER_MANAGEMENT_SUB_TEXT}
      >
        {activeTab !== tabNames.generate ? (
          <Search search={(e) => setSearchValue(e)} {...{ searchValue }} />
        ) : null}
      </Header>
      <>
        <hr />
        <div className="container-area pt-5">
          <ul className="nav len-menu">
            {tabNamesList.map((name, index) => (
              <li className="nav-item" key={name}>
                <a
                  className={`nav-link ${
                    activeTab === name.tab.title ? "active" : ""
                  }`}
                  onClick={() => changeActiveTab(name.tab.title)}
                >
                    { name.tab.title}
                </a>
              </li>
            ))}
            <li className="nav-item">
              <button
              onClick={()=>setAddAdmin(true)}
                className={`btn btn-primary btn-pill btn-pill-mg ${styles.addButtonStyle}`}
              >
                {USER_MANAGEMENT_CONST.ADD_NEW_ADMIN}
              </button>
            </li>
          </ul>

          <div className="mt-4 len-datatable">{renderChildren()}</div>
        </div>
      </>
    </div>
  );
};

export const Search = (props) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(props.searchValue);
  }, [props.searchValue]);

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
            placeholder={COMMON_CONST.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="append">
            {searchTerm && (
              <Icon_clear
                onClick={() => {
                  setSearchTerm("");
                  props.search("");
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

export default UserManagement;

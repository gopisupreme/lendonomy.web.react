import Header from "app/common/components/Header/header.component";
import {
  COMMON_CONST,
  PUSH_NOTIFICATION_CONST,
} from "app/common/constants/constant";
import { ReactComponent as Icon_clear } from "assets/icon/icon_cancel.svg";
import { ReactComponent as Icon_search } from "assets/icon/icon_search.svg";
import React, { useEffect, useState } from "react";

import TodayNotification from "../PushNotification/todayNotification.component";
import GeneratePushNotification from "../PushNotification/generateNotification.component";
import NotificationHistory from "../PushNotification/notificationHistory.component";

export const tabNames = Object.freeze({
  all: PUSH_NOTIFICATION_CONST.TODAY_NOTIFICATION,
  generate: PUSH_NOTIFICATION_CONST.GENERATE_NOTIFICATION,
  history: PUSH_NOTIFICATION_CONST.NOTIFICATION_HISTORY,
});

export const tabTitle = Object.freeze({
  all: PUSH_NOTIFICATION_CONST.PUSH_NOTIFICATION_TODAY_SUB_TEXT,
  generate: PUSH_NOTIFICATION_CONST.PUSH_NOTIFICATION_GENERATE_SUB_TEXT,
  history: PUSH_NOTIFICATION_CONST.PUSH_NOTIFICATION_HISTORY_SUB_TEXT,
});

const PushNotification = () => {
  const [activeTab, changeActiveTab] = useState(tabNames.all);
  const [searchValue, setSearchValue] = useState("");
  const [title, setTitle] = useState(tabTitle.all);
  const [userData, setUserData] = useState([]);

  const tabNamesList = [
    {
      tab: {
        title: PUSH_NOTIFICATION_CONST.TODAY_NOTIFICATION,
        titleCount: userData.dailyCount,
      },
    },
    {
      tab: {
        title: PUSH_NOTIFICATION_CONST.GENERATE_NOTIFICATION,
        titleCount: 0,
      },
    },
    {
      tab: {
        title: PUSH_NOTIFICATION_CONST.NOTIFICATION_HISTORY,
        titleCount: userData.historyCount,
      },
    },
  ];

  const renderChildren = () => {
    if (activeTab === tabNames.all) {
      return (
        <TodayNotification
          {...{
            searchValue,
            changeActiveTab,
            setSearchValue,
            setTitle,
            setUserData,
          }}
        />
      );
    }
    if (activeTab === tabNames.generate) {
      return <GeneratePushNotification {...{ changeActiveTab, setTitle }} />;
    }
    if (activeTab === tabNames.history) {
      return (
        <NotificationHistory
          {...{
            setTitle,
            searchValue,
            setSearchValue,
          }}
        />
      );
    }
  };

  return (
    <div className={"wrapper"}>
      <Header title={COMMON_CONST.PUSH_NOTIFICATION} desc={title}>
        {activeTab !== tabNames.generate ? (
          <Search search={(e) => setSearchValue(e)} {...{ searchValue }} />
        ) : null}
      </Header>
      <>
        <hr />
        <div className="container-area">
          <ul className="nav len-menu">
            {tabNamesList.map((name, index) => (
              <li className="nav-item" key={name}>
                <a
                  className={`nav-link ${
                    activeTab === name.tab.title ? "active" : ""
                  }`}
                  onClick={() => changeActiveTab(name.tab.title)}
                >
                  {name.tab.title ===
                  PUSH_NOTIFICATION_CONST.GENERATE_NOTIFICATION
                    ? name.tab.title
                    : name.tab.title + ` (${name.tab.titleCount || 0})`}
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
  const [searchTerm, setSearchTerm] = useState("");
  const {tabName} = props

  useEffect(() => {
    setSearchTerm(props.searchValue);
  }, [props.searchValue]);

  const searchPlaceholder = tabName === tabNames.generate ? COMMON_CONST.SEARCH_PLACEHOLDER: COMMON_CONST.SEARCH_PUSH_NOTIFY_PLACEHOLDER

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

export default PushNotification;

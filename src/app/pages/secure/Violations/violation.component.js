import React, { useEffect, useState } from "react";
import { ReactComponent as Icon_clear } from "assets/icon/icon_cancel.svg";
import { ReactComponent as Icon_search } from "assets/icon/icon_search.svg";
import Header from "../../../common/components/Header/header.component";
import ReportedAccountList from "./reportedAccount.list";
import ReportedReview from "./reportedReview.component";
import BlackList from "./blacklistUser.component";
import { COMMON_CONST, VIOLATION_CONST } from "app/common/constants/constant";
import { getReportedListCase } from "app/common/api/account.list.api";
import styles from "./violation.module.scss";

const Violation = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, changeActiveTab] = useState(
    VIOLATION_CONST.REPORTED_ACCOUNTS
  );
  const [count, setCount] = useState([]);

  const tabNames = [
    {
      tab: {
        title: VIOLATION_CONST.REPORTED_ACCOUNTS,
        titleCount: count.loanReportCount + count.generalReportCount,
      },
    },
    {
      tab: {
        title: VIOLATION_CONST.REPORTED_REVIEWS,
        titleCount: count.reportedReviewCount,
      },
    },
    {
      tab: {
        title: VIOLATION_CONST.BLACKLISTED_USERS,
        titleCount: count.blacklistedCount,
      },
    },
  ];

  useEffect(() => {
    setSearchValue("");
    onLoad({
      createdOn: null,
      reporteeId: null,
      status: "GENERAL",
      getCount: true,
    });
  }, [activeTab]);

  function onLoad(payload) {
    getReportedListCase(payload).then((res) => {
      if (res.status !== 200) return;
      setCount(res.data);
    });
  }

  const renderChildren = () => {
    if (activeTab === VIOLATION_CONST.REPORTED_ACCOUNTS) {
      return (
        <ReportedAccountList {...{ searchValue, setSearchValue, count }} />
      );
    }
    if (activeTab === VIOLATION_CONST.REPORTED_REVIEWS) {
      return <ReportedReview {...{ searchValue }} />;
    }
    if (activeTab === VIOLATION_CONST.BLACKLISTED_USERS) {
      return <BlackList {...{ searchValue, setSearchValue }} />;
    }
  };

  return (
    <div className="wrapper">
      <Header
        title={COMMON_CONST.VIOLATION}
        desc={VIOLATION_CONST.VIOLATION_SUB_TEXT}
      >
        <>
          <Search search={(e) => setSearchValue(e)} {...{ searchValue }} />
          <div className="pt-5 pb-3">
            <ul className="nav len-menu">
              {tabNames.map((name) => (
                <li className={`nav-item ${styles.TabNameStyle}`} key={name}>
                  <a
                    className={`nav-link ${
                      activeTab === name.tab.title ? "active" : ""
                    }`}
                    onClick={() => changeActiveTab(name.tab.title)}
                  >
                    {`${name.tab.title} (${name.tab.titleCount || 0}) `}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      </Header>
      <hr className={styles.LineStyle} />
      <div className="container-area">
        <div className="mt-4 len-datatable">{renderChildren()}</div>
      </div>
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

export default Violation;

import React, { useEffect, useState } from "react";
import ReportedAccount from "./reportedAccount.component";
import ReportedLoan from "./reportedLoan.component";
import { VIOLATION_CONST } from "app/common/constants/constant";
import { useDispatch, useSelector } from "react-redux";
import styles from "./violation.module.scss";

const ReportedAccountList = (props) => {
  const { searchValue, setSearchValue, count } = props;
  const Notification_Status = useSelector((store) => store);
  const dispatch = useDispatch();
  const [activeTab, changeActiveTab] = useState(
    VIOLATION_CONST.REPORTED_PROFILE_SUB_TAB
  );

  useEffect(() => {
    setSearchValue("");
  }, [activeTab]);

  React.useEffect(() => {
    const TabStat = Notification_Status.OTP?.TabNavigate;
    if (TabStat) {
      if (TabStat === "reportuser") {
        changeActiveTab(VIOLATION_CONST.REPORTED_LOAN_SUB_TAB);
        dispatch({
          type: "NavigationState",
          TabNavigate: "",
        });
      }
    }
  }, []);

  const tabNames = [
    {
      tab: {
        title: VIOLATION_CONST.REPORTED_PROFILE_SUB_TAB,
        titleCount: count.generalReportCount,
      },
    },
    {
      tab: {
        title: VIOLATION_CONST.REPORTED_LOAN_SUB_TAB,
        titleCount: count.loanReportCount,
      },
    },
  ];

  const renderChildren = () => {
    if (activeTab === VIOLATION_CONST.REPORTED_PROFILE_SUB_TAB) {
      return <ReportedAccount {...{ searchValue, setSearchValue }} />;
    }
    if (activeTab === VIOLATION_CONST.REPORTED_LOAN_SUB_TAB) {
      return <ReportedLoan {...{ searchValue, setSearchValue }} />;
    }
  };

  return (
    <div className="wrapper">
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

      <div className="mt-4 len-datatable">{renderChildren()}</div>
    </div>
  );
};

export default ReportedAccountList;

import React from "react";
import * as ApiConstants from "app/common/constants/api.constants";
import { logoutCase } from "app/common/api/login.api";
import { Logo } from "app/common/components/widgets/common";
import { Storagehelper } from "app/common/shared/utils";
import { ReactComponent as Icon_discover } from "assets/icon/icon_discover.svg";
import { ReactComponent as Icon_log_out } from "assets/icon/icon_log_out.svg";
import { ReactComponent as Icon_profile } from "assets/icon/icon_profile.svg";
import { ReactComponent as Icon_transaction } from "assets/icon/icon_transaction.svg";
import { ReactComponent as Icon_promocodes } from "assets/icon/icon_promocodes.svg";
import { ReactComponent as Icon_exclamation } from "assets/icon/icon_exclamation.svg";
import { ReactComponent as Icon_Notification } from "assets/icon/icon_Notification.svg";
import { ReactComponent as Icon_Explanation } from "assets/icon/Icon_Explanation.svg";
import { ReactComponent as Icon_Heartbeat } from "assets/icon/icon_heartbeat.svg";
import { ReactComponent as Icon_Violation } from "assets/icon/icon_violation.svg";
import { ReactComponent as Icon_PushNotification } from "assets/icon/icon_pushNotification.svg";
import { ReactComponent as Icon_UserManage } from "assets/icon/icon_user-manage.svg";
import { useSelector } from "react-redux";
import { bool, element, string } from "prop-types";

import { NavLink, useHistory } from "react-router-dom";
import { COMMON_CONST, USER_MANAGE_FORM_CONST } from "app/common/constants/constant";
import styles from "./sidebar.module.scss";

const sidbebarListProps = {
  icon: element,
  name: string,
  isFill: bool,
  url: string,
};

const sidbebarlistDefaultProps = {
  icon: null,
  name: null,
  isFill: false,
  url: null,
};

const SidebarList = (props) => {
  const { icon, name, isFill, url } = props;
  return (
    <>
      <li>
        <NavLink to={url} activeClassName="menu-active">
          <div className="menu-item">
            <div className={`menu-icon ${isFill ? "fill-icon" : ""}`}>
              {icon}
            </div>
            <span className="menu-text">{name}</span>
          </div>
        </NavLink>
      </li>
    </>
  );
};

const SidebarFlag = (props) => {
  const { FullList, userName } = props;
  return (
    <>
      <div className={styles.flagContainer}>
        <div className={styles.flagImgContainer}>
          <img className={styles.flagImgStyle} src={FullList.flag} alt="new" />
        </div>
        <div>
          {userName?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
            <span className={styles.flagNameStyle} title={userName}>
              {COMMON_CONST.HI} {userName}
            </span>
          ) : (
            <span className={styles.flagNameStyle}>
              {COMMON_CONST.HI} {userName}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

const Logout = (props) => {
  const { icon, name, isFill } = props;
  const history = useHistory();

  const logout = () => {
    const payload = {
      userName: Storagehelper.getUserData().userName,
    };

    logoutCase(payload)
      .then((res) => {
        Storagehelper.clearStorage();
        history.push("/login");
      })
      .catch((err) => { });
  };
  return (
    <>
      <li className={styles.logoutContainerStyle}>
        <div className="menu-item" onClick={logout}>
          <div className={`menu-icon ${isFill ? "fill-icon" : ""}`}>{icon}</div>
          <span className="menu-text">{name}</span>
        </div>
      </li>
    </>
  );
};
SidebarList.propTypes = sidbebarListProps;
SidebarList.defaultProps = sidbebarlistDefaultProps;

const Sidebar = () => {
  const [state, setState] = React.useState({
    Notification: {},
    CountryList: "",
    userData: {},
  });
  const Notification_Status = useSelector((store) => store);
  const userRole = Storagehelper.getUserData()?.userrole
  React.useEffect(() => {
    if (Notification_Status.Notification) {
      setState({
        Notification:
          Notification_Status?.Notification?.NotificationCount?.status,
        CountryList: Storagehelper.getDynamicData("CountryFulllist"),
        userData: Storagehelper.getUserData(),
      });
    }
  }, [Notification_Status.Notification]);

  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-logo">
          <Logo />
        </div>
        <div>
          <SidebarFlag
            name={state?.CountryList?.country}
            userName={state?.userData?.fName}
            FullList={state?.CountryList}
            icon={<Icon_exclamation />}
            url="/"
          />
        </div>
        <div className={`menu-container ${styles.side_bar}`}>
          <ul className="sidebar-menus">
            <SidebarList
              name={COMMON_CONST.ACCOUNT_CENTER}
              icon={<Icon_profile />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_ACCOUNT}`}
            />
            <SidebarList
              name={COMMON_CONST.CONTENT_MANAGER}
              icon={<Icon_discover />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_CONTENT}`}
            />
            <SidebarList
              name={COMMON_CONST.ANALYTICS}
              icon={<Icon_discover />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_ANALYTICS}`}
            />
            <SidebarList
              name={COMMON_CONST.TRANSACTIONS}
              icon={<Icon_transaction />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_TRANSACTION}`}
            />
            <SidebarList
              name={COMMON_CONST.PROMO_CODES}
              icon={<Icon_promocodes />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_PRMOMOCODES}`}
            />
            <SidebarList
              name={COMMON_CONST.PUSH_NOTIFICATION}
              icon={<Icon_PushNotification />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_PUSH_NOTIFICATION}`}
              isFill={true}
            />
            <SidebarList
              name={COMMON_CONST.RISK_ASSESSMENT}
              icon={<Icon_exclamation />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_RISKASSESSMENT}`}
            />
            <SidebarList
              name={COMMON_CONST.VIOLATION}
              icon={<Icon_Violation />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_VIOLATION}`}
              isFill={true}
            />
            <SidebarList
              name={COMMON_CONST.NOTIFICATIONS}
              icon={
                state?.Notification?.riskyLoans === 0 &&
                  state?.Notification?.defaultedLoans === 0 &&
                  state?.Notification?.newUsers === 0 &&
                  state?.Notification?.mFeeRisks === 0 ? (
                  <Icon_Notification />
                ) : (
                  <Icon_Explanation />
                )
              }
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_NOTIFICATION}`}
            />
            {userRole === COMMON_CONST.SUPER &&
              <SidebarList
                name={COMMON_CONST.USER_MANAGEMENT}
                icon={<Icon_UserManage />}
                url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_USER_MANAGEMENT}`}
              />
            }
            <SidebarList
              name={COMMON_CONST.HEARTBEAT}
              icon={<Icon_Heartbeat />}
              url={`${ApiConstants.ADMIN}${ApiConstants.SIDEBAR_HEARTBEAT}`}
              isFill={true}
            />
          </ul>
          <ul className="sidebar-menus bottom">
            <Logout
              name={COMMON_CONST.LOG_OUT}
              icon={<Icon_log_out />}
              isFill={true}
              url={`${ApiConstants.LOGIN}`}
            />
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

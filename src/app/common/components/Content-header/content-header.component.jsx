import { COMMON_CONST, CONTENT_HEADER_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import UtilsHelper from 'app/common/services/utilsHelper';
import React from 'react';
import {NavLink, useLocation, useHistory} from 'react-router-dom';
import styles from './content-header.module.scss';

const ContentHeader = () => {
  const location = useLocation();
  const history = useHistory();
  return (
    <>
      <div className="content-header">
        {location.pathname.includes('comments') ? (
          <div className="d-flex align-items-center">
            <span
              role="button"
              className={`pi pi-arrow-left ${styles.headerBackStyle}`}
              // style={{fontSize: '18px'}}
              onClick={() => history.goBack()}
            />
            <h5 className="len-header len-header-xxs bold mb-0 ml-3">
              {CONTENT_HEADER_CONST.BACK_TO_STAGING}
            </h5>
          </div>
        ) : (
          <>
            <div>
              <ul className="nav len-menu">
                <li className="nav-item">
                  <NavLink
                    exact
                    className="nav-link"
                    to="/admin/content/draft"
                    activeClassName="active"
                  >
                    {COMMON_CONST.OVERVIEW}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    exact
                    className="nav-link"
                    to="/admin/content/archive"
                    activeClassName="active"
                  >
                    {CONTENT_HEADER_CONST.ARCHIVE}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    exact
                    className="nav-link"
                    to="/admin/content/staging"
                    activeClassName="active"
                  >
                    {CONTENT_HEADER_CONST.STAGING}
                  </NavLink>
                </li>
              </ul>
            </div>
            {location.pathname.includes('/admin/content/draft') && UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CONT_MANAGE_OVERVIEW) ? (
              <NavLink
                className="btn btn-primary btn-pill"
                to="/admin/content/add"
              >
                {CONTENT_HEADER_CONST.ADD_CONTENT}
              </NavLink>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

export default ContentHeader;

import React from 'react';
import styles from './sessionexpiredstyles.module.scss';
import {Storagehelper} from 'app/common/shared/utils';
import {loginCase, logoutCase} from 'app/common/api/login.api';
import {NavLink, useHistory} from 'react-router-dom';
import {ReactComponent as Icon_sad} from 'assets/img/04_sad-final.svg';
import {SESSION_EXPIRED_CONST} from 'app/common/constants/constant';
import {Logo} from 'app/common/components/widgets/common';
function SessionExpired() {
  const history = useHistory();
  const redirectEvent = () => {
    const payload = {
      userName: Storagehelper.getUserData().userName,
    };
    logoutCase(payload)
      .then((res) => {
        Storagehelper.clearStorage();
        history.push('/login');
      })
      .catch((err) => {});
  };

  return (
    <div className={styles.overlay}>
      <div style={{padding: '15px'}}>
        <Logo />
      </div>
      <div className={styles.innerlay}>
        <div className={styles.loaderContainer} style={{textAlign: 'center'}}>
          {/* <img src={loader} /> */}
          <Icon_sad />
        </div>
        <div className={styles.quoteContainer}>
          <p>{SESSION_EXPIRED_CONST.SESSION_EXPIRED}</p>
          <p style={{fontWeight: 400, fontSize: 36}}>
            {SESSION_EXPIRED_CONST.OH_NO_EXPIRE_MSG}
          </p>
          <p style={{fontWeight: 400, fontSize: 32}}>
            {SESSION_EXPIRED_CONST.CLICK}{' '}
            <button
              className={styles.buttonStyle}
              onClick={() => redirectEvent()}>
              {SESSION_EXPIRED_CONST.HERE}
            </button>{' '}
            {SESSION_EXPIRED_CONST.TO_LOGINBACK}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SessionExpired;

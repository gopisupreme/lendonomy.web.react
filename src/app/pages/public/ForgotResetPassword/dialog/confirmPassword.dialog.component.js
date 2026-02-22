import React from 'react';
import {Dialog} from 'primereact/dialog';
import styles from '../forgotResetPassword.module.scss'

const ConfirmPassword = (props) => {
  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-center">
        <h4 className="len-header len-header-xs bold mb-0 ">{`${props.header}`}</h4>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        focusOnShow={false}
        className={`len-dialog confirm-dialog ${styles.confirmPassDiaContainer}`}
        closable={false}
        header={dialogHeader}
        footer={props.footer}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}
      >
        <p className='text-center'>{props.desc}</p>
      </Dialog>
    </>
  );
};

export default ConfirmPassword;

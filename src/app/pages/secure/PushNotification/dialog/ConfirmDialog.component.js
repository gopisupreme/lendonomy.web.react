import React from 'react';

import {Dialog} from 'primereact/dialog';
import styles from '../pushNotification.module.scss'

const ConfirmDialog = (props) => {
  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="len-header len-header-xs bold mb-0">{`${props.header}`}</h4>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        focusOnShow={false}
        className={`len-dialog confirm-dialog ${styles.ConfirmDiaContainerStyle}`}
        closable={false}
        header={dialogHeader}
        footer={props.footer}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}
      >
        <p>{props.desc}</p>
      </Dialog>
    </>
  );
};

export default ConfirmDialog;

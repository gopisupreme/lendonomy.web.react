import React from 'react';

import {Dialog} from 'primereact/dialog';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';

const ConfirmDialog = (props) => {
  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="len-header len-header-xs bold mb-0">{`${props.header}`}</h4>
        <a href="javascript:void(0)" onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        focusOnShow={false}
        className="len-dialog confirm-dialog"
        closable={false}
        header={dialogHeader}
        footer={props.footer}
        visible={props.visible}
        style={{width: '35%'}}
        modal={true}
        onHide={() => props.onHide()}
      >
        <p>{props.desc}</p>
      </Dialog>
    </>
  );
};

export default ConfirmDialog;

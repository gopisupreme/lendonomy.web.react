import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import { Dialog } from 'primereact/dialog';
import React from 'react';

const InfoDialog = (props) => {
  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          <h4 className="len-header len-header-xs bold mb-0 text-center">{`${props.header}`}</h4>
        </div>
        <a href="javascript:void(0)" onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        className="len-dialog info-dialog"
        closable={false}
        header={dialogHeader}
        footer={props.footer}
        visible={props.visible}
        style={{ width: "35%" }}
        modal={true}
        onHide={() => props.onHide()}
      >
        {props.desc}
      </Dialog>
    </>
  );
};

export default InfoDialog;

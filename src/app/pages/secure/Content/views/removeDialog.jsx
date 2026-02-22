import { COMMON_CONST, CONTENT_MANAGER_REMOVE_DIALOG_CONST } from 'app/common/constants/constant';
import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import { Dialog } from 'primereact/dialog';
import React from 'react';

const removeImageDialog = (props) => {
  const footer = (
    <div className="text-left">
      <button
        className="btn btn-primary btn-pill"
        type="button"
        onClick={() => props.onHide()}
        >
        {COMMON_CONST.NEVER_MIND}
      </button>
      <button
        type="button"
        className="btn btn-dark btn-pill"
        onClick={() => props.deleteImage()}
      >
        {COMMON_CONST.DELETE}
      </button>
    </div>
  );

  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="len-header len-header-xs bold mb-0">{`${props.action}`}</h4>
        <a href="javascript:void(0)" onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>

    </>
  );

  const onSubmit = (values) => {
    if (props.action === "Block") {
      props.block(props.currentIndex);
    } else {
      props.unBlock(props.currentIndex);
    }
  };

  const onInputChange = (e) => {
    e.persist();
    props.onChange(e, props.action.toLowerCase());
  };
  return (
    <>
      <Dialog
        className="len-dialog account-dialog"
        closable={false}
        header={dialogHeader}
        footer={footer}
        visible={props.visible}
        style={{ width: "40vw" }}
        modal={true}
        onHide={() => props.onHide()}
      >
      <div style={{paddingBottom: '1.5rem'}}>{CONTENT_MANAGER_REMOVE_DIALOG_CONST.DIALOG_CONTENT} {props.errorDisplayName} </div>

      </Dialog>
    </>
  );
};
export default removeImageDialog;

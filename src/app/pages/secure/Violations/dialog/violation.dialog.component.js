import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Field, Form } from 'react-final-form';

import { TextAreaRenderField } from 'app/common/components/widgets/common';
import { ACCOUNT_DIALOG_CONST, COMMON_CONST } from 'app/common/constants/constant';
import { ReactComponent as Icon_cancel } from 'assets/icon/icon_cancel.svg';
import { useEffect } from 'react';

export function ViolationDialog(props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [props.visible]);

  const footer = (
    <div className="text-left">
      {
        (props.action === 'Block') ? (
          <button  className="btn btn-dark btn-pill" type="button" onClick={() => props.block(props.currentIndex, value)} >{ACCOUNT_DIALOG_CONST.CONFIRM_BLOCK}</button>
        ) : <button  className="btn btn-dark btn-pill" onClick={() => props.unBlock(props.currentIndex, value)}>{ACCOUNT_DIALOG_CONST.CONFIRM_UNBLOCK}</button>
      }
    </div>
  );


  const dialogHeader = (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="len-header len-header-xs bold mb-0">{`${props.action} ${props.profile} ?`}</h4>
        <a href="javascript:void(0)" onClick={() => props.onHide()}>
          <Icon_cancel/>
        </a>
      </div>

    </>
  );

  const onSubmit = values => {
    
    if(!values.reason) return;
    if(props.action === 'Block'){
      props.block(props.currentIndex, value);
    }else{
      props.unBlock(props.currentIndex, value);
    }
  }

  const validate = (values) => {
    const errors = {}
    if (values.reason === undefined || values.reason === null ||values.reason === '' ) {
      errors.reason = ACCOUNT_DIALOG_CONST.REASON_ERROR_MSG;
    }
    return errors
  }


  return (
    <>
      <Dialog className="len-dialog account-dialog" closable={false} header={dialogHeader} footer={footer} visible={props.visible} style={{ width: '50vw' }} modal={true} onHide={() => props.onHide()}>
        <Form
          onSubmit={onSubmit}
          validate={validate}
          render={({ handleSubmit, submitting, pristine, form }) => (
            <form onSubmit={handleSubmit}>
              <Field
                  name="reason"
                  type="text"
                  component={TextAreaRenderField}
                  label={`${ACCOUNT_DIALOG_CONST.REASON_LABEL} ${props.action}ING`}
                  placeholder={ACCOUNT_DIALOG_CONST.REASON_TEXT_PLACEHOLDER}
                  inputChange={(e) => setValue(e.target.value)}
                />
              </form>
          )}
        />
      </Dialog>
    </>
  )
}

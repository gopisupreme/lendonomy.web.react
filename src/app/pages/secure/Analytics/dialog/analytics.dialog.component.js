import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {Field, Form} from 'react-final-form';

import {TextAreaRenderField} from 'app/common/components/widgets/common';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';
import {useEffect} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {getCountryPoint} from 'app/common/config/config';
import { ANALYTICS_DIALOG_CONST } from 'app/common/constants/constant';
import style from "../analytics.module.scss";

export function AnalyticsDialog(props) {
  const dialogHeader = (
    <>
      <div className='d-flex align-items-center justify-content-between'>
        <h4 className='len-header len-header-xs bold mb-0'>
          {ANALYTICS_DIALOG_CONST.LIST_OF_DEFAULTED_BORROWERS}
        </h4>
        <a href='javascript:void(0)' onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        className={`len-dialog account-dialog ${style.analyticsDiaStyle}`}
        closable={false}
        header={dialogHeader}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}>
        <div className='col-sm-16 ts-table'>
          <DataTable
            value={props.defaultedUsersList}
            scrollHeight='230px'
            scrollable={true}
            className={style.analyticsDiaTableStyle}
            emptyMessage={ANALYTICS_DIALOG_CONST.TABLE_EMPTY_MESSAGE}
            onRowClick={(rowData) => props.onDefaultedUserSelected(rowData)}>
            <Column
              field='name'
              header={ANALYTICS_DIALOG_CONST.BORROWER_NAME}
              className='font-weight-bold'></Column>
            <Column field='totDefLoans' header={ANALYTICS_DIALOG_CONST.NUMBER_OF_DEFAULTS} style={{textAlign:'center'}}></Column>
            <Column
              field='totDefAmount'
              header={ANALYTICS_DIALOG_CONST.TOTAL_DEFAULTED_AMOUNT}
              className='text-center'
              body={(rowData) => (
                <span>
                  {rowData.totDefAmount} {getCountryPoint(true)}
                </span>
              )}></Column>
          </DataTable>
        </div>
      </Dialog>
    </>
  );
}

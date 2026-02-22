import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {Field, Form} from 'react-final-form';

import {TextAreaRenderField} from 'app/common/components/widgets/common';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';
import {useEffect} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import dayjs from 'dayjs';
import styles from '../riskassessment.module.scss';
import classNames from 'classnames';

export function AnalyticsDialog(props) {
  console.log(props.FullUserList);
  const dialogHeader = (
    <>
      <div className='d-flex align-items-center justify-content-between'>
        <h4 className='len-header len-header-xs bold mb-0'>Attempt History</h4>
        <a href='javascript:void(0)' onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
      <div className='row'>
        <div className={classNames('pr-0', 'col-sm-1')}>
          {props.FullUserList.img && (
            <img
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
              }}
              src={props.FullUserList.img}
            />
            
          )}
        </div>
        <div className={`col-sm-6 pr-0 pl-3 ${styles.pPoppins}`}>
          <div>
            <p className={'text-truncate text-left mt-3'}>
              {props.FullUserList.name}  {props.FullUserList.surName}
            </p>
            {/* <p className={'text-truncate text-left mb-0'}>
              {props.FullUserList.surName}
            </p> */}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        className='len-dialog account-dialog'
        closable={false}
        header={dialogHeader}
        visible={props.visible}
        style={{width: '50vw'}}
        modal={true}
        onHide={() => props.onHide()}>
        <div className='col-sm-16 ts-table'>
          <DataTable
            value={props.defaultedUsersList}
            scrollHeight='230px'
            scrollable={true}
            style={{width: '100%', cursor: 'pointer'}}
            emptyMessage='No Records found'
            onRowClick={(rowData) => props.onDefaultedUserSelected(rowData)}>
            <Column
              field='Date'
              header='Date'
              body={(rowData) => (
                <p>{dayjs.utc(rowData.createdOn).format('DD.MM.YYYY')}</p>
              )}
              style={{fontWeight: 'bold'}}></Column>

            <Column
              field='attempt'
              header='Attempt'
              body={(rowData) => <span>{rowData.attempt}</span>}></Column>
            <Column
              field='OUtCome of Attempt'
              header='OUtCome of Attempt'
              body={(rowData) => {
                return (
                  <a href={`${rowData.href}`} target='_blank'>
                    <span style={{textDecorationLine: 'underline'}}>
                      {rowData.subRest}
                    </span>
                  </a>
                );
              }}></Column>
          </DataTable>
        </div>
      </Dialog>
    </>
  );
}

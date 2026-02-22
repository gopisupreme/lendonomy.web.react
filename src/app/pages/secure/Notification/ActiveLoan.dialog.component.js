import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';
import {DownLoadActiveLoan} from 'app/common/api/Notification.api';
import dayjs from 'dayjs';
import styles from './riskassessment.module.scss';
import { NOTIFICATION_ACTIVE_LOAN_CONST, NOTIFICATION_ACTIVE_LOAN_DIALOG_CONST } from 'app/common/constants/constant';

export function AnalyticsDialog(props) {
  const onButtonClick = () => {
    DownLoadActiveLoan(props?.borrowerId, props.userId).then((res) => {
      if (res.status === 200) {
        fetch(res.data.contractPath)
          .then((response) => {
            response.blob().then((blob) => {
              // Creating new object of PDF file
              const fileURL = window.URL.createObjectURL(blob);
              // Setting various property values
              let alink = document.createElement('a');
              alink.href = fileURL;
              const {BorrowerName, LenderName, dueDate} = props;
              const due_Date = dayjs(dueDate).format('DD-MM-YYYY');
              alink.download = `${BorrowerName}_${LenderName}_${due_Date}`;
              alink.click();
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };


  const dialogHeader = (
    <>
      <div className='d-flex align-items-end justify-content-between'>
        <h4 className='len-header len-header-xs bold mb-0'>Loan Contract</h4>
        <div className={styles.actDialogDownloadContainer}>
          <button
            type='button'
            className='btn btn-dark btn-pill d-block mr-4'
            onClick={() => {
              onButtonClick();
            }}>
            {NOTIFICATION_ACTIVE_LOAN_DIALOG_CONST.DOWNLOAD_AS_PDF}
          </button>
        </div>
        <a href='javascript:void(0)' onClick={() => props.onHide()}>
          <Icon_cancel />
        </a>
      </div>
    </>
  );

  return (
    <>
      <Dialog
        className={`len-dialog account-dialog ${styles.actDialogStyle}`}
        closable={false}
        header={dialogHeader}
        visible={props.visible}
        modal={true}
        onHide={() => props.onHide()}>
        <div className='col-sm-16 ts-table'>
          {props?.selectedList &&
            props?.selectedList.map((item) => {
              let Title = item.title.replaceAll('\n', '<br />');
              // .replaceAll('\t', '&nbsp');
              let Description = item.description.replaceAll('\n', '<br />');
              // .replaceAll('\t', '&nbsp');
              return (
                <>
                  <div
                    dangerouslySetInnerHTML={{__html: ` <h4 style={{fontFamily:'Poppins',fontWeight:'bold'}}>${Title}</h4>`}}
                  />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<p style={{fontFamily:'Poppins'}}>${Description}</p>`,
                    }}
                  />
                  {/* <h4 dangerouslySetInnerHTML={}>{Title}</h4>
                  <p>{item.description}</p> */}
                </>
              );
            })}
        </div>
      </Dialog>
    </>
  );
}

export default AnalyticsDialog;

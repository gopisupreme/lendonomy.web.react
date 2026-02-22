import {
  archivehArticle,
  configTier,
  draftArticle,
  getContents,
  publishArticle,
} from 'app/common/api/content.api';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import Header from 'app/common/components/Header/header.component';
import InfoDialog from 'app/common/components/Info-dialog/info-dialog.component';
import {
  InputRenderField,
  SelectRenderField,
} from 'app/common/components/widgets/common';
import APP_CONST from 'app/common/constants/app.constant';
import dayjs from 'dayjs';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { Field, Form } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import { epochToDate } from 'app/common/components/widgets/common';
import styles from './viewsstyles.module.scss';
import classNames from 'classnames';
import { COMMON_CONST, CONTENT_HEADER_CONST, CONTENT_MANAGER_STAGING_CONST, CONTENT_TABLE_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import UtilsHelper from 'app/common/services/utilsHelper';

const validate = (values) => {
  const errors = {};
  if (!values.tier1PubLimit) {
    errors.tier1PubLimit = 'Required';
  }
  if (!values.tier2PubLimit) {
    errors.tier2PubLimit = 'Required';
  }
  if (values.tier1PubLimit < 0) {
    errors.tier1PubLimit = 'Invalid';
  }
  if (values.tier2PubLimit < 0) {
    errors.tier2PubLimit = 'Invalid';
  }
  return errors;
};

const StagingContent = (props) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [exceedInfo, setExceedInfo] = useState(false);
  const [readyToPublishedList, setReadyTopublishedList] = useState([]);
  const [selectedStagedcont, setSelectedStagedcont] = useState({});
  const [selectedArchivedcont, setSelectedArchivedcont] = useState({});
  const history = useHistory();
  const [publishedcontents, setPublishedContents] = useState([]);
  const [doRefresh, setDoRefresh] = useState(false);
  const [confirmVisibleArchive, setConfirmVisibleArchive] = useState(false);
  const [sortKey, setSortKey] = useState();
  const [tierLimit, setTierLimit] = useState({});
  let dt = useRef();
  const [articleLimit, setArticleLimit] = useState(10);

  useEffect(onload, [doRefresh]);
  function onload() {
    getContents('staging')
      .then((res) => {
        const articles = res.data.articles;
        const tierInfo = {
          tier1PubLimit: res.data.tier1PubLimit,
          tier2PubLimit: res.data.tier2PubLimit,
        };
        const stagedArticle = articles.filter(
          (article) =>
            article.articleStatus === APP_CONST.CONTENT_STATUS.STAGGING
        );
        const publishedArticle = articles.filter(
          (article) =>
            article.articleStatus === APP_CONST.CONTENT_STATUS.PUBLISHED
        );
        const tier1 = publishedArticle.filter(
          (article) => article.tierInfo == 1
        );
        const tier2 = publishedArticle.filter(
          (article) => article.tierInfo === 2
        );
        const publishedData = [
          {
            name: APP_CONST.TIER_INFO.TIER_1,
            dataArr: tier1,
          },
          {
            name: APP_CONST.TIER_INFO.TIER_2,
            dataArr: tier2,
          },
        ];

        stagedArticle.map((con) => {
          con.tierInfo = APP_CONST.TIER_INFO.TIER_1;
          return con;
        });

        setPublishedContents(publishedData);
        setReadyTopublishedList(stagedArticle);
        setTierLimit(tierInfo);
      })
      .catch((err) => { });
  }

  function onSort(sort) {
    if (!sort || sort === sortKey) return;
    setSortKey(sort);
    const tier1 =
      publishedcontents &&
      publishedcontents.filter(
        (article) => article.name === APP_CONST.TIER_INFO.TIER_1
      );
    const tier2 =
      publishedcontents &&
      publishedcontents.filter(
        (article) => article.name === APP_CONST.TIER_INFO.TIER_2
      );
    let publishedData;
    if (sort === APP_CONST.TIER_INFO.TIER_2) {
      publishedData = [
        {
          name: APP_CONST.TIER_INFO.TIER_2,
          dataArr: tier2[0].dataArr,
        },
        {
          name: APP_CONST.TIER_INFO.TIER_1,
          dataArr: tier1[0].dataArr,
        },
      ];
      setPublishedContents(publishedData);
      return;
    } else {
      publishedData = [
        {
          name: APP_CONST.TIER_INFO.TIER_1,
          dataArr: tier1[0].dataArr,
        },
        {
          name: APP_CONST.TIER_INFO.TIER_2,
          dataArr: tier2[0].dataArr,
        },
      ];
      setPublishedContents(publishedData);
      return;
    }
  }

  function onEdit(data) {
    const rowData = {
      ...data,
      tierInfo: data.tierInfo === APP_CONST.TIER_INFO.TIER_1 ? 1 : 2,
    };
    history.push({
      pathname: '/admin/content/edit',
      state: { rowData },
    });
  }
  function onArchive(rowData) {
    setSelectedArchivedcont(rowData);
    setConfirmVisibleArchive(true);
  }
  const stagingActionTemplate = (rowData, column) => {
    return (
      <>
        <div className="d-flex justify-content-around align-items-center">
          <div
            className={styles.chatContainer}
            onClick={() =>
              history.push({
                pathname: '/admin/content/comments',
                state: rowData,
              })
            }
          >
            {rowData?.hasComments && <span className="bubble" />}
            <img src={require('../../../../../assets/icon/icon_chat.png')} />
          </div>
          <button
            className="btn btn-light btn-pill m-3"
            onClick={() => {
              onEdit(rowData);
            }}
          >
            {COMMON_CONST.EDIT}
          </button>
          <button
            className="btn btn-danger btn-pill"
            onClick={() => onArchive(rowData)}
          >
            {CONTENT_HEADER_CONST.ARCHIVE}
          </button>
        </div>
      </>
    );
  };

  function onDraft(data) {
    const rowData = {
      ...data,
      tierInfo: data.tierInfo === APP_CONST.TIER_INFO.TIER_1 ? 1 : 2,
      articleStatus: APP_CONST.CONTENT_STATUS.DRAFT,
    };
    draftArticle(rowData).then((res) => {
      if (res.status === 200) {
        history.push({
          pathname: '/admin/content/draft',
        });
      }
    });
  }

  const actionTemplate = (rowData, column) => {
    return (
      <>
        <div className="d-flex justify-content-around align-items-center">
          <button
            className="btn btn-light btn-pill mr-2"
            onClick={() => onEdit(rowData)}
          >
            {COMMON_CONST.EDIT}
          </button>
          <button
            className="btn btn-primary btn-pill mr-2"
            onClick={() => {
              setSelectedStagedcont(rowData);
              setConfirmVisible(true);
            }}
          >
            {CONTENT_TABLE_CONST.PUBLISH}
          </button>
          <button
            className="btn btn-danger btn-pill"
            onClick={() => onDraft(rowData)}
          >
            {CONTENT_TABLE_CONST.DRAFT}
          </button>
        </div>
      </>
    );
  };

  const onHideDialog = () => {
    setConfirmVisible(false);
    setConfirmVisibleArchive(false);
  };
  const onHideArchiveModal = () => {
    setConfirmVisibleArchive(false);
  };
  function onPublish() {
    const pubPayload = { ...selectedStagedcont };
    pubPayload.articleStatus = APP_CONST.CONTENT_STATUS.PUBLISHED;
    if (pubPayload.tierInfo === APP_CONST.TIER_INFO.TIER_1) {
      const publishedList = publishedcontents.filter(
        (article) => article.name === APP_CONST.TIER_INFO.TIER_1
      )[0];
      if (publishedList.dataArr.length === tierLimit.tier1PubLimit) {
        setInfoVisible(true);
        setConfirmVisible(false);
        return true;
      }
    } else {
      const publishedList = publishedcontents.filter(
        (article) => article.name === APP_CONST.TIER_INFO.TIER_2
      )[0];
      if (publishedList.dataArr.length === tierLimit.tier2PubLimit) {
        setInfoVisible(true);
        setConfirmVisible(false);
        return;
      }
    }
    pubPayload.tierInfo = Number(pubPayload.tierInfo.split(' ')[1]);
    publishArticle(pubPayload)
      .then((res) => {
        onHideDialog();
        setDoRefresh(!doRefresh);
      })
      .catch((err) => {
        onHideDialog();
      });
  }

  function onArchiveContent() {
    const pubPayload = { ...selectedArchivedcont };
    pubPayload.articleStatus = APP_CONST.CONTENT_STATUS.ARCHIVE;
    archivehArticle(pubPayload)
      .then((res) => {
        onHideArchiveModal();
        setDoRefresh(!doRefresh);
        history.push({
          pathname: '/admin/content/archive',
        });
      })
      .catch((err) => { });
  }
  const footerTmpl = (
    <div className="text-left">
      <button className="btn btn-primary btn-pill" onClick={onPublish}>
        {CONTENT_TABLE_CONST.PUBLISH}
      </button>
      <button className="btn btn-dark btn-pill" onClick={onHideDialog}>
        {COMMON_CONST.NEVER_MIND}
      </button>
    </div>
  );
  const archiveFooter = (
    <div className="text-left">
      <button className="btn btn-primary btn-pill" onClick={onArchiveContent}>
        {CONTENT_HEADER_CONST.ARCHIVE}
      </button>
      <button className="btn btn-dark btn-pill" onClick={onHideArchiveModal}>
        {COMMON_CONST.NEVER_MIND}
      </button>
    </div>
  );

  const onInfoHideDialog = () => {
    setInfoVisible(false);
    setExceedInfo(false);
  };

  const infoFooterTmpl = (
    <div className="text-center">
      <button className="btn btn-dark btn-pill" onClick={onInfoHideDialog}>
        {COMMON_CONST.OKAY}
      </button>
    </div>
  );
  const exceedFooterTmpl = (
    <div className="text-center">
      <button className="btn btn-dark btn-pill" onClick={onInfoHideDialog}>
        {COMMON_CONST.OKAY}
      </button>
    </div>
  );

  function publishInTemplate(rowData, column) {
    return (
      <SelectRenderField
        value={rowData.tierInfo}
        options={[APP_CONST.TIER_INFO.TIER_1, APP_CONST.TIER_INFO.TIER_2]}
        onChange={(e) => {
          const updatePublishedList = [...readyToPublishedList];
          updatePublishedList.forEach((con) => {
            if (rowData.id === con.id) {
              con.tierInfo = e.target.value;
            }
            return con;
          });
          setReadyTopublishedList(updatePublishedList);
        }}
      />
    );
  }
  const infoDialogDesc = (
    <>
      <p className="mb-0">
        {CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_QUESTION}
      </p>
      <p className="mb-0">{CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_OPTION1}</p>
      <p className="mb-0">{CONTENT_TABLE_CONST.INFODIALOG_SUB_TEXT_OPTION2}</p>
    </>
  );
  const exceedInfoDesc = (
    <>
      <p className="mb-0">{CONTENT_MANAGER_STAGING_CONST.CANNOT_DECREASE_THE_TIER_CAPACITY}</p>
      <p className="mb-0">
        {CONTENT_MANAGER_STAGING_CONST.ALREADY_PUBLISHED_TIER1} :{' '}
        {publishedcontents[0]?.dataArr?.length}{' '}
      </p>
      <p className="mb-0">
        {CONTENT_MANAGER_STAGING_CONST.ALREADY_PUBLISHED_TIER2} :{' '}
        {publishedcontents[1]?.dataArr?.length}
      </p>
    </>
  );

  const onSubmit = (values) => {
    values.tiersort && delete values.tiersort;
    if (
      Number(values.tier1PubLimit) < publishedcontents[0]?.dataArr?.length ||
      Number(values.tier2PubLimit) < publishedcontents[1]?.dataArr?.length
    ) {
      setExceedInfo(true);
      return;
    }
    configTier(values)
      .then((res) => {
        values.tier2PubLimit = '';
        values.tier1PubLimit = '';
      })
      .catch();
  };

  function registeredOnTemplate(rowData) {
    return <div>{epochToDate(rowData.createdOn)}</div>;
  }
  const paginatorLeft = (
    <button
      disabled
      className="btn btn-dark btn-pill mr-4"
      onClick={(e) => {
        console.log('blocked prev button');
      }}
    >
      {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
    </button>
  );
  const paginatorRight = (
    <button
      disabled
      className="btn btn-dark btn-pill ml-4"
      onClick={(e) => {
        console.log('blocked Next button');
      }}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  return (
    <>
      <Header
        title={COMMON_CONST.CONTENT_MANAGER}
        desc={CONTENT_MANAGER_STAGING_CONST.STAGING_HEADER_SUB_TEXT}
      />
      <div className="container-area">
        <div>
          <h3 className="len-header">{CONTENT_MANAGER_STAGING_CONST.PUBLISHED}</h3>
          <div className="mb-3">
            <Form
              onSubmit={onSubmit}
              validate={validate}
              render={({ handleSubmit, submitting, pristine, form, values }) => (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="row">
                        <div className="col-lg-3">
                          <Field
                            name="tiersort"
                            type="text"
                            component={SelectRenderField}
                            label={CONTENT_MANAGER_STAGING_CONST.SORT_LABEL}
                            options={[
                              APP_CONST.TIER_INFO.TIER_1,
                              APP_CONST.TIER_INFO.TIER_2,
                            ]}
                            validate={onSort}
                          // onChange={e => onSort(values)}
                          />
                        </div>
                        <div className="col-lg-3">
                          <Field
                            name="tier1PubLimit"
                            type="number"
                            component={InputRenderField}
                            label={CONTENT_MANAGER_STAGING_CONST.TIER1_CAPACITY}
                          />
                        </div>
                        <div className="col-lg-3">
                          <Field
                            name="tier2PubLimit"
                            type="number"
                            component={InputRenderField}
                            label={CONTENT_MANAGER_STAGING_CONST.TIER2_CAPACITY}
                          />
                        </div>
                        {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CONT_MANAGE_STAGE) && 
                        <div className="col-lg-2 mb-2">
                          <div className="d-flex flex-column justify-content-center h-100">
                            <button className="btn btn-primary btn-pill">
                              {COMMON_CONST.SAVE}
                            </button>
                          </div>
                        </div>
                        }
                      </div>
                    </div>
                  </div>
                </form>
              )}
            />
          </div>
        </div>
        <div id="published-container">
          {publishedcontents.map((item, index) => {
            return (
              <div
                className={`${index === 0 ? 'first-tier mb-4' : 'mb-5'} `}
                key={index}
              >
                <h6 className="tier-heading">{item.name}</h6>
                <div className="len-datatable">
                  <DataTable
                    value={item.dataArr}
                    className={styles.stageDataTableStyle}
                    scrollable={true}
                    paginator={false}
                    scrollHeight="285px"
                  >
                    <Column
                      field="title"
                      header={CONTENT_MANAGER_STAGING_CONST.CONTENT_NAME}
                      headerClassName={styles.stageContNameHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    <Column
                      field="contType"
                      header={CONTENT_MANAGER_STAGING_CONST.CONTENT_TYPE}
                      headerClassName={styles.stageContTypeHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    <Column
                      field="age"
                      header={CONTENT_MANAGER_STAGING_CONST.AGE_STATUS}
                      headerClassName={styles.stageContTypeHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    <Column
                      field="createdOn"
                      header={CONTENT_MANAGER_STAGING_CONST.CREATED_ON}
                      body={registeredOnTemplate}
                      headerClassName={styles.stageContTypeHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    <Column
                      field="category"
                      header={CONTENT_MANAGER_STAGING_CONST.OVERLINE}
                      headerClassName={styles.stageContTypeHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    <Column
                      field="views"
                      header={CONTENT_MANAGER_STAGING_CONST.LIKES}
                      headerClassName={styles.stageContTypeHeaderStyle}
                      className={styles.stageContNameColumnStyle}
                    />
                    {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CONT_MANAGE_STAGE) &&
                    <Column
                      body={stagingActionTemplate}
                      headerClassName={styles.stageActionButtonStyle}
                    />
                     }
                  </DataTable>
                </div>
              </div>
            );
          })}
        </div>
        <div id="ready-to-publish-container" className="mt-4">
          <h6 className="len-header len-header-sm">{CONTENT_MANAGER_STAGING_CONST.READY_TO_PUBLISH}</h6>
          <div className="len-datatable">
            <DataTable
              value={readyToPublishedList}
              scrollHeight="350px"
              className={styles.ReadyPublishDataTableStyle}
              scrollable={true}
              totalRecords={readyToPublishedList && readyToPublishedList.length}
              emptyMessage={CONTENT_MANAGER_STAGING_CONST.PUBLISH_TABLE_EMPTY_MSG}
              ref={(el) => (dt = el)}
              paginator
              rows={articleLimit}
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              paginatorTemplate="PageLinks"
              paginatorLeft={paginatorLeft}
              paginatorRight={paginatorRight}
            // currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            // paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            >
              <Column
                field="title"
                header={CONTENT_MANAGER_STAGING_CONST.CONTENT_NAME}
                headerClassName={styles.ReadyPublishNameHeaderStyle}
                className={styles.ReadyPublishNameColumnStyle}
              />
              <Column
                field="contType"
                header={CONTENT_MANAGER_STAGING_CONST.CONTENT_TYPE}
                headerClassName={styles.ReadyPublishTypeHeaderStyle}
                className={styles.ReadyPublishNameColumnStyle}
              />
              <Column
                field="createdOn"
                header={CONTENT_MANAGER_STAGING_CONST.CREATED_ON}
                body={(rowData) => epochToDate(rowData.createdOn)}
                headerClassName={styles.ReadyPublishTypeHeaderStyle}
                className={styles.ReadyPublishNameColumnStyle}
              />
              <Column
                field="tierInfo"
                header={CONTENT_MANAGER_STAGING_CONST.PUBLISH_IN}
                body={publishInTemplate}
                headerClassName={styles.ReadyPublishInHeaderStyle}
              />
              <Column
                field="category"
                header={CONTENT_MANAGER_STAGING_CONST.OVERLINE}
                headerClassName={styles.ReadyPublishTypeHeaderStyle}
                className={styles.ReadyPublishNameColumnStyle}
              />
              {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.CONT_MANAGE_STAGE) &&
              <Column
                body={actionTemplate}
                headerClassName={styles.ReadyPublishInHeaderStyle}
                className={styles.ReadyPublishNameColumnStyle}
              />
              }
            </DataTable>
            <ConfirmDialog
              visible={confirmVisible}
              header={CONTENT_TABLE_CONST.CONFIRM_DIALOG_HEADER}
              desc={`${CONTENT_MANAGER_STAGING_CONST.YOU_ARE_PUBLISHING} ${selectedStagedcont.title}`}
              footer={footerTmpl}
              onHide={onHideDialog}
            />
            <ConfirmDialog
              visible={confirmVisibleArchive}
              header={CONTENT_MANAGER_STAGING_CONST.ARCHIVE_DIALOG_HEADER}
              desc={`${CONTENT_MANAGER_STAGING_CONST.ARCHIVE_DIALOG_SUB_TEXT1} "${selectedArchivedcont.title}" ${CONTENT_MANAGER_STAGING_CONST.ARCHIVE_DIALOG_SUB_TEXT2}`}
              footer={archiveFooter}
              onHide={onHideArchiveModal}
            />

            <InfoDialog
              visible={infoVisible}
              header={CONTENT_TABLE_CONST.INFODIALOG_HEADER}
              desc={infoDialogDesc}
              footer={infoFooterTmpl}
              onHide={onInfoHideDialog}
            />
            <InfoDialog
              visible={exceedInfo}
              header={CONTENT_TABLE_CONST.INFODIALOG_HEADER}
              desc={exceedInfoDesc}
              footer={infoFooterTmpl}
              onHide={onInfoHideDialog}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StagingContent;

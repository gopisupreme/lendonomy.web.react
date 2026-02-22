import {
  ImageUpload,
  InputRenderField,
  SelectRenderField,
  TextAreaRenderField,
} from "app/common/components/widgets/common";
import APP_CONST from "app/common/constants/app.constant";
import { COMMON_CONST, CONTENT_MANAGER_ARTICAL_FORM_CONST, CONTENT_MANAGER_VIDEO_FORM_CONST } from "app/common/constants/constant";
import utilsHelper from "app/common/services/utilsHelper";
import history from "app/common/shared/history";
import { parseBase64 } from "app/common/shared/utils";
import contentAction from "app/store/actions/content.action";
import React, { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import * as _ from 'underscore';

const validate = (values) => {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = "Required";
  }
  if (!values.category?.trim()) {
    errors.category = "Required";
  }
  if (!values.authName?.trim()) {
    errors.authName = "Required";
  }
  if (!values.videoLink?.trim()) {
    errors.videoLink = "Required";
  }
  if (!values.logo) {
    errors.logo = "Required";
  }
  if (!values.hLink?.trim()) {
    errors.hLink = "Required";
  }
  if (!values.authPic) {
    errors.authPic = "Required";
  }
  if (!values.description?.trim()) {
    errors.description = "Required";
  }
  return errors;
};
const required = value => ((value?.toString()?.trim()) ? undefined : 'Required')
const trustScoreRequired = value => ((value?.toString()?.trim()) ? value?.length > 2 ? "Max 2 digits allowed" : undefined : 'Required')
const VideoForm = (props) => {
  const [videoForm, setVideoForm] = useState();
  const [formLoader, setFormLoader] = useState(false);
  const [showRemoveImgModal, setShowRemoveImgModal] = useState(false);
  const formInitialvalue = props.formValue && props.formValue.rowData;

  const dispatch = useDispatch();

  const {
    articleLoading,
    article: { serverError, articlResp },
  } = useSelector((store) => store.content);
  useEffect(() => {
    setFormLoader(articleLoading);
  }, [articleLoading]);

  useEffect(() => {
    if (!_.isEmpty(formInitialvalue)) {
      if (formInitialvalue && formInitialvalue.quiz){
        formInitialvalue.quiz.req = 'Yes';
      }
      else{
        formInitialvalue.quiz ={};
        formInitialvalue.quiz.req = 'No';
      }
    }
    if (formInitialvalue) setVideoForm(formInitialvalue);
  }, [articlResp]);
  const [quizErrorMsg, setQuizErrorMsg] = useState();
  const [answerErrorMsg, setAnswerErrorMsg] = useState();

  const onSubmit = (values) => {
    console.log('submitting...')
    let articleReqForm = { ...values };
    articleReqForm.dop = utilsHelper.toUnix(values.dop);
    articleReqForm.contType = APP_CONST.CONTENT_TYPE.VIDEO;
    if (articleReqForm.quiz && articleReqForm.quiz.req !== "Yes") {
      delete articleReqForm.quiz;
    }
    if (formInitialvalue) {
      dispatch(contentAction.editArticle(articleReqForm));
    } else {
      dispatch(contentAction.addArticle(articleReqForm));
    }
  };
  return (
    <>
      <Form
        onSubmit={onSubmit}
        initialValues={videoForm}
        validate={validate}
        render={({ handleSubmit, submitting, pristine, form, values, touched }) => (
          <>
            <form onSubmit={handleSubmit} className="mt-5">
            <div className="row">
              <div className="col-lg-6">
                <Field
                  name="title"
                  type="text"
                  bold
                  component={InputRenderField}
                  label={CONTENT_MANAGER_VIDEO_FORM_CONST.VIDEO_NAME}
                  placeholder={CONTENT_MANAGER_VIDEO_FORM_CONST.VIDEO_NAME_PLACEHOLDER}
                />
              </div>
              <div className="col-lg-6">
                <Field
                  bold
                  name="videoLink"
                  type="text"
                  component={InputRenderField}
                  label={CONTENT_MANAGER_VIDEO_FORM_CONST.VIDEO_URL}
                  placeholder={CONTENT_MANAGER_VIDEO_FORM_CONST.VIDEO_URL_PLACEHOLDER}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Field
                  bold
                  name="category"
                  type="text"
                  component={InputRenderField}
                  label={CONTENT_MANAGER_ARTICAL_FORM_CONST.OVERLINE1}
                  placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.OVERLINE1_PLACEHOLDER}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Field
                  bold
                  name="authName"
                  type="text"
                  component={InputRenderField}
                  label={CONTENT_MANAGER_ARTICAL_FORM_CONST.AUTHOR1}
                  placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.AUTHOR1_PLACEHOLDER}
                />
              </div>
              <div className="col-lg-2">
                <label className="font-weight-bold">{CONTENT_MANAGER_ARTICAL_FORM_CONST.AUTHOR_PICTURE}*</label>
                <Field
                  name="authPic"
                  component={ImageUpload}
                  label={CONTENT_MANAGER_ARTICAL_FORM_CONST.UPLOAD_IMAGE_LABEL}
                  accept="image/*"
                  parse={(value) => parseBase64(value, form, "authPicFormat")}
                  showRemoveImgModal={showRemoveImgModal}
                  setShowRemoveImgModal={setShowRemoveImgModal}
                  defaultImage={formInitialvalue && formInitialvalue.authPic}
                  errorDisplayName="author picture"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Field
                  bold
                  name="description"
                  type="text"
                  component={TextAreaRenderField}
                  label={`${CONTENT_MANAGER_VIDEO_FORM_CONST.TEXT_UNDER_VIDEO}*`}
                  placeholder={CONTENT_MANAGER_VIDEO_FORM_CONST.TEXT_UNDER_VIDEO_PLACEHOLDER}
                  rows="6"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Field
                  bold
                  name="hLink"
                  type="text"
                  component={InputRenderField}
                  label={`${CONTENT_MANAGER_ARTICAL_FORM_CONST.LOGO_URL}*`}
                  placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.LOGO_URL_PLACEHOLDER}
                />
              </div>
              <div className="col-lg-3">
                <label className="font-weight-bold">{CONTENT_MANAGER_ARTICAL_FORM_CONST.PARTNER_LOGO}*</label>
                <Field
                  name="logo"
                  component={ImageUpload}
                  label={CONTENT_MANAGER_ARTICAL_FORM_CONST.UPLOAD_IMAGE_LABEL}
                  accept="image/*"
                  parse={(value) => parseBase64(value, form, "authPicFormat")}
                  showRemoveImgModal={showRemoveImgModal}
                  setShowRemoveImgModal={setShowRemoveImgModal}
                  defaultImage={formInitialvalue && formInitialvalue.logo}
                  errorDisplayName="partner logo"
                />
              </div>
            </div>
            <div className="mb-5">
              <div className="row">
                <div className="col-3">
                  <Field
                    bold
                    validate={(value) => {
                      let selectErrorMsg = value === CONTENT_MANAGER_ARTICAL_FORM_CONST.SELECT_ONE_YES_NO || value === ''
                        ?COMMON_CONST.REQUIRED_ERROR_MSG
                        : undefined;
                        setQuizErrorMsg(selectErrorMsg)
                      return selectErrorMsg; 
                    }}
                    defaultValue={CONTENT_MANAGER_ARTICAL_FORM_CONST.SELECT_ONE_YES_NO}
                    name="quiz.req"
                    type="text"
                    component={SelectRenderField}
                    label={CONTENT_MANAGER_ARTICAL_FORM_CONST.QUIZ_REQUIRED}
                    placeholder={true}
                    options={["Select one (Yes/No)", "Yes", "No"]}
                  />
                  {touched['quiz.req'] &&
                  <span className="error-text">{quizErrorMsg}</span>
                }
                </div>
              </div>
            </div>
            {values.quiz && values.quiz.req === "Yes" ? (
              <>
                <div className="mb-3">
                  <h3>
                    <strong>{CONTENT_MANAGER_ARTICAL_FORM_CONST.QUIZ}</strong>
                  </h3>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Field
                      bold
                      name="quiz.question"
                      type="text"
                      component={InputRenderField}
                      label={CONTENT_MANAGER_ARTICAL_FORM_CONST.QUESTION}
                      placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.QUESTION_PLACEHOLDER}
                      validate={required}
                    />
                  </div>
                </div>
                <div className="row justify-content-between">
                  <div className="col-5">
                    <Field
                      bold
                      name="quiz.ans1"
                      type="text"
                      component={InputRenderField}
                      label={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_ONE}
                      placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_ONE_PLACEHOLDER}
                      validate={required}
                    />
                  </div>
                  <div className="col-5">
                    <Field
                      bold
                      name="quiz.ans2"
                      type="text"
                      component={InputRenderField}
                      label={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_TWO}
                      placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_ONE_PLACEHOLDER}
                      validate={required}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <Field
                      bold
                      name="quiz.ans3"
                      type="text"
                      component={InputRenderField}
                      label={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_THREE}
                      placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.ANSWER_ONE_PLACEHOLDER}
                      validate={required}
                    />
                  </div>
                </div>
                <div className="row justify-content-between">
                  <div className="col-5">
                  <Field
                      bold
                      name="quiz.answer"
                      type="text"
                      defaultValue={CONTENT_MANAGER_ARTICAL_FORM_CONST.CHOSE_ONE}
                      component={SelectRenderField}
                      label={CONTENT_MANAGER_ARTICAL_FORM_CONST.CORRECT_ANSWER}
                      placeholder={true}
                      options={(()=> {
                        let options = ["chose one"];
                        if(values?.quiz?.ans1?.length && values?.quiz?.ans2?.length && values?.quiz?.ans3?.length){
                          options.push(values.quiz.ans1)
                          options.push(values.quiz.ans2)
                          options.push(values.quiz.ans3)
                        }
                        return options;
                      })()}
                      validate={(value) => {
                        let selectErrorMsg = value === CONTENT_MANAGER_ARTICAL_FORM_CONST.CHOSE_ONE || value === ''
                          ?COMMON_CONST.REQUIRED_ERROR_MSG
                          : undefined;
                          setAnswerErrorMsg(selectErrorMsg)
                        return selectErrorMsg; 
                      }}
                    />
                     {touched['quiz.answer'] &&
                      <span className="error-text">{answerErrorMsg}</span>
                      }
                  </div>
                  <div className="col-5">
                    <Field
                      bold
                      name="quiz.trustScore"
                      type="text"
                      component={InputRenderField}
                      label={`${CONTENT_MANAGER_ARTICAL_FORM_CONST.TRUST_SCORE_REWARD_DEDUCT}*`}
                      placeholder={CONTENT_MANAGER_ARTICAL_FORM_CONST.TRUST_SCORE_REWARD_DEDUCT_PLACEHOLDER}
                      validate={trustScoreRequired}
                    />
                  </div>
                </div>
              </>
            ) : null}
            <div className="d-flex py-4">
              <button
                className="btn btn-primary btn-pill"
                type="submit"
                onClick={() => {
                  form.change(
                    "articleStatus",
                    APP_CONST.CONTENT_STATUS.STAGGING
                  );
                  // handleSubmit();
                }}
                // disabled={formLoader}
              >
                {videoForm ? CONTENT_MANAGER_ARTICAL_FORM_CONST.SAVE_AND_STAGE : CONTENT_MANAGER_ARTICAL_FORM_CONST.MOVE_TO_STAGING}
              </button>
              {videoForm &&
              videoForm.articleStatus !==
                APP_CONST.CONTENT_STATUS.DRAFT ? undefined : (
                <button
                  className="btn btn-dark btn-pill ml-4"
                  type="submit"
                  onClick={() => {
                    form.change(
                      "articleStatus",
                      APP_CONST.CONTENT_STATUS.DRAFT
                    );
                    // handleSubmit();
                  }}
                  // disabled={formLoader}
                >
                  {CONTENT_MANAGER_ARTICAL_FORM_CONST.SAVE_AS_DRAFT}
                </button>
              )}
              <button
                className="btn btn-danger btn-pill ml-4"
                onClick={() => history.goBack()}
              >
                {COMMON_CONST.CANCEL}
              </button>
            </div>
            </form>
            </>
        )}
      />
    </>
  );
};

export default VideoForm;

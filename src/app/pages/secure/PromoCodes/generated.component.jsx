import {
  getAllAccountsListCase,
  searchUsersCase,
} from 'app/common/api/account.list.api';
import {
  createPromoCode,
  updateEditedPromo,
  validateEditedPromo,
  validatePromoCode,
} from 'app/common/api/promocodes.api';
import {
  ImageUpload,
  InputRenderField,
  SelectRenderField,
  TextAreaRenderField,
} from 'app/common/components/widgets/common';
import UtilsHelper from 'app/common/services/utilsHelper';
import {parseBase64} from 'app/common/shared/utils';
import { GENERATE_PROMO_CODE_CONST, COMMON_CONST, ALL_PROMO_CODE_CONST, PROMO_CODES_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import {ReactComponent as Icon_cancel} from 'assets/icon/icon_cancel.svg';
import {ReactComponent as Icon_checked} from 'assets/icon/icon_checked.svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {Calendar} from 'primereact/calendar';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import {Dialog} from 'primereact/dialog';
import React, {useEffect, useRef, useState} from 'react';
import {Field, Form} from 'react-final-form';
import * as _ from 'underscore';
import {Search, tabNames, tabTitle} from './promoCodes.component';
import styles from './promocodestyles.module.scss';
import {getCountryPoint} from 'app/common/config/config';
import { hideLoader, showLoader } from "app/store/actions/app.action";
import { connect, useDispatch } from "react-redux";
const GeneratePromoCodes = ({
  toBeEditedData,
  setToBeEditedData,
  changeActiveTab,
  setTitle,
}) => {
  const [showUsers, setShowUsers] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [initialValues, setInitialValues] = useState({});

  const [showReviewPromoCode, setReviewPromoCodeData] = useState(null);

  const [error, setError] = useState({
    title: '',
    desc: '',
    showError: false,
  });

  useEffect(() => {
    setTitle(toBeEditedData ? tabTitle.edit : tabTitle.generate);

    setInitialValues(
      toBeEditedData
        ? {
            ...toBeEditedData,
            allUsersOption: toBeEditedData.allUsers ? 'Yes' : 'No',
          }
        : {
            codeName: '',
            discountPercentage: 1,
            maxDiscount: 0,
            notes: '',
            validFrom: new Date().getTime(),
            validTo: new Date().getTime(),
            codeType: '',
            title: '',
            codeImage: '',
            allUsersOption: null,
            userDetails: [],
            imageFormat: 'jpg',
          }
    );

    setSelectedUsers(toBeEditedData ? toBeEditedData?.userDetails : []);

    return () => {
      setToBeEditedData(null);
    };
  }, []);

  const onChooseUsers = () => {
    setShowUsers(true);
  };

  const onSubmit = (values) => {
    let payload = _.clone(values);

    const errorValues = [null, 'Select one (Yes/No)'];
    if (errorValues.includes(payload.allUsersOption)) {
      setError({
        ...error,
        title: GENERATE_PROMO_CODE_CONST.ERROR_MSG,
        desc: GENERATE_PROMO_CODE_CONST.SELECT_OPTION_ERROR_MSG,
        showError: true,
      });
      return;
    }
    if (payload.allUsersOption === 'No' && selectedUsers.length === 0) {
      setError({
        ...error,
        title: GENERATE_PROMO_CODE_CONST.ERROR_MSG,
        desc: GENERATE_PROMO_CODE_CONST.CHOOSE_ONE_USER_ERROR_MSG,
        showError: true,
      });
      return;
    }

    if (values.allUsersOption === 'Yes') {
      payload = {...payload, allUsers: true};
    } else {
      payload = {...payload, allUsers: false};
    }

    payload['userDetails'] = _.clone(selectedUsers);
    payload['selectedUsers'] = selectedUsers.map((detail) => detail.userId);

    const {allUsersOption, ...data} = payload;

    const modifiedPayload = {
      ...data,
      discountPercentage: Number(data.discountPercentage),
      maxDiscount: Number(data.maxDiscount),
    };

    console.log(modifiedPayload);

    if (toBeEditedData) {
      validateEditedPromo(modifiedPayload).then((res) =>
        succHandler(res, modifiedPayload)
      );
      return;
    }
    validatePromoCode(modifiedPayload).then((res) =>
      succHandler(res, modifiedPayload)
    );
  };

  const succHandler = (res, modifiedPayload) => {
    if (res.status === 200) {
      if (res.data.isValid) {
        setReviewPromoCodeData(modifiedPayload);
      } else {
        setError({
          title: 'Error',
          desc: res.data.message,
          showError: true,
        });
      }
    }
  };

  const confirmSelection = (updatedUsersList) => {
    setSelectedUsers(updatedUsersList);
    setShowUsers(false);
  };

  const removeUser = (detail) => {
    const users = _.clone(selectedUsers);
    const index = users.findIndex((u) => u.userId === detail.userId);
    users.splice(index, 1);
    setSelectedUsers(users);
  };

  const closeReview = () => {
    setReviewPromoCodeData(null);
  };

  return (
    <>
      {showReviewPromoCode && (
        <ReviewPromoCode
          promoCode={showReviewPromoCode}
          {...{closeReview, changeActiveTab}}
          isEdited={toBeEditedData}
        />
      )}

      {showUsers && (
        <UserSelectComponent
          {...{setShowUsers, confirmSelection}}
          alreadySelectedUsers={selectedUsers}
          appliedUsers={toBeEditedData ? toBeEditedData.appliedUsers : []}
        />
      )}
      <div
        className={styles.genPromoFormContainer}
      >
        <Form
          {...{onSubmit, initialValues}}
          render={({
            handleSubmit,
            submitting,
            pristine,
            form,
            touched,
            values,
            errors,
            valid,
          }) => (
            <form className="mt-5" onSubmit={handleSubmit}>
              {console.log(values, errors)}
              <div className="row">
                <div className="col-lg-6">
                  <Field
                    bold
                    name="codeName"
                    type="text"
                    component={InputRenderField}
                    disabled={toBeEditedData}
                    label={GENERATE_PROMO_CODE_CONST.PROMO_CODE_NAME}
                    placeholder={GENERATE_PROMO_CODE_CONST.PROMO_CODE_NAME_PLACEHOLDER}
                    validate={composeValidators(
                      isSpecialCharacters,
                      required,
                      maxLength(7),
                      minLength(3),
                      isNotANumber
                    )}
                  />
                </div>
                <div className="col-lg-6">
                  <Field
                    bold
                    name="discountPercentage"
                    type="number"
                    component={InputRenderField}
                    label={GENERATE_PROMO_CODE_CONST.DISCOUNT_IN_PERCENTAGE}
                    placeholder={GENERATE_PROMO_CODE_CONST.DISCOUNT_IN_PERCENTAGE_PLACEHOLDER}
                    validate={composeValidators(
                      required,
                      minValue(1),
                      maxValue(100),
                      isNotDecimal
                    )}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6">
                  <Field
                    bold
                    name="maxDiscount"
                    type="number"
                    component={InputRenderField}
                    label={`${GENERATE_PROMO_CODE_CONST.MAX_DISCOUNT_IN} ${getCountryPoint(true)}`}
                    placeholder={GENERATE_PROMO_CODE_CONST.MAX_DISCOUNT_IN_PLACEHOLDER}
                    validate={composeValidators(
                      isNotDecimal,
                      // minValue(1),
                      maxValue(240)
                    )}
                  />
                </div>
                <div className="col-lg-6">
                  <Field
                    bold
                    name="notes"
                    type="text"
                    component={InputRenderField}
                    label={GENERATE_PROMO_CODE_CONST.NOTE_FOR_ADMIN}
                    placeholder={GENERATE_PROMO_CODE_CONST.NOTE_FOR_ADMIN_PLACEHOLDER}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6">
                  <Field
                    bold
                    name="validFrom"
                    type="text"
                    component={CalendarField}
                    className={styles.genCalenderTextFieldStyle}
                    label={`${ALL_PROMO_CODE_CONST.VALID_FROM} *`}
                    placeholder={GENERATE_PROMO_CODE_CONST.DATE_PLACEHOLDER}
                  />
                </div>
                <div className="col-lg-6">
                  <Field
                    bold
                    name="validTo"
                    type="text"
                    component={CalendarField}
                    className={styles.genCalenderTextFieldStyle}
                    label={`${ALL_PROMO_CODE_CONST.VALID_TO} *`}
                    placeholder={GENERATE_PROMO_CODE_CONST.DATE_PLACEHOLDER}
                    validate={isDateInvalid}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 pb-3">
                  <Field
                    bold
                    name="codeType"
                    validate={(value) => {
                      return value === 'Choose one' || value === ''
                        ?COMMON_CONST.REQUIRED_ERROR_MSG
                        : undefined;
                    }}
                    component={SelectRenderField}
                    label={`${ALL_PROMO_CODE_CONST.TYPE} (${GENERATE_PROMO_CODE_CONST.BIRTHDAY}, ${GENERATE_PROMO_CODE_CONST.HOLIDAY}, ${GENERATE_PROMO_CODE_CONST.FEEL_GOOD}, ${GENERATE_PROMO_CODE_CONST.CUSTOM})*`}
                    options={(() => [
                      'Choose one',
                      'Birthday',
                      'Holiday',
                      'Feel-Good',
                      'Custom',
                    ])()}
                    onChange={(e) => {
                      form.change(
                        'codeType',
                        e.target.value === 'Choose one' ? '' : e.target.value
                      );
                    }}
                  />
                  {touched['codeType'] && errors['codeType'] && (
                    <span className="error-text">{errors['codeType']}</span>
                  )}
                </div>
              </div>

              <div className="row">
                {values?.codeType === 'Custom' && (
                  <div className="col-lg-6">
                    <Field
                      bold
                      name="title"
                      type="text"
                      component={InputRenderField}
                      label={GENERATE_PROMO_CODE_CONST.CUSTOM_HEADLINE}
                      placeholder={GENERATE_PROMO_CODE_CONST.CUSTOM_HEADLINE_PLACEHOLDER}
                      // validate={maxLength(30)}
                      validate={composeValidators(
                        isSpecialCharacters,
                        required,
                        maxLength(30),
                      )}
                    />
                  </div>
                )}

                {values?.codeType === 'Custom' && (
                  <div className={'col-lg-6 bt'}>
                    <Field
                      bold
                      name="codeImage"
                      component={ImageUpload}
                      label={GENERATE_PROMO_CODE_CONST.CUSTOM_UPLOAD_IMAGE_LABEL}
                      accept="image/*"
                      header={GENERATE_PROMO_CODE_CONST.CUSTOM_UPLOAD_IMAGE_HEADER}
                      parse={(value) => parseBase64(value, form, 'codeImage')}
                      defaultImage={initialValues && initialValues.codeImage}
                      validate={required}
                    />
                  </div>
                )}
              </div>

              <div className="row">
                <div className="col-lg-6">
                  <Field
                    bold
                    name="description"
                    type="text"
                    component={TextAreaRenderField}
                    label={GENERATE_PROMO_CODE_CONST.CUSTOM_DECRIPTION_LABEL}
                    placeholder={GENERATE_PROMO_CODE_CONST.CUSTOM_DECRIPTION_PLACEHOLDER}
                    disabled={[
                      'Birthday',
                      'Holiday',
                      'Feel-Good',
                      '',
                      undefined,
                    ].includes(values?.codeType)}
                    validate={maxLength(95)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-3">
                  <Field
                    bold
                    name="allUsersOption"
                    component={SelectRenderField}
                    label={GENERATE_PROMO_CODE_CONST.APPLY_TO_ALL_USERS}
                    options={(() => ['Select one (Yes/No)', 'Yes', 'No'])()}
                    onChange={(e) => {
                      if (
                        e.target.value === 'Yes' ||
                        e.target.value === 'Select one (Yes/No)'
                      ) {
                        setSelectedUsers([]);
                      }
                      form.change(
                        'allUsersOption',
                        e.target.value === 'Select one (Yes/No)'
                          ? null
                          : e.target.value
                      );
                    }}
                    // validate={(value) => {
                    //   if (!value) {
                    //     return 'Required';
                    //   }
                    //   if (
                    //     value === 'Select one (Yes/No)' ||
                    //     value === '' ||
                    //     value === null
                    //   ) {
                    //     return 'Required';
                    //   }
                    //   if (value === 'No' && selectedUsers.length === 0) {
                    //     return 'Add users';
                    //   }
                    //   return undefined;
                    // }}
                  />
                  {/* {touched['allUsersOption'] && errors['allUsersOption'] && (
                    <span className="error-text">
                      {errors['allUsersOption']}
                    </span>
                  )} */}
                </div>
              </div>

              <div className="row">
                <div className="col-lg-3">
                  <button
                    disabled={values.allUsersOption !== 'No'}
                    type="button"
                    className="btn btn-dark btn-pill d-block mt-4"
                    onClick={onChooseUsers}
                  >
                    {GENERATE_PROMO_CODE_CONST.CHOOSE_USERS}
                  </button>
                </div>
              </div>

              {selectedUsers && (
                <div
                  className={`row ${styles.genPromoSelectUserContainer} `}
                >
                  <div className="col-lg-4">
                    {selectedUsers.map((detail) => (
                      <div
                        className={`d-flex align-items-center justify-content-between ${styles.genPromoSelectImgContainer}`}
                        key={detail.userId}
                      >
                        <div className="d-flex">
                          <div
                           className={styles.genPromoSelectImgStyle}
                          >
                            {detail?.picture && (
                              <img
                                className={styles.genPromoSelectChildImgStyle}
                                src={detail?.picture}
                              />
                            )}
                          </div>
                          <div
                            className={`d-flex align-items-center ${styles.genPromoSelectNameContainer}`}
                          >
                            <p
                              className={styles.genPromoSelectNameText}
                            >
                              {`${detail.name} ${detail.surname}`}
                            </p>
                          </div>
                        </div>
                        <div
                          className={styles.genPromoSelectRemoveIconStyle}
                        >
                          <Icon_cancel onClick={() => removeUser(detail)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {UtilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.PROMO_CREATE) && 
              <div
                className={`row ${styles.genPromoSaveButtonStyle}`}
              >
                <div className="col-lg-3">
                  <button
                    disabled={!valid}
                    type="submit"
                    className="btn btn-primary btn-pill d-block"
                  >
                    {GENERATE_PROMO_CODE_CONST.SAVE_AND_APPLY}
                  </button>
                </div>
              </div>
              }
            </form>
          )}
        />
      </div>

      <Dialog
        className={`len-dialog error-dialog ${styles.genPromoErrDialogContainer}`}
        closable
        header={error.title}
        footer={
          <button
            type="button"
            className="btn btn-dark btn-pill"
            onClick={() =>
              setError({
                title: '',
                desc: '',
                showError: false,
              })
            }
          >
            {COMMON_CONST.OKAY}
          </button>
        }
        visible={error.showError}
        modal={true}
        onHide={() =>
          setError({
            title: '',
            desc: '',
            showError: false,
          })
        }
      >
        <p>{error.desc}</p>
      </Dialog>
    </>
  );
};

const ReviewPromoCode = ({
  promoCode,
  closeReview,
  changeActiveTab,
  isEdited,
}) => {
  const save = () => {
    if (isEdited) {
      updateEditedPromo(promoCode).then(successCallback);
      return;
    }
    createPromoCode(promoCode).then(successCallback);
  };

  const successCallback = (res) => {
    if (res.status === 200) {
      closeReview();
      changeActiveTab(tabNames.all);
    }
  };

  return (
    <Dialog
      className={`len-dialog review-dialog ${promoCode.allUsers ? styles.genPromoErrDialogContainer : styles.genPromoReviewDialogStyle}`}
      closable={false}
      closeOnEscape
      visible={true}
      onHide={closeReview}
    >
      <div className="d-flex pt-5">
        <div className={`d-flex justify-content-center ${styles.genPromoReviewDialogContainer}`}>
          <div>
            <div>
              <h1
                className={styles.genPromoReviewDialogHeaderStyle}
              >
                {GENERATE_PROMO_CODE_CONST.REVIEW_THE_PROMO_CODE}
              </h1>
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <div
                className={styles.genPromoReviewTicketContainer}
              >
                <img src={require('../../../../assets/img/ticket.png')} />
                <p
                  className={styles.genPromoReviewTicketPercentStyle}
                >
                  {`${promoCode?.discountPercentage}%`}
                </p>
                <p
                  className={styles.genPromoReviewTicketNameStyle}
                >
                  {promoCode.codeName}
                </p>
              </div>
            </div>
            <div className={`d-flex ${styles.genPromoReviewValidContainer}`}>
              <div className={`d-flex flex-column ${styles.genPromoReviewDialogContainer}`}>
                <p
                  className={styles.genPromoReviewValidFromStyle}
                >
                  {ALL_PROMO_CODE_CONST.VALID_FROM}
                </p>
                <p
                  className={styles.genPromoReviewValidFromValueStyle}
                >
                  {dayjs(promoCode.validFrom).format('DD.MM.YY')}
                </p>
              </div>
              <div className={`d-flex flex-column ${styles.genPromoReviewDialogContainer}`}>
                <p
                  className={styles.genPromoReviewValidFromStyle}
                >
                  {ALL_PROMO_CODE_CONST.VALID_TO}
                </p>
                <p
                  className={styles.genPromoReviewValidFromValueStyle}
                >
                  {dayjs(promoCode.validTo).format('DD.MM.YY')}
                </p>
              </div>
            </div>
            <div className="d-flex ">
              <div className={`d-flex flex-column ${styles.genPromoReviewDialogContainer}`} >
                <p
                  className={styles.genPromoReviewValidFromStyle}
                >
                  {ALL_PROMO_CODE_CONST.TYPE}
                </p>
                <p
                  className={styles.genPromoReviewValidFromValueStyle}
                >
                  {promoCode.codeType}
                </p>
              </div>
              <div className={`d-flex flex-column ${styles.genPromoReviewDialogContainer}`}>
                <p
                  className={styles.genPromoReviewValidFromStyle}
                >
                  {GENERATE_PROMO_CODE_CONST.APPLIES_TO_ALL}
                </p>
                <p
                  className={styles.genPromoReviewValidFromValueStyle}
                >
                  {promoCode.allUsers ? COMMON_CONST.YES : COMMON_CONST.NO}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!promoCode.allUsers && (
          <div className={`d-flex ${styles.genPromoReviewDialogContainer}`}>
            <span
              className={styles.genPromoReviewSeparateStyle}
            ></span>
            <div className={`d-flex justify-content-center ${styles.genPromoReviewDialogContainer}`} >
              <div>
                <div className="d-flex align-items-center flex-column">
                  <h1
                    className={styles.genPromoReviewApplyHeaderStyle}
                  >
                    {GENERATE_PROMO_CODE_CONST.CODE_APPLIED_TO}
                  </h1>
                  <h4
                    className={styles.genPromoReviewApplySubHeaderStyle}
                  >
                    {GENERATE_PROMO_CODE_CONST.SCROLL_TO_SEE_EVERONE}
                  </h4>
                </div>

                <div
                  className={`mt-5 ${styles.genPromoReviewApplyUserStyle}`}
                >
                  {promoCode.userDetails.map((detail) => (
                    <div
                      className={`d-flex align-items-center justify-content-between ${styles.genPromoSelectImgContainer}`}
                      key={detail.userId}
                    >
                      <div className="d-flex">
                        <img
                          className={styles.genPromoSelectChildImgStyle}
                          src={
                            detail.picture
                            // 'https://png.pngtree.com/png-vector/20190704/ourmid/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg'
                          }
                        />
                        <div
                          className={`d-flex align-items-center ${styles.genPromoSelectNameContainer}`}
                        >
                          <p
                            className={styles.genPromoSelectNameText}
                          >
                            {`${detail.name} ${detail.surname}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={classNames(
          'd-flex justify-content-center pt-5',
          promoCode.allUsers ? 'pb-5' : ''
        )}
      >
        <button
          type="button"
          className="btn btn-primary btn-pill"
          onClick={save}
        >
          {GENERATE_PROMO_CODE_CONST.SAVE_AND_CREATE}
        </button>
        <div className="pl-4">
          <button
            type="button"
            className="btn btn-dark btn-pill"
            onClick={closeReview}
          >
            {COMMON_CONST.CANCEL}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

const isNotDecimal = (value) => {
  if (value && value.toString()?.trim() !== '') {
    return value % 1 === 0 ? undefined :GENERATE_PROMO_CODE_CONST.DECIMAL_ERROR_MSG;
  }
  return undefined;
};
const required = (value) => (value ? undefined : COMMON_CONST.REQUIRED_ERROR_MSG);
const isSpecialCharacters = (value) =>
  /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)
    ? GENERATE_PROMO_CODE_CONST.SPECIAL_CHARACTER_ERROR_MSG
    : undefined;
const mustBeNumber = (value) => (isNaN(value) ? 'Must be a number' : undefined);
const isNotANumber = (value) =>
  isNaN(value) ? undefined : GENERATE_PROMO_CODE_CONST.ALPHABETIC_OR_NUMERIC_ERROR_MSG;

const minValue = (min) => (value) => {
  if (value === '') {
    return undefined;
  }
  return isNaN(value) || Number(value) >= min
    ? undefined
    : `${GENERATE_PROMO_CODE_CONST.GREATER_THAN_ERROR_MSG} ${min}`;
};

const maxValue = (max) => (value) => {
  if (value === '') {
    return undefined;
  }
  return isNaN(value) || value <= max
    ? undefined
    : `${GENERATE_PROMO_CODE_CONST.LESS_THAN_ERROR_MSG} ${max}`;
};

const maxLength = (max) => (value) => {
  if (value) {
    return value && value.trim().length <= max
      ? undefined
      : `${GENERATE_PROMO_CODE_CONST.MAX_CHARACTER_ERROR_MSG} ${max}`;
  }
};

const minLength = (min) => (value) => {
  if (value) {
    return value && value.trim().length >= min
      ? undefined
      : `${GENERATE_PROMO_CODE_CONST.MIN_CHARACTER_ERROR_MSG} ${min}`;
  }
};

const isDateInvalid = (value, allValues) =>
  dayjs(value).isBefore(dayjs(allValues.validFrom))
    ? GENERATE_PROMO_CODE_CONST.TO_DATE_ERROR_MSG
    : undefined;

const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined
    );

const CalendarField = ({
  input,
  label,
  type,
  className,
  placeholder,
  inputChange,
  meta: {touched, error},
}) => {
  const inputProp = {
    ...input,
    placeholder,
    type,
    onChange: (e) => {
      input.onChange(new Date(e.value).getTime());
      inputChange && inputChange(new Date(e.value).getTime());
    },
  };

  return (
    <div>
      <label>{label}</label>
      <div className="p-field mb-4">
        <Calendar
          {...inputProp}
          value={new Date(input.value)}
          className="d-flex"
          inputClassName={`form-control ${className ? className : ''}`}
          monthNavigator
          yearNavigator
          yearRange={`${new Date().getFullYear()}:2030`}
          minDate={new Date()}
          readOnlyInput={true}
        />
        {touched && error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
};

const UserSelectComponent = ({
  setShowUsers,
  alreadySelectedUsers,
  // selectedUsers,
  // setSelectedUsers,
  confirmSelection,
  appliedUsers,
}) => {
  let dt = useRef();
  const limit = useRef(20).current;

  const [pages, setPages] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [first, setFirst] = useState(0);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [prevIds, setPrevIds] = useState([]);
  const [pagination, setPagination] = useState({
    pages: [],
    count: 0,
  });

  const [selectedUsers, setSelectedUsers] = useState([...alreadySelectedUsers]);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => onLoad(lastEvaluatedKey), []);

  const onLoad = (key) => {
    dispatch(showLoader());
    doGetData(key, (res) => {
      let length = Math.ceil(res.data.users.length / limit);
      const _pagination = {
        pages: [],
        count: res.data.activeUsersCount,
      };
      for (let i = 1; i <= length; i++) {
        _pagination.pages.push({
          page: i,
          displayPage: i,
          active: i === 1 ? true : false,
        });
        dispatch(hideLoader());
      }

      const pIds = [...prevIds];
      pIds.push(res.data.lastEvaluatedKey);

      setLastEvaluatedKey(res.data.lastEvaluatedKey);
      setPrevIds(pIds);
      setPagination(_pagination);
      setData(res.data.users);
    });
  };

  const doGetData = (key, callback) => {
    getAllAccountsListCase({
      payload: {
        lastEvaluatedKey: key,
      },
    }).then((res) => {
      if (res.status === 200) {
        callback(res);
      }
    });
  };

  const onPageAllAccounts = (event) => {
    if (event.first > first) {
      doGetData(lastEvaluatedKey, (res) => {
        const ids = [...prevIds];
        ids[event.page] = lastEvaluatedKey;

        let count = Math.ceil(res.data.users.length / limit);
        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          const afterAdd = page.displayPage + count;
          page.active = index === 0 ? true : false;
          page.displayPage = afterAdd;
          page.disabled =
            index + 1 > Math.ceil(res.data.users.length / limit) ? true : false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res?.data?.users);
        setLastEvaluatedKey(res?.data?.lastEvaluatedKey);
        setPrevIds(_.clone(ids));
      });
    }
    if (event.first < first) {
      doGetData(prevIds[event.page], (res) => {
        const ids = [...prevIds];
        ids.splice(event.page + 1);

        let count = Math.ceil(res.data.users.length / limit);
        let _pagination = _.clone(pagination);
        _pagination['pages'] = _pagination.pages.map((page, index) => {
          page.active = index === 0 ? true : false;
          page.displayPage = page.displayPage - count;
          page.disabled = false;
          return page;
        });

        setPagination(_pagination);
        setFirst(event.first);
        setData(res.data.users);
        setLastEvaluatedKey(res?.data?.lastEvaluatedKey);
        setPrevIds(_.clone(ids));
      });
    }
  };

  const onPageChange = (page, index) => {
    dt.current.state.first = (page.page - 1) * limit;

    const _pages = [...pagination.pages];

    const __pages = _pages.map((pagee, index1) => {
      pagee['active'] = index === index1 ? true : false;
      return pagee;
    });

    setPagination({...pagination, pages: __pages});
  };

  const onPreviousPage = () => {
    const event = {
      first: first - limit,
      page: pages - 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAllAccounts(event);
  };

  const onNextPage = () => {
    const event = {
      first: first + limit,
      page: pages + 1,
    };

    setPages(event.page);
    dt.current.state.first = 0;

    onPageAllAccounts(event);
  };

  const paginatorLeft = (
    <button
      disabled={pagination.pages[0]?.displayPage === 1 ? true : false}
      className="btn btn-dark btn-pill mr-4"
      onClick={onPreviousPage}
    >
      {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
    </button>
  );

  const paginatorRight = (
    <button
      disabled={!lastEvaluatedKey}
      className="btn btn-dark btn-pill ml-4"
      onClick={onNextPage}
    >
      {COMMON_CONST.NEXT_PAGE_BUTTON}
    </button>
  );

  const search = (searchWord) => {
    setSearchValue(searchWord);

    let payload = {
      search: searchWord,
      status: 'all',
    };

    dt.current.state.first = 0;
    if (searchWord.trim() !== '') {
      searchUsersCase(payload).then((res) => {
        dt.current.state.rows = res.data.length;
        setData(res.data);
      });
    } else {
      dt.current.state.rows = limit;
      onLoad(null);
    }
  };

  const onUserSelect = (user) => {
    const selctdUsers = [...selectedUsers];
    const index = selectedUsers.findIndex((u) => u.userId === user.id);

    if (index === -1) {
      if (appliedUsers.includes(user.id)) {
        alert(GENERATE_PROMO_CODE_CONST.PROMO_ALREADY_APPLIED_USER);
        return;
      }
      selctdUsers.push({
        userId: user.id,
        name: user.profile.name,
        surname: user.profile.surname,
        picture: user.profile?.picture,
      });
    } else {
      selctdUsers.splice(index, 1);
    }

    setSelectedUsers(selctdUsers);
  };

  return (
    <Dialog
      className={`len-dialog ${styles.genPromoSelectUserWrapper}`}
      closable
      closeOnEscape
      header={<h1>{GENERATE_PROMO_CODE_CONST.SELECT_USERS}</h1>}
      footer={
        <>
          <nav aria-label="..." className="mr-auto pt-2">
            <ul className={classNames('pagination', styles.moveRight)}>
              {searchValue === '' && (
                <>
                  {paginatorLeft}
                  {pagination.pages?.map((page, index) => {
                    let classes = classNames('page-link', styles.pageNumbers);
                    if (page.active)
                      classes = classNames(
                        'page-link',
                        styles.pageNumbers,
                        styles.activeGreen
                      );
                    if (page.disabled)
                      classes = classNames(
                        'page-link',
                        styles.pageNumbers,
                        styles.pageDisabled
                      );
                    return (
                      <li
                        key={page.page}
                        className={`page-item mr-3 ${
                          page.active && classNames(styles.activeGreen)
                        }`}
                      >
                        <span
                          className={classes}
                          onClick={(e) =>
                            !page?.disabled && onPageChange(page, index)
                          }
                        >
                          {page.displayPage}
                        </span>
                      </li>
                    );
                  })}
                  {paginatorRight}
                </>
              )}
            </ul>
          </nav>
          <div className="d-flex justify-content-center pt-5">
            <button
              type="button"
              className="btn btn-primary btn-pill"
              disabled={selectedUsers.length === 0}
              onClick={() => confirmSelection(selectedUsers)}
            >
              {GENERATE_PROMO_CODE_CONST.CONFIRM_SELECTION}
            </button>
            <button
              type="button"
              className="btn btn-dark btn-pill"
              onClick={() => setShowUsers(false)}
            >
              {COMMON_CONST.CANCEL}
            </button>
          </div>
        </>
      }
      visible={true}
      modal={true}
      onHide={() => setShowUsers(false)}
    >
      <div className="d-flex flex-column">
        <Search {...{searchValue, search}} tabName = {PROMO_CODES_CONST.TAB_NAME_GENERATE}/>

        <div className="len-datatable generateTable">
          <DataTable
            value={data}
            emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
            scrollHeight="200px"
            scrollable={true}
            className={`mt-4 ${styles.genPromoSelectUserTableStyle}`}
            responsive
            paginator
            // rows={20}
            rows={searchValue === '' ? limit : data.length}
            paginatorTemplate=""
            // totalRecords={data.length}
            totalRecords={data.length}
            selectionMode="single"
            dataKey="id"
            sortOrder={1}
            ref={dt}
          >
          <Column
              header=""
              headerClassName={styles.allAccountProfileHeaderStyle}
              body={(rowData) => {
                return (
                  <>
                    {rowData.profile?.picture && (
                      <img
                        className={styles.allAccountProfileImgStyle}
                        src={rowData.profile.picture}
                      />
                    )}
                  </>
                );
              }}
            />
            <Column
              sortable
              header={COMMON_CONST.NAME}
              headerClassName={styles.allAccountHeaderStyle}
              className={styles.allAccountNameStyle}
              field="profile.name"
              body={(rowData) => {
                return (
                  <div className={styles.pPoppins}>
                    {rowData?.profile?.name?.length >
                      COMMON_CONST.DATA_VISIBILITY_TOOLTIP ||
                    rowData?.profile?.surname?.length >
                      COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                      <>
                        <p
                          className={"text-truncate mb-0 text-center"}
                          title={`${rowData?.profile?.name} ${rowData?.profile?.surname}`}
                        >
                          {rowData.profile && rowData.profile.name + "  "}
                        </p>
                        <p
                          className={"text-truncate mb-0 mt-8 text-center"}
                          title={`${rowData?.profile?.name} ${rowData?.profile?.surname}`}
                        >
                          {rowData.profile && rowData.profile.surname}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className={"text-truncate mb-0 text-center"}>
                          {rowData.profile && rowData.profile.name + "  "}
                        </p>
                        <p className={"text-truncate mb-0 mt-8 text-center"}>
                          {rowData.profile && rowData.profile.surname}
                        </p>
                      </>
                    )}
                  </div>
                );
              }}
            />
            <Column
              field="profile.email"
              header={COMMON_CONST.CONTACTS}
              headerClassName={styles.genPromoSelectUserNameHeaderStyle}
              className={styles.genPromoSelectUserNameColumnStyle}
              body={(rowData) => (
                <div className="d-flex flex-column">
                  {rowData?.profile?.email.length >
                  COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? (
                    <>
                      <p className="mb-0" title={rowData.profile?.phoneNumber}>
                        {rowData.profile?.phoneNumber}
                      </p>
                      <p
                        className="mb-0 text-truncate"
                        title={rowData.profile?.email}
                      >
                        {rowData.profile?.email}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-0">{rowData.profile?.phoneNumber}</p>
                      <p className="mb-0 text-truncate">
                        {rowData.profile?.email}
                      </p>
                    </>
                  )}
                </div>
              )}
            />
            <Column
              field="profile.dob"
              header={GENERATE_PROMO_CODE_CONST.DATE_OF_BIRTH}
              headerClassName={styles.genPromoSelectUserNameHeaderStyle}
              className={styles.genPromoSelectUserNameColumnStyle}
              body={(rowData) => {
                if (rowData?.profile?.dob) {
                  return rowData?.profile?.dob.replaceAll('-', '.');
                }
                return '';
              }}
            />
            <Column
              field="registeredOn"
              header={GENERATE_PROMO_CODE_CONST.ACCOUNT_CREATION}
              headerClassName={styles.genPromoSelectUserNameHeaderStyle}
              className={styles.genPromoSelectUserNameColumnStyle}
              body={(rowData) =>
                `${dayjs(rowData.registeredOn).format('DD.MM.YYYY')}`
              }
            />
            <Column
              field="trustScore"
              header={COMMON_CONST.TRUSTSCORE}
              headerClassName={styles.genPromoSelectUserNameHeaderStyle}
              className={styles.genPromoSelectUserNameColumnStyle}
            />
            <Column
              header={GENERATE_PROMO_CODE_CONST.SELECT_USER}
              headerClassName={styles.genPromoSelectUserNameHeaderStyle}
              className={styles.getPromoSelectUserConfirmIconStyle}
              body={(rowData) => {
                const index = selectedUsers.findIndex(
                  (u) => u.userId === rowData.id
                );
                return (
                  <Icon_checked
                    onClick={() => onUserSelect(rowData)}
                    className={classNames(index === -1 ? styles.unchecked : '')}
                  />
                );
              }}
            />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
};

export default GeneratePromoCodes;

import React, { useEffect, useState, useRef } from "react";
import {
  GENERATE_PROMO_CODE_CONST,
  COMMON_CONST,
  USER_MANAGE_FORM_CONST,
} from "app/common/constants/constant";
import classNames from "classnames";
import { Dialog } from "primereact/dialog";
import * as _ from "underscore";
import styles from "../userManage.module.scss";
import {
  InputRenderField,
  SelectRenderField,
  TextAreaRenderField,
} from "app/common/components/widgets/common";
import dayjs from "dayjs";
import { Calendar } from "primereact/calendar";
import { Field, Form } from "react-final-form";
import CalenderLogo from "assets/img/calender.png";
import codes from "../../../../../assets/countryCodes/codes.json";
import OtpDialog from "./otpDialog.component";
import {
  generateOtp,
  createNewAdminUser,
  editUserManageData,
} from "app/common/api/userManage.api";
import OtpConfirmDialog from "./otpConfirmDialog.component";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

function UserFormDialog(props) {
  const {
    onHide,
    visible,
    editAction,
    selectedToEditData,
    actionType,
    setFormModal,
    setEditAction,
    onLoad,
  } = props;
  const [initialValues, setInitialValues] = useState({});
  const [otpDialogShow, setOtpDialogShow] = useState(false);
  const calenderfocus = useRef();

  const [otpConfirmShow, setOtpConfirmShow] = useState(false);
  const [otpFailureShow, setOtpFailureShow] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [date, setDate] = useState(0);

  useEffect(() => {
    editAction && setDate(selectedToEditData.dob);
    const dateCheck = selectedToEditData?.dob
      ? selectedToEditData?.dob
      : new Date(dayjs().subtract(18, "year"));
    setInitialValues(
      editAction
        ? {
            ...initialValues,
            name: selectedToEditData?.fname,
            surname: selectedToEditData?.lname,
            email: selectedToEditData?.uname,
            id: selectedToEditData?.id,
            role: selectedToEditData?.role,
            notes: selectedToEditData?.notes,
            dob: dateCheck,
            countryCode: selectedToEditData?.countryCode,
            phoneNumber: parseInt(selectedToEditData?.phoneNumber, 0),
          }
        : {
            name: "",
            surname: "",
            phoneNumber: null,
            notes: "",
            dob: new Date(dayjs().subtract(18, "year")),
            email: "",
            role: "",
            countryCode: "+1",
          }
    );
  }, [editAction]);

  const onSubmit = (values) => {
    onHide();
    let payload = _.clone(values);
    const { phoneNumber, countryCode, dob } = payload;
    let addPhoneData = countryCode?.concat(phoneNumber);
    let dateString = dayjs(dob).format("DD-MM-YYYY");
    payload = { ...payload, phoneNumber: addPhoneData, dob: dateString };
    setSelectedData({ ...selectedData, ...payload });
    setDate(0);

    generateOtp().then((res) => {
      if (res.status === 200) {
        setOtpDialogShow(true);
      }
    });
  };

  const resetOtp = () => {
    generateOtp().then((res) => {
      if (res.status === 200) {
        setOtpDialogShow(true);
      }
    });
  };

  const isNotDecimal = (value) => {
    if (value && value.toString()?.trim() !== "") {
      return value % 1 === 0
        ? undefined
        : GENERATE_PROMO_CODE_CONST.DECIMAL_ERROR_MSG;
    }
    return undefined;
  };
  const required = (value) =>
    value && value?.toString()?.trim()
      ? undefined
      : COMMON_CONST.REQUIRED_ERROR_MSG;

  const ageValid = (value) => {
    let today = new Date();
    let birthDate = new Date(value);
    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age < 18 ? "Age should be above 18" : undefined;
  };

  const maxLength = (max) => (value) => {
    if (value) {
      return value && value?.toString()?.trim().length <= max
        ? undefined
        : `${GENERATE_PROMO_CODE_CONST.MAX_CHARACTER_ERROR_MSG} ${max}`;
    }
  };

  const minLength = (min) => (value) => {
    if (value) {
      return value && value?.toString()?.trim().length >= min
        ? undefined
        : `${GENERATE_PROMO_CODE_CONST.MIN_CHARACTER_ERROR_MSG} ${min}`;
    }
  };

  const email = (value) =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
      ? COMMON_CONST.EMAIL_ERR_MSG
      : undefined;

  const composeValidators =
    (...validators) =>
    (value) =>
      validators.reduce(
        (error, validator) => error || validator(value),
        undefined
      );

  const onHideOTP = () => {
    setOtpDialogShow(false);
  };

  const onHideConfirmModal = () => {
    onHideOTP();
    setOtpConfirmShow(false);
    setOtpFailureShow(false);
    onLoad();
  };

  const onOtpDataSubmit = (values) => {
    const modifiedPayload = {
      ...selectedData,
      ...values,
    };
    onHideOTP();
    createNewAdminUser(modifiedPayload).then((res) => {
      if (res.status === 200) {
        setOtpConfirmShow(true);
      } else {
        setOtpFailureShow(true);
      }
    });
  };

  const onOtpEditSubmit = (values) => {
    setEditAction(false);
    const modifiedPayload = {
      ...selectedData,
      ...values,
    };

    onHideOTP();
    editUserManageData(modifiedPayload).then((res) => {
      if (res.status === 200) {
        setOtpConfirmShow(true);
      } else {
        setOtpFailureShow(true);
      }
    });
  };

  const footerTmpl = (
    <div className="text-left">
      <button className="btn btn-primary btn-pill" onClick={onHideConfirmModal}>
        {COMMON_CONST.OKAY}
      </button>
    </div>
  );

  const selectOption = [
    COMMON_CONST.SELECT,
    USER_MANAGE_FORM_CONST.SUPER_ADMIN,
    USER_MANAGE_FORM_CONST.L1_ADMIN,
    USER_MANAGE_FORM_CONST.L2_ADMIN,
  ];

  editAction && selectOption.shift();

  const CalendarField = ({
    input,
    label,
    type,
    className,
    placeholder,
    inputChange,
    meta: { touched, error },
  }) => {
    const inputProp = {
      ...input,
      placeholder,
      type,
      autoFocus: true,
      onChange: (e) => {
        input.onChange(new Date(e.value).getTime());
        inputChange && inputChange(new Date(e.value).getTime());
        setDate(new Date(e.value).getTime());
      },
    };
    const calenderOnFocus = () => {
      calenderfocus.current.onInputFocus();
    };
    let dateValue = date
      ? new Date(date)
      : new Date(dayjs().subtract(18, "year"));

    return (
      <div>
        <label>{label}</label>
        <div className={`p-field mb-4 ${styles.userEditCalStyle}`}>
          <Calendar
            {...inputProp}
            ref={calenderfocus}
            value={dateValue}
            className="d-flex"
            inputClassName={`form-control ${className ? className : ""}`}
            monthNavigator
            yearNavigator
            yearRange={`1950:${new Date().getFullYear() - 18}`}
          />
          <div
            className={styles.userEditCalIconContainer}
            onClick={calenderOnFocus}
          >
            <img src={CalenderLogo} className={styles.userEditCalIconStyle} />
          </div>
          {touched && error && <span className="error-text">{error}</span>}
        </div>
      </div>
    );
  };
  return (
    <>
      <Dialog
        className={`len-dialog review-dialog ${styles.genPromoReviewDialogStyle}`}
        closable={false}
        closeOnEscape
        visible={visible}
        onHide={onHide}
      >
        <div className="pt-2">
          <div className={`${styles.genPromoReviewDialogContainer}`}>
            <div>
              <div>
                <h1 className={styles.genPromoReviewDialogHeaderStyle}>
                  {editAction
                    ? USER_MANAGE_FORM_CONST.ADMIN_USER_UPDATE
                    : USER_MANAGE_FORM_CONST.FORM_DIALOG_HEADER}
                </h1>
              </div>
              <div>
                <Form
                  {...{ onSubmit, initialValues }}
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
                      <div className="row">
                        <div className="col-lg-5">
                          <Field
                            bold
                            name="name"
                            type="text"
                            component={InputRenderField}
                            disabled={editAction}
                            label={`${COMMON_CONST.FIRST_NAME} *`}
                            placeholder={
                              USER_MANAGE_FORM_CONST.FIRST_NAME_PLACEHOLDER
                            }
                            validate={
                              !editAction && composeValidators(required)
                            }
                          />
                        </div>
                        <div className="col-lg-5">
                          <Field
                            bold
                            name="dob"
                            type="text"
                            component={CalendarField}
                            label={`${GENERATE_PROMO_CODE_CONST.DATE_OF_BIRTH} *`}
                            placeholder={USER_MANAGE_FORM_CONST.DOB_PLACEHOLDER}
                            validate={composeValidators(ageValid)}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-5">
                          <Field
                            bold
                            name="surname"
                            type="text"
                            component={InputRenderField}
                            disabled={editAction}
                            label={`${COMMON_CONST.LAST_NAME} *`}
                            placeholder={
                              USER_MANAGE_FORM_CONST.LAST_NAME_PLACEHOLDER
                            }
                            validate={
                              !editAction && composeValidators(required)
                            }
                          />
                        </div>
                        <div className="col-lg-5">
                          <Field
                            bold
                            name="role"
                            validate={(value) => {
                              return value === COMMON_CONST.SELECT ||
                                value === ""
                                ? COMMON_CONST.REQUIRED_ERROR_MSG
                                : undefined;
                            }}
                            component={SelectRenderField}
                            label={`${USER_MANAGE_FORM_CONST.ADMIN_ROLE} *`}
                            options={(() => selectOption)()}
                            onChange={(e) => {
                              form.change(
                                "role",
                                e.target.value === COMMON_CONST.SELECT
                                  ? ""
                                  : e.target.value
                              );
                            }}
                          />
                          {touched["role"] && errors["role"] && (
                            <span className="error-text">{errors["role"]}</span>
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-5">
                          <span className={styles.DialogPhoneColStyle}>
                            {COMMON_CONST.PHONE_NUMBER} *
                          </span>
                          <div className="row">
                            <div
                              className={`col-lg-4 pr-0 ${styles.userEditPhoneNumStyle}`}
                            >
                              <Field
                                bold
                                name="countryCode"
                                component={SelectRenderField}
                                options={(() => codes)()}
                                selectClassName={styles.userCountCodeStyle}
                                onChange={(e) => {
                                  form.change(
                                    "countryCode",
                                    e.target.value === COMMON_CONST.SELECT
                                      ? ""
                                      : e.target.value
                                  );
                                }}
                              />
                              {touched["countryCode"] &&
                                errors["countryCode"] && (
                                  <span className="error-text">
                                    {errors["countryCode"]}
                                  </span>
                                )}
                            </div>
                            <div
                              className={`col-lg-8 ${styles.userEditPhoneNumStyle}`}
                            >
                              <Field
                                bold
                                name="phoneNumber"
                                type="number"
                                component={InputRenderField}
                                placeholder={
                                  USER_MANAGE_FORM_CONST.PHONE_PLACEHOLDER
                                }
                                validate={composeValidators(
                                  required,
                                  maxLength(25),
                                  minLength(8),
                                  isNotDecimal
                                )}
                              />
                            </div>
                          </div>

                          <div>
                            <Field
                              bold
                              name="email"
                              type="text"
                              component={InputRenderField}
                              disabled={editAction}
                              label={`${COMMON_CONST.EMAIL_ID} *`}
                              placeholder={
                                USER_MANAGE_FORM_CONST.EMAIL_ID_PLACEHOLDER
                              }
                              validate={
                                !editAction &&
                                composeValidators(required, email)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-lg-7">
                          <Field
                            bold
                            name="notes"
                            type="text"
                            component={TextAreaRenderField}
                            label={COMMON_CONST.NOTES}
                            placeholder={
                              USER_MANAGE_FORM_CONST.NOTES_PLACEHOLDER
                            }
                            rows={6}
                          />
                        </div>
                      </div>
                      <div
                        className={classNames(
                          "d-flex justify-content-center py-2"
                        )}
                      >
                        <button
                          disabled={!valid}
                          type="submit"
                          className="btn btn-primary btn-pill"
                        >
                          {editAction
                            ? USER_MANAGE_FORM_CONST.SAVE_AND_UPDATE
                            : GENERATE_PROMO_CODE_CONST.SAVE_AND_CREATE}
                        </button>
                        <div className="pl-4">
                          <button
                            type="button"
                            className="btn btn-dark btn-pill"
                            onClick={() => {
                              onHide();
                            }}
                          >
                            {COMMON_CONST.CANCEL}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <OtpDialog
        {...{ otpDialogShow, onHideOTP }}
        onSubmit={actionType ? onOtpEditSubmit : onOtpDataSubmit}
        reSendOtp={resetOtp}
      />

      <OtpConfirmDialog
        otpConfirm={otpConfirmShow}
        onHide={onHideConfirmModal}
        header={COMMON_CONST.YAY}
        desc={
          !actionType
            ? `${USER_MANAGE_FORM_CONST.OTP_SUCCESS_SUB_TEXT_1}${selectedData?.name} ${selectedData?.surname}${USER_MANAGE_FORM_CONST.OTP_SUCCESS_SUB_TEXT_2}`
            : `${USER_MANAGE_FORM_CONST.SUCCESS_UPDATE_POPUP}${selectedData?.name} ${selectedData?.surname}`
        }
      />
      <OtpConfirmDialog
        otpConfirm={otpFailureShow}
        onHide={onHideConfirmModal}
        header={COMMON_CONST.OH_NO}
        desc={
          !actionType
            ? USER_MANAGE_FORM_CONST.OTP_FAILURE_SUB_TEXT
            : `${USER_MANAGE_FORM_CONST.FAILURE_UPDATE_POPUP_1}${selectedData?.name} ${selectedData?.surname}${USER_MANAGE_FORM_CONST.FAILURE_UPDATE_POPUP_2}`
        }
        buttonGray={true}
      />
    </>
  );
}

export default UserFormDialog;

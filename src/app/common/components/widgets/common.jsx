import RemoveImageDialog from "app/pages/secure/Content/views/removeDialog";
import { ReactComponent as Icon_upload_cancel } from "assets/icon/icon_upload_cancel.svg";
import LogoImgUrl from "assets/img/logo.png";
import classNames from "classnames";
import dayjs from "dayjs";
import { Calendar } from "primereact/calendar";
import PropTypes, { string } from "prop-types";
import React, { useEffect, useRef, useState } from "react";

const logoPropTypes = {
  src: string,
};

const logoDefaultProps = {
  src: LogoImgUrl,
};

export function epochToDate(value) {
  const formated = dayjs(value).format("DD-MM-YYYY");
  return formated;
}

export function epochToDateDay(value) {
  const formated = dayjs(value).format("dddd");
  return formated;
}

export function epochTime(value) {
  const formated = dayjs(value).format("HH:MM");
  return formated;
}

export function epochTimeAM_PM(value) {
  const formated = dayjs(value).format("hh:mm A");
  return formated;
}

export const Logo = (props) => {
  const classes = classNames("img-fluid", props.className);
  return (
    <>
      <img src={props.src} className={classes} alt="logo" />
    </>
  );
};
Logo.propTypes = logoPropTypes;
Logo.defaultProps = logoDefaultProps;

export const InputRenderField = ({
  input,
  label,
  type,
  className,
  placeholder,
  disabled,
  value,
  meta: { touched, error },
  onChange,
  min,
  bold,
  focusEvent
}) => {
  const inputProp = { ...input, disabled, placeholder, type, onChange, value };
  const inputFocus = focusEvent ? focusEvent : null;

  return (
    <div>
      <label className={bold ? "font-weight-bold" : "font-weight-normal"}>
        {label}
      </label>
      <div className="p-field mb-3">
        <input
          {...inputProp}
          {...input}
          autoCapitalize
          onFocus={() => input.onFocus()}
          className={`form-control ${className ? className : ""}`}
          onClick={inputFocus}
        />
        <span
          style={{ opacity: touched && error ? 1 : 0 }}
          className="error-text"
        >
          {touched && error ? error : "Error"}
        </span>
      </div>
    </div>
  );
};

export const TextAreaRenderField = ({
  input,
  label,
  type,
  className,
  placeholder,
  rows = 4,
  inputChange,
  meta: { touched, error },
  bold,
  disabled,
}) => {
  const inputProp = {
    ...input,
    placeholder,
    type,
    rows,
    disabled,
    onChange: (e) => {
      input.onChange(e);
      inputChange && inputChange(e);
    },
  };

  return (
    <div>
      <label className={bold ? "font-weight-bold" : "font-weight-normal"}>
        {label}
      </label>
      <div className="p-field mb-4">
        <textarea
          autoCapitalize
          {...inputProp}
          className={`form-control ${className ? className : ""}`}
        ></textarea>
        {touched && error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
};
export const CalendarField = ({
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
    onChange: (e) => {
      input.onChange(e);
      inputChange && inputChange(e);
    },
  };
  return (
    <div>
      <label>{label}</label>
      <div className="p-field mb-4">
        <Calendar
          {...inputProp}
          inputClassName={`form-control ${className ? className : ""}`}
          monthNavigator
          yearNavigator
          yearRange="2010:2030"
        />
        {touched && error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
};

export const ImageUpload = ({ header, bold, input, label, accept, meta, defaultImage, errorDisplayName }) => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [showRemoveImgModal, setShowRemoveImgModal] = useState(false);
  const [initialValue, setInitialValue] = useState(defaultImage);
  const fileInput = useRef();

  useEffect(() => {
    setInitialValue(defaultImage);
  }, [defaultImage]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      input.onChange(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile(e.target.files[0]);
  };

  const onFileInputTrigger = (event) => {
    event.stopPropagation();
    if (
      fileInput.current !== undefined &&
      fileInput.current.click !== undefined
    ) {
      fileInput.current.click();
    }
  };

  const onRemoveSelected = (e) => {
    e.preventDefault();
    setShowRemoveImgModal(true);
  };

  function actualRemoveSelected() {
    setSelectedFile(undefined);
    setPreview(undefined);
    fileInput.current.value = "";
    setInitialValue(undefined);
    input.onChange(undefined);
    setShowRemoveImgModal(false);
  }
  return (
    <div>
      <label className={bold ? "font-weight-bold" : "font-weight-normal"}>
        {header}
      </label>
      <div>
        <RemoveImageDialog
          onHide={setShowRemoveImgModal}
          visible={showRemoveImgModal}
          action={"Do you want to delete the item ?"}
          deleteImage={actualRemoveSelected}
          errorDisplayName={errorDisplayName ? errorDisplayName : ''}
        />
        <input
          type="file"
          ref={fileInput}
          style={{ display: "none" }}
          accept={accept}
          onChange={onSelectFile}
        />

        {selectedFile || initialValue ? (
          <div className="len-img-box">
            <img src={preview ? preview : initialValue} className="h-100 w-100" />
            <a href="#" onClick={(e) => onRemoveSelected(e)}>
              <Icon_upload_cancel />
            </a>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-dark btn-pill d-block"
            onClick={(event) => onFileInputTrigger(event)}
          >
            {label}
          </button>
        )}
        {meta && meta.touched && meta.error && (
          <span className="error-text">{meta.error}</span>
        )}
      </div>
    </div>
  );
};

export const SelectRenderField = (props) => {
  const {
    options,
    selectClassName,
    optionClassName,
    label,
    input,
    placeholder,
    onChange,
    value,
    bold,
  } = props;
  return (
    <div>
      <label className={bold ? "font-weight-bold" : "font-weight-normal"}>
        {label}
      </label>
      <select
        {...input}
        placeholder={placeholder}
        onChange={onChange ? onChange : input && input.onChange}
        // value={value ? value : input && input.value}
        className={`form-control ${selectClassName ? selectClassName : ""}`}
      >
        {options &&
          options.map((option, index) => {
            return (
              <option
                key={index}
                className={`form-control ${optionClassName ? optionClassName : ""
                  }`}
                disabled={placeholder && index === 0 && true}
                selected={placeholder && index === 0 && true}
                hidden={placeholder && index === 0 && true}
              >
                {option}
              </option>
            );
          })}
      </select>
    </div>
  );
};

import AuthContainer from 'app/common/components/Auth-container/Auth-container.component';
import {InputRenderField} from 'app/common/components/widgets/common';
import history from 'app/common/shared/history';
import * as LoginAction from 'app/store/actions/login.action';
import { LOGIN_CONST } from 'app/common/constants/constant';
import React, {Component} from 'react';
import {Field, Form} from 'react-final-form';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Multiselect from 'multiselect-react-dropdown';
import {Dropdown} from 'primereact/dropdown';
import {Storagehelper} from '../../../common/shared/utils';
import CountryList from './Country.json';

const validate = (values) => {
  const errors = {};
  if (!values.userName) {
    errors.userName = LOGIN_CONST.REQUIRED_ERROR_MSG;
  }
  if (!values.password) {
    errors.password = LOGIN_CONST.REQUIRED_ERROR_MSG;
  }

  return errors;
};

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      citySelectItems: [],
      cityErrMsg:false,
    };
  }

  disabledValidate = (values) => {
    let disabled = true;
    if (
      values.hasOwnProperty('userName') &&
      values.hasOwnProperty('password') &&
      this.state.city != ''
    ) {
      disabled = false;
    }
    if (Object.keys(validate(values)).length > 0) {
      disabled = true;
    }
    return disabled;
  };

  onSubmit = async (values) => {
    const {actions} = this.props;
    console.log(this.state.CtyList);
    await Storagehelper.setDynamicData('CountryFulllist', this.state.CtyList);
    actions.loginRequest(values);
  };

  // componentDidMount() {
  //   const {actions} = this.props;
  //   actions.GetCountries();
  // }

  CountryListDetails() {
    // const {CountryList} = this.props;
    const list = CountryList?.map((item, index) => {
      return {
        label: (
          <div key={index}>
            {item.country}
            <span style={{position: 'absolute', right: 0}}>
              {' '}
              <img
                style={{height: 25, width: 25, marginRight: 30}}
                src={item.flag}
                alt='new'
              />
            </span>
          </div>
        ),
        value: item.country,
      };
    });

    return list;
  }

  render() {
    const {error} = this.props;

    return (
      <AuthContainer>
        <Form
          onSubmit={this.onSubmit}
          validate={validate}
          render={({handleSubmit, form, submitting, pristine, values}) => (
            <form onSubmit={handleSubmit} className='login'>
              <div className='p-fluid'>
                <h3 className='len-header mb-5'>{LOGIN_CONST.LOG_IN}</h3>
                <Field
                  name='userName'
                  type='text'
                  component={InputRenderField}
                  label={LOGIN_CONST.EMAIL}
                  placeholder={LOGIN_CONST.EMAIL_PLACEHOLDER}
                  className='form-control-lg'
                  onChange={(e) => {
                    this.setState({[e.target.name]: e.target.value});
                  }}
                  bold
                />
                <Field
                  name='password'
                  component={InputRenderField}
                  label={LOGIN_CONST.PASSWORD}
                  placeholder={LOGIN_CONST.PASSWORD_PLACEHOLDER}
                  className='form-control-lg'
                  type='password'
                  bold
                />

                <div>
                  <Dropdown
                    style={{
                      height: 50,
                      border: '1px solid #ced4da',
                      color: '#828282',
                      fontSize: '1rem',
                      padding: 10,
                    }}
                    value={this.state.city}
                    options={this.CountryListDetails()}
                    onChange={(e) => {
                      this.setState({
                        city: e.value,
                        CtyList: CountryList.find(
                          (item) => item.country === e.value
                        ),
                      });
                    }}
                    placeholder={LOGIN_CONST.DROPDOWN_PLACEHOLDER}
                    onBlur={()=>{
                      this.setState({
                        cityErrMsg: true
                      })
                    }}
                  />
                </div>
                <div className='error-text'>{this.state.cityErrMsg && !this.state.city && LOGIN_CONST.COUNTRY_DROP_DOWN_ERR_MSG}</div>
                <div className='error-text'>{error && error.message}</div>
                  <div className="pt-3">
                    <a
                      href="javascript:void(0)"
                      className={`text-primary link font-weight-normal`}
                      onClick={()=>{ history.push({
                                     pathname: '/forgototp'
                                    });
                                  }}
                    >
                      {LOGIN_CONST.FORGET_YOUR_PASSWORD}
                    </a>
                  </div>
                <div className='pt-4'>
                  <button
                    type='submit'
                    className={`btn btn-primary btn-pill btn-pill-lg btn-block`}
                    disabled={this.disabledValidate(values)}>
                    {LOGIN_CONST.CONFIRM_BUTTON}
                  </button>
                </div>
              </div>
            </form>
          )}
        />
      </AuthContainer>
    );
  }
}
const mapStateToProps = (state) => {
  return state.Login.error ? state.Login : undefined;
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Object.assign(LoginAction), dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

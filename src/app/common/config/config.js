import {Storagehelper} from '../shared/utils';

const PrepodBuild = false;
const UATBuild = false;
 
const Country_URL = {
  NOR: 'https://6xzusyvljf.execute-api.eu-north-1.amazonaws.com/int',
  LITH: 'https://y8pmn5khy0.execute-api.eu-north-1.amazonaws.com/int',
};

const CountryPrepodURL = {
  NOR: 'https://72ka94nx99.execute-api.eu-north-1.amazonaws.com/preprod',
  LITH: 'https://qtfqqonmqg.execute-api.eu-north-1.amazonaws.com/preprod',
};

const CountryUATURL = {
  NOR: 'https://een34vbvb8.execute-api.eu-north-1.amazonaws.com/prod',
  LITH: 'https://een34vbvb8.execute-api.eu-north-1.amazonaws.com/prod',
};
 
const CountryURL = UATBuild
  ? CountryUATURL
  : PrepodBuild
  ? CountryPrepodURL
  : Country_URL;

const getBaseUrl = () => {
  const articleType = Storagehelper.getDynamicData('CountryFulllist');
  switch (articleType?.country) {
    case 'Norway':
      return CountryURL.NOR;
    case 'Lithuania':
      return CountryURL.LITH;
    default:
      return CountryURL.LITH;
  }
};

export const getEndPoint = () => {
  const articleType = Storagehelper.getDynamicData('CountryFulllist');
  switch (articleType?.country) {
    case 'Norway':
      return CountryURL.NOR;
    case 'Lithuania':
      return CountryURL.LITH;
    default:
      return CountryURL.NOR;
  }
};

export const getCountryPoint = (Status) => {
  const articleType = Storagehelper.getDynamicData('CountryFulllist');
  if (Status) {
    return articleType?.country === 'Lithuania' ? 'EUR' : 'NOK';
  } else if (Status === 'symbol') {
    return articleType?.country === 'Lithuania' ? '€' : 'kr';
  }
  return articleType?.country;
};

export const APICONFIG = {
  ENDPOINT: getBaseUrl(),
};


export const getToken = () => {
  return Storagehelper?.getUserData()?.idToken
    ? Storagehelper?.getUserData()?.idToken
    : '';
};

export const getAccessToken = () => {
  return Storagehelper?.getUserData()?.accessToken
    ? Storagehelper?.getUserData()?.accessToken
    : '';
};


export const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8',
  Accept: 'application/json',
  Authorization: getToken(),
};

export const defaultTextHeaders = {
  'Content-Type': 'text/plain',
  Accept: 'application/json',
  Authorization: getToken(),
};

export const defaultApplicationHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: getToken(),
};

export const otpRequestHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: getToken(),
  'x-access-key': getAccessToken(),
};

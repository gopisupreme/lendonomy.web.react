import _ from 'underscore';
import * as dayjs from 'dayjs';
import { Storagehelper } from "app/common/shared/utils";
import { USER_ROLE_CONFIG_KEY } from '../constants/constant';
class ValidationHelper {
    static isEmpty = (value) => {
        if(_.isDate(value)){
            return value ? false : true;
        }else{
            return _.isEmpty(value);
        }

    }

}
class UtilsHelper extends ValidationHelper {
    static toUnix = (dateVal) => {
        if(dateVal){
            return dayjs(dateVal).valueOf();
        }
        return null;
    }

    static toDate = (dateVal) => {
        if(dateVal){
             return dayjs(dateVal).toDate();
        }
        return null;
    }

    static getImageType = (base64Data) => {
        if(base64Data){
            return base64Data.substring("data:image/".length, base64Data.indexOf(";base64"))
        }
        
    }

    static stripBase64 = (dataImg) => {
        if(dataImg){
            return dataImg.replace(/^data:image\/[a-z]+;base64,/, "");
        }
        
    }
    
    static checkUserRole = (buttonAction) => {
        let userRoleConfig = Storagehelper?.getUserRoleConfig();
        if( userRoleConfig && userRoleConfig[buttonAction] === USER_ROLE_CONFIG_KEY.EDIT){
            return true
        } else {
            return false
        }
    }

    static getUserRole = () =>{
         let userRole = Storagehelper?.getUserData()?.userrole; 
         return userRole;
    }

}

export default UtilsHelper;
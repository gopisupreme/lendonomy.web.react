import React from 'react';
import { Logo } from 'app/common/components/widgets/common';
const AuthContainer = (props) => {
    return ( 
        <>  
            <div className="auth-wrapper">
                <div className="auth-logo">
                    <Logo />
                </div>
                <div className="auth-container">
                    {props.children}
                </div>
            </div>
            
        </>
     );
}
 
export default AuthContainer;
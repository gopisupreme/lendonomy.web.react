import React from 'react';

const Header = (props) => {
  return (
    <>
      <div className="header-container">
        <h3 className="len-header len-header-lg">{props.title}</h3>
        <p className="header-desc-text">{props.desc}</p>
        <div>{props.children}</div>
      </div>
    </>
  );
};

export default Header;

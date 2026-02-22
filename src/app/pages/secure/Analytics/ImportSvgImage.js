import React from 'react';
import style from './analytics.module.scss';

export const SetImages = (props) => {
  const {totalUsed, list} = props;
  const TotalUserCount = (list.usedCount / totalUsed) * 100;
  const roundValue = TotalUserCount

  return (
    <>
      <div>
        <p className={`${style.textGreen} ${style.setImagePercentageStyle}`}>
          {Math.round(roundValue) + '%'}
        </p>
        <div
          className={style.setImageImgContainer}
          >
          <img
            src={list.imageUrl}
            alt={'imageurl'}
            className={style.setImageImgStyle}
          />
          <p style={{textAlign: 'center'}}>{list.name}</p>
        </div>
      </div>
    </>
  );
};

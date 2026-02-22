import ContentTable from 'app/common/components/Content-table/content-table.component';
import Header from 'app/common/components/Header/header.component';
import APP_CONST from 'app/common/constants/app.constant';
import { COMMON_CONST, CONTENT_MANAGER_DRAFT_CONST } from 'app/common/constants/constant';
import React from 'react';

const DraftContent = (props) => {
    return (
        <>
            <Header title={COMMON_CONST.CONTENT_MANAGER} desc={CONTENT_MANAGER_DRAFT_CONST.CONTENT_MANAGER_HEADER_SUB_TEXT} />
            <div className="container-area">
                <div className="len-datatable">
                    <ContentTable props={props} type={APP_CONST.CONTENT_STATUS.DRAFT} />
                </div>
            </div>
        </>
     );
}

export default DraftContent;

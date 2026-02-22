import ContentTable from 'app/common/components/Content-table/content-table.component';
import Header from 'app/common/components/Header/header.component';
import APP_CONST from 'app/common/constants/app.constant';
import { COMMON_CONST, CONTENT_HEADER_CONST } from 'app/common/constants/constant';
import React from 'react';

const ArchiveContent = () => {
    return (
        <>
            <Header title={COMMON_CONST.CONTENT_MANAGER} desc={CONTENT_HEADER_CONST.ARCHIVE} />
            <div className="container-area">
                <div className="len-datatable">
                    <ContentTable type={APP_CONST.CONTENT_STATUS.ARCHIVE} />
                </div>
            </div>
        </>
     );
}

export default ArchiveContent;

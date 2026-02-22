import Header from 'app/common/components/Header/header.component';
import APP_CONST from 'app/common/constants/app.constant';
import { COMMON_CONST, CONTENT_MANAGER_CONTENT_MODIFICATION_CONST } from 'app/common/constants/constant';
import ArticleForm from 'app/pages/secure/Content/forms/article-form.component';
import VideoForm from 'app/pages/secure/Content/forms/video-form.component';
import { TabPanel, TabView } from 'primereact/tabview';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

const ContentModificationTab = (props) => {

    const [activeIndex, setActiveIndex]= useState(0);
    let articleValue = props.location.state;
    const articleType = props.location.state && props.location.state.rowData.articleStatus;
    const contType = props.location.state && props.location.state.rowData.contType;
    useEffect(onload,[]);

    function onload(){
        if(contType && contType === APP_CONST.CONTENT_TYPE.VIDEO){
            setActiveIndex(1);
        }
    }

    function geDescTitle(){
        switch(articleType) {
            case APP_CONST.CONTENT_STATUS.DRAFT :
                return CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_MODIFICATION_SUB_TEXT1
            case APP_CONST.CONTENT_STATUS.STAGGING :
                return CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_MODIFICATION_SUB_TEXT2;
            case APP_CONST.CONTENT_STATUS.PUBLISHED:
                return CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_MODIFICATION_SUB_TEXT3;
            default :
                return CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_MODIFICATION_SUB_TEXT1;
        }
    }

    return (
        <>
            <Header title={COMMON_CONST.CONTENT_MANAGER} desc={geDescTitle()} />
                <TabView className="len-tab" activeIndex={activeIndex} onTabChange={(e) => {
                    articleValue = undefined;
                    setActiveIndex(e.index)}}>
                    <TabPanel header="ADD ARTICLE">
                        <div className="container-area">
                            <div id="content-info">
                                <h3 className="len-header len-header-xs">{CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_INFORMATION}</h3>
                                <ArticleForm formValue={articleValue && articleValue.rowData.contType.toUpperCase() === APP_CONST.CONTENT_TYPE.ARTICLE.toUpperCase() ? articleValue : undefined}/>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="ADD VIDEO">
                        <div className="container-area">
                            <div id="content-info">
                            <h3 className="len-header len-header-xs">{CONTENT_MANAGER_CONTENT_MODIFICATION_CONST.CONTENT_INFORMATION}</h3>
                            <VideoForm formValue={articleValue && articleValue.rowData.contType.toUpperCase() === APP_CONST.CONTENT_TYPE.VIDEO.toUpperCase() ? articleValue : undefined} />
                        </div>
                        </div>
                    </TabPanel>
                </TabView>

        </>
     );
}

export default ContentModificationTab

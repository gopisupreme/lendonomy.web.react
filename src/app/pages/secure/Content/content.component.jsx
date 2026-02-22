import ContentHeader from 'app/common/components/Content-header/content-header.component';
import ArchiveContent from 'app/pages/secure/Content/views/archive.component';
import ContentModificationTab from 'app/pages/secure/Content/views/content-modification-tab.component';
import DraftContent from 'app/pages/secure/Content/views/draft.component';
import StagingContent from 'app/pages/secure/Content/views/staging.component';
import ArticleComments from 'app/pages/secure/Content/views/articleComments.component';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Content = () => {
    return (
        <>
            <ContentHeader/>
            <div className="content-wrapper">
                <Route
                    path="/admin/content"
                    render={({ match: { url } }) => (
                    <>
                        <Route exact path={`${url}`}>
                            <Redirect to={`${url}/draft`} />
                        </Route>
                        <Route path={`${url}/draft`} component={DraftContent} />
                        <Route path={`${url}/archive`} component={ArchiveContent} />
                        <Route path={`${url}/staging`} component={StagingContent} />
                        <Route path={`${url}/add`} component={ContentModificationTab} />
                        <Route path={`${url}/edit`} component={ContentModificationTab} />
                        <Route path={`${url}/comments`} component={ArticleComments} />
                    </>
                )}
                />
            </div>
        </>
     );
}

export default Content;

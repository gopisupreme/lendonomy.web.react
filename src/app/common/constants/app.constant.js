import { epochToDate } from 'app/common/components/widgets/common';

const APP_CONST = {
    'CONTENT_TYPE':{
        ARTICLE:'article',
        VIDEO:'video'
    },
    'CONTENT_STATUS':{
        STAGGING:'stage',
        DRAFT: 'draft',
        ARCHIVE:'archive',
        PUBLISHED: 'published'
    },
    'CONTENT_TABLE':{
        'COMMON':[
            {field: 'title', header: 'CONTENT NAME', headerStyle:{width:'160px'}},
            {field: 'contType', header: 'CONTENT TYPE', headerStyle:{width:'120px'}},
        ],
        'DRAFT': [
            {field: 'lastModifiedOn', header: 'LAST EDITED ON', headerStyle:{width:'120px'}, body:(rowData)=> epochToDate(rowData.lastModifiedOn)},
            {field: 'category', header: 'OVERLINE', headerStyle:{width:'150px'}},

        ],
        'ARCHIVE':[
            {field: 'category', header: 'OVERLINE', headerStyle:{width:'100px'}},
            {field: 'lastPublished', header: 'PUBLISHED ON', headerStyle:{width:'120px'}, body:(rowData)=> epochToDate(rowData.lastPublished)},
            {field: 'archivedOn', header: 'ARCHIVED ON', headerStyle:{width:'120px'}, body:(rowData)=> epochToDate(rowData.archivedOn)},
            {field: 'views', header: 'LIKES', headerStyle:{width:'80px'}},
        ]
    },
    'NA': 'NA',
    'NOK': 'NOK',
    'TIER_INFO':{
        'TIER_1': 'Tier 1',
        'TIER_2': 'Tier 2',
    },
    'ACTIVE_TABS': {
        'ALL' : 'all',
        'BLOCKED' : 'block',
        'REPORTED' : 'reported',
        'RECOVERABLE' : 'recoverable',
        'DELETED' : 'deleted',
    }
}

export default APP_CONST;

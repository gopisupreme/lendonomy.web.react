import {
  blockOrUnblockAccountCase,
  getAllAccountsListCase,
  getBlockedAccountsListCase,
  getDeletedListCase,
  getRecoverableListCase,
  getReportedListCase,
  getProfileUser,
  searchUsersCase,
  deleteRecoverableUser,
} from 'app/common/api/account.list.api';
import ConfirmDialog from 'app/common/components/Confirm-dialog/confirm-dialog.component';
import Header from 'app/common/components/Header/header.component';
import { ACCOUNT_LIST_CONST, COMMON_CONST, USER_ROLE_CONFIG_KEY } from 'app/common/constants/constant';
import {AccountDialog} from 'app/pages/secure/Account/dialog/account.dialog.component';
import {ReactComponent as Icon_clear} from 'assets/icon/icon_cancel.svg';
import {ReactComponent as Icon_search} from 'assets/icon/icon_search.svg';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {Column} from 'primereact/column';
import {DataTable} from 'primereact/datatable';
import React, {Component, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import styles from './accountstyles.module.scss';
import classNames from 'classnames';
import * as action from 'app/store/actions/account.list.action';
import {getCountryPoint} from 'app/common/config/config';
import * as actions from 'app/store/actions/app.action';
import store from 'app/store/store';
import utilsHelper from "app/common/services/utilsHelper"
import * as ApiConstants from 'app/common/constants/api.constants'

dayjs.extend(utc);

const Search = (props) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(props.searchValue);
  }, [props.searchValue]);

  return (
    <>
      <div className='search-input col-4 px-0'>
        <div className='prepend'>
          <Icon_search />
        </div>
        <form>
          <input
            name='search'
            type='text'
            className='form-control form-control-lg'
            placeholder={COMMON_CONST.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className='append'>
            {searchTerm && (
              <Icon_clear
                onClick={() => {
                  setSearchTerm('');
                  props.search('');
                }}
              />
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                props.search(searchTerm);
              }}
              className='btn btn-light'>
              {COMMON_CONST.SEARCH}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export class AccountList extends Component {
  name = 'Table component';
  state = {
    search: '',
    visible: false,
    actionType: '',
    block: '',
    unblock: '',
    activeTab: 'all',
    currentProfile: '',

    first: 0,
    users: [],
    activeUsersCount: 0,
    blockedUsersCount: 0,
    deletedUsersCount: 0,
    lastEvaluatedKey: null,
    lastRegisteredOn: null,
    blockLastEvaluatedKey: null,
    blockLastRegisteredOn: null,
    recoverLastEvaluatedKey: null,
    recoverLastRegisteredOn: null,
    reportLastEvaluatedKey: null,
    reportLastRegisteredOn: null,
    deleteLastEvaluatedKey: null,
    deleteLastRegisteredOn: null,
    prevIds: [],
    prevRegon: [],
    blockPrevIds: [],
    blockPrevRegon: [],
    recoverPrevIds: [],
    recoverPrevRegon: [],
    reportPrevIds: [],
    reportPrevRegon: [],
    deletePrevIds: [],
    deletePrevRegon: [],
    recoverableUsersCount: 0,
    reportedUsersCount: 0,
    pagingEnd: false,
    blockPagingEnd: false,
    recoverPagingEnd: false,
    reportPagingEnd: false,
    deletePagingEnd: false,
    selectedItem: null,
    sortMeta: {
      sortField: null,
      sortOrder: -1,
    },
    currencyType: getCountryPoint(true),
    repUser: [],
    selectedReportUser: {},
    pages: 0,
    blockPages: 0,
    recoverPages: 0,
    reportPages: 0,
    deletePages: 0,
    limit: 20,
    defaultUserCount: 0,
    blockedUserLimit: 20,
    reportedUserLimit: 20,
    recoverableUserLimit: 20,
    deletedUserLimit: 20,
    showPagination: true,
    tobeDeletedUser: null,
    showDeleteDialog: false,
  };

  getAllAccountList(stayOnSamePage = false, prevIds) {
    store.dispatch(actions.showLoader());
    getAllAccountsListCase({
      payload: {
        lastEvaluatedKey: stayOnSamePage
          ? prevIds
            ? prevIds[prevIds.length - 1]
            : this.state.prevIds[this.state.prevIds.length - 1]
          : this.state.lastEvaluatedKey,
        lastRegisteredOn: 
        stayOnSamePage?
        this.state.prevRegon[this.state.prevRegon.length - 1]:
        this.state.lastRegisteredOn, 
      },
    })
      .then((res) => {
        if (stayOnSamePage) {
          const {lastEvaluatedKey, ...otherData} = res.data;
          this.dt.state.first = this.state.localFirst;
          this.setState({...this.state, ...otherData, showPagination: true});
          store.dispatch(actions.hideLoader());
        } else { 
          const prevIds = [...this.state.prevIds];
          prevIds.push(this.state.lastEvaluatedKey);
          const prevRegon = [...this.state.prevRegon];
          prevRegon.push(this.state.lastRegisteredOn);
          this.setState({
            ...this.state,
            ...res.data,
            prevIds,
            prevRegon,
            first: 0,
            activeTab: 'all',
            search: '',
            showPagination: true,
            defaultUserCount: res.data.users.length,
          });
          store.dispatch(actions.hideLoader());
        }
        if (!this.state.pagination) {
          let length = Math.ceil(res.data.users.length / this.state.limit);
          const pagination = {
            pages: [],
            count: res.data.activeUsersCount,
          };
          for (let i = 1; i <= length; i++) {
            pagination.pages.push({
              page: i,
              displayPage: i,
              active: i === 1 ? true : false,
            });
          }
          this.setState({pagination: pagination});
        }
      })
      .catch((err) => {});
  }

  async setCounts(from) {
    await getAllAccountsListCase({
      payload: {lastEvaluatedKey: this.state.lastEvaluatedKey},
    })
      .then((res) => {
        delete res.data.users;
        const counts = res.data;
        this.setState({...counts});
      })
      .catch((error) => error);
    this.props.actions.updateNavigatedFrom(null);
  }

  onload() {
    const {backFromProfile} = this.props;

    if (backFromProfile.activeTab) {
      this.setCounts();
      this.setState({
        lastEvaluatedKey: backFromProfile.lastEvaluatedKey,
        ...backFromProfile,
      });
      if (!backFromProfile.search.trim() == '') {
        this.searchUser(backFromProfile.search, backFromProfile.activeTab);
      } else {
        this.refreshAccount(backFromProfile.activeTab, backFromProfile.prevIds);
      }
    } else {
        this.getAllAccountList(false);
    }
  }

  componentDidMount() {
    this.onload();
  }

  componentDidUpdate(prevProps, prevState) {}

  setStatus = (payload, activeTab) => {
    switch (activeTab ? activeTab : this.state.activeTab) {
      case 'all':
        payload.status = 'all';
        return payload;
      case 'block':
        payload.status = 'block';
        return payload;
      case 'reported':
        payload.status = 'report';
        return payload;
      case 'recoverable':
        payload.status = 'hold';
        return payload;
      case 'deleted':
        payload.status = 'deleted';
        return payload;
      default:
        payload.status = 'all';
    }
    return payload;
  };

  searchUser = (value, activeTab) => {
    this.setState({search: value});
    let payload = {
      search: value,
    };
    payload = this.setStatus(payload, activeTab);

    if (this.state.activeTab == 'deleted') {
      payload.id = value;
    }


    if (value !== '') {
      console.log(payload);
      searchUsersCase(payload).then((res) => {
        if (res.status === 200) {
          if (!activeTab) {
            this.dt.state.rows = res.data.length;
            this.dt.state.first = 0;
          }
          this.setState({
            showPagination: false,
            users: JSON.parse(JSON.stringify(res.data)),
          });
        }
      });
    } else {
      this.dt.state.first = this.state.localFirst;
      this.refreshAccount();
    }
  };

  allAccounts = (e, refresh, prevIds) => {
    this.dt.state.rows = this.state.limit;
    if (this.state.activeTab === 'all' && !refresh) {
      return;
    }
    if (refresh) {
      if (this.state.search.trim() === '') {
        this.setState({
          activeTab: 'all',
          first: 0,
          users: [],
          search: '',
        });
      } else {
        this.setState({activeTab: 'all'});

      }
    }
    this.getAllAccountList(refresh, prevIds);
  };



  blockedAccounts = async (e, refresh) => {
    this.dt.state.rows = this.state.blockedUserLimit;
    await this.setState({activeTab: 'block', 
    first: 0, 
    users: [], 
    search: '',
    blockLastEvaluatedKey: null,
    blockLastRegisteredOn: null,
    blockPrevIds:[],
    blockPrevRegon:[],
  });
    getBlockedAccountsListCase({
        payload: {
        lastEvaluatedKey: this.state.blockLastEvaluatedKey,
        lastRegisteredOn: this.state.blockLastRegisteredOn, 
      },
    })
      .then((res) => {
        const blockPrevIds = [...this.state.blockPrevIds];
        blockPrevIds.push(this.state.blockLastEvaluatedKey);
        const blockPrevRegon = [...this.state.blockPrevRegon];
        blockPrevRegon.push(this.state.blockLastRegisteredOn);
        let length = Math.ceil(res?.data?.length / this.state.blockedUserLimit);
        const pagination = {
          pages: [],
          count: res?.data?.length,
        };
        for (let i = 1; i <= length; i++) {
          pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false,
          });
        }
        this.setState({
          ...this.state,
          users: res?.data,
          blockedUsersCount: res?.data?.length,
          blockLastEvaluatedKey: res.data.lastEvaluatedKey,
          blockLastRegisteredOn: res.data.lastRegisteredOn,
          blockedUserPagination: pagination,
          showPagination: true,
          blockPrevIds,
          blockPrevRegon,
        });
      })
      .catch((err) => {});
  };

  recoverableAccounts = async (e, refresh) => {
    this.dt.state.rows = this.state.recoverableUserLimit;
    await this.setState({
      activeTab: 'recoverable',
      first: 0,
      users: [],
      search: '',
      recoverLastEvaluatedKey: null,
      recoverLastRegisteredOn: null,
      recoverPrevIds:[],
      recoverPrevRegon:[]
    });

    getRecoverableListCase({
      payload: {
      lastEvaluatedKey: this.state.recoverLastEvaluatedKey,
      lastRegisteredOn: this.state.recoverLastRegisteredOn, 
    },
  })
      .then((res) => {
        const recoverPrevIds = [...this.state.recoverPrevIds];
        recoverPrevIds.push(this.state.recoverLastEvaluatedKey);
        const recoverPrevRegon = [...this.state.recoverPrevRegon];
        recoverPrevRegon.push(this.state.recoverLastRegisteredOn);
        let length = Math.ceil(
          res.data.length / this.state.recoverableUserLimit
        );
        const pagination = {
          pages: [],
          count: res.data.length,
        };
        for (let i = 1; i <= length; i++) {
          pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false,
          });
        }
        this.setState({
          ...this.state,
          users: res?.data,
          recoverableUsersCount: res?.data?.length,
          recoverableUserPagination: pagination,
          recoverLastEvaluatedKey: res?.data.lastEvaluatedKey,
          recoverLastRegisteredOn: res?.data?.lastRegisteredOn,
          showPagination: true,
          recoverPrevIds,
          recoverPrevRegon,
        });
      })
      .catch((err) => {});
  };

  deletedAccounts = async (e, refresh) => {
    this.dt.state.rows = this.state.deletedUserLimit;
    await  this.setState({activeTab: 'deleted', first: 0, search: '',
    deleteLastEvaluatedKey: null,
    deleteLastRegisteredOn: null,
    deletePrevIds:[],
    deletePrevRegon:[]
  });
    getDeletedListCase({
      payload: {
        lastEvaluatedKey: this.state.deleteLastEvaluatedKey,
        lastRegisteredOn: this.state.deleteLastRegisteredOn, 
      },
    })
      .then((res) => {
        const deletePrevIds = [...this.state.deletePrevIds];
        deletePrevIds.push(this.state.deleteLastEvaluatedKey);
        const deletePrevRegon = [...this.state.deletePrevRegon];
        deletePrevRegon.push(this.state.deleteLastRegisteredOn);
        let length = Math.ceil(res.data.length / this.state.deletedUserLimit);
        const pagination = {
          pages: [],
          count: res.data.length,
        };
        for (let i = 1; i <= length; i++) {
          pagination.pages.push({
            page: i,
            displayPage: i,
            active: i === 1 ? true : false,
          });
        }
        this.setState({
          ...this.state,
          users: res.data,
          deletedUsersCount: res.data.length,
          deletedUserPagination: pagination,
          showPagination: true,
          deleteLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          deleteLastRegisteredOn: res?.data?.lastRegisteredOn,
          deletePrevIds,
          deletePrevRegon,
        });
      })
      .catch((err) => {});
  };

  refreshAccount(tab, prevIds) {
    switch (tab ? tab : this.state.activeTab) {
      case 'block':
        return this.blockedAccounts(null, true);
      case 'recoverable':
        return this.recoverableAccounts(null, true);
      case 'deleted':
        return this.deletedAccounts(null, true);
      default:
        return this.allAccounts(null, true, prevIds);
    }
  }

  blockAccount = (index, blockReason) => {
    const {userData} = this.props;
    if (blockReason.trim() === '') return;

    blockOrUnblockAccountCase({
      userID: this.state.selectedItem.id,
      block: true,
      reason: blockReason,
    }).then((res) => {
      if (res.status === 200) {
        delete res.data.users;
        delete res.data.lastEvaluatedKey;
        // this.setState({ ...res.data });
        if (this.state.search !== '') {
          this.searchUser(this.state.search);
        } else {
          this.refreshAccount();
        }
      }
    });

    this.onHide();
  };

  unBlockAccount = (index, unblockReason) => {
    const {userData} = this.props;
    if (unblockReason.trim() === '') return;

    blockOrUnblockAccountCase({
      userID: this.state.selectedItem.id,
      block: false,
      reason: unblockReason,
    }).then((res) => {
      if (res.status === 200) {
        delete res.data.users;
        delete res.data.lastEvaluatedKey;

        if (this.state.search !== '') {
          this.searchUser(this.state.search);
        } else {
          this.refreshAccount();
        }
      }
    });

    this.onHide();
  };

  onHide = () => {
    this.setState({visible: false});
  };

  onShow = (action, index, rowData) => {
    this.setState({
      visible: true,
      actionType: action,
      currentIndex: index,
      currentProfile: rowData.profile
        ? `${rowData.profile.name} ${rowData.profile.surname} `
        : `${rowData.name} ${rowData.surname} `,
      selectedItem: rowData,
    });
  };

  handleChange = (e, name) => {
    this.setState({[name]: e.target.value});
  };

  actionTemplate = (rowData, column) => {
    let actionTemplate;
    if (rowData.status === COMMON_CONST.USER_ACTIVE) {
      actionTemplate = (
        <button
          onClick={(e) => this.onShow('Block', column.rowIndex, rowData)}
          className='btn btn-danger btn-pill'>
          {COMMON_CONST.BLOCK}
        </button>
      );
    } else if(rowData.status === COMMON_CONST.USER_INACTIVE) {
      actionTemplate = (
        <button
          onClick={(e) => this.onShow('UnBlock', column.rowIndex, rowData)}
          className='btn btn-success btn-pill'>
          {COMMON_CONST.UNBLOCK}
        </button>
      );
    }
    return actionTemplate;
  };

  profile = (rowData, column) => {
    return (
      <div className='row'>
        <div className={classNames('pr-0', 'col-sm-6')}>
          {rowData.profile.picture && (
            <img
              style={{width: '48px', height: '48px', borderRadius: '24px'}}
              src={rowData.profile.picture}
            />
          )}
        </div>
        <div className={`col-sm-6 pr-0 pl-0 ${styles.pPoppins}`}>
          <div>
            <p className={'text-truncate text-left mb-0'}>
              {rowData.profile && rowData.profile.name}
            </p>
            <p className={'text-truncate text-left mb-0'}>
              {rowData.profile && rowData.profile.surname}
            </p>
          </div>
        </div>
      </div>
    );
  };

  reportedprofilePic = (rowData, column) => {
    return (
      <div className='row mr-0'>
        <div className={classNames('pr-0', 'col-sm-6')}>
          {rowData.picture && (
            <img
              className={styles.allAccountProfileImgStyle}
              src={rowData.picture}
            />
          )}
        </div>
        <div className={`col-sm-6 pr-0 pl-0 ${styles.pPoppins}`}>
          <div title={rowData && rowData.name + ' ' + rowData.surname}>
            <p
              className={`text-truncate text-left mb-0 ${classNames(
                styles.pPoppins
              )}`}>
              {rowData && rowData.name}
            </p>
            <p
              className={`text-truncate text-left mb-0 ${classNames(
                styles.pPoppins
              )}`}>
              {rowData && rowData.surname}
            </p>
          </div>
        </div>
      </div>
    );
  };

  nameTemplate = (rowData, column) => {
    return (
      <div>
        <p className={'text-truncate mb-0'}>
          {rowData.profile && rowData.profile.name + '  '}
        </p>
        <p className={'text-truncate mb-0 mt-8'}>
          {rowData.profile && rowData.profile.surname}
        </p>
      </div>
    );
  };

  onPageAllAccounts = async (event) => {
    const {registeredOn} = this.state.users[this.state.users.length - 1];

    if (event.first > this.state.first) {
      store.dispatch(actions.showLoader());
      await getAllAccountsListCase({
        payload: {
          lastEvaluatedKey: this.state.lastEvaluatedKey,
          // lastRegisteredOn: registeredOn,
          lastRegisteredOn: this.state.lastRegisteredOn,
        },
      }).then((res) => {
        const ids = [...this.state.prevIds];
        ids[event.page] = this.state.lastEvaluatedKey;
        const ids1 = [...this.state.prevRegon];
        ids1[event.page] = this.state.lastRegisteredOn;
        this.setState({
          first: event.first,
          users: res?.data?.users,
          lastEvaluatedKey: res?.data?.lastEvaluatedKey,
          lastRegisteredOn: res?.data?.lastRegisteredOn,
          prevIds: JSON.parse(JSON.stringify(ids)),
          prevRegon: JSON.parse(JSON.stringify(ids1)),
          pagingEnd:
            res?.data?.lastEvaluatedKey === null ||
            res?.data?.lastEvaluatedKey === undefined,
        });
      });
      store.dispatch(actions.hideLoader());
    }
    if (event.first < this.state.first) {
      store.dispatch(actions.showLoader());
      await getAllAccountsListCase({
        payload: {
          lastEvaluatedKey: this.state.prevIds[event.page],
          // lastRegisteredOn: registeredOn,
          lastRegisteredOn: this.state.prevRegon[event.page],
        },
      }).then((res) => {
        const ids = [...this.state.prevIds];
        ids.splice(event.page + 1);
        const ids1 = [...this.state.prevRegon];
        ids1.splice(event.page + 1);

        this.setState({
          // ...this.state,
          first: event.first,
          users: res?.data?.users,
          lastEvaluatedKey: res?.data?.lastEvaluatedKey,
          lastRegisteredOn: res?.data?.lastRegisteredOn,
          prevRegon: JSON.parse(JSON.stringify(ids1)),
          prevIds: JSON.parse(JSON.stringify(ids)),
          pagingEnd: res?.data?.lastEvaluatedKey ? false : true,
        });
      });
      store.dispatch(actions.hideLoader());
    }
  };

  onPageBlockAccounts = async (event) => {
    const {registeredOn} = this.state.users[this.state.users.length - 1];

    if (event.first > this.state.first) {
      await getBlockedAccountsListCase({
        payload: {
          lastEvaluatedKey: this.state.blockLastEvaluatedKey,
          lastRegisteredOn: this.state.blockLastRegisteredOn,
        },
      })
      .then((res) => {
        const ids = [...this.state.blockPrevIds];
        ids[event.page] = this.state.blockLastEvaluatedKey;
        const ids1 = [...this.state.blockPrevRegon];
        ids1[event.page] = this.state.blockLastRegisteredOn;
        this.setState({
          first: event.first,
          users: res?.data?.users,
          blockLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          blockLastRegisteredOn: res?.data?.lastRegisteredOn,
          blockPrevIds: JSON.parse(JSON.stringify(ids)),
          blockPrevRegon: JSON.parse(JSON.stringify(ids1)),
          blockPagingEnd:
            res?.data?.lastEvaluatedKey === null ||
            res?.data?.lastEvaluatedKey === undefined,
        });
      });
    }
    if (event.first < this.state.first) {
      await getBlockedAccountsListCase({
        payload: {
          lastEvaluatedKey: this.state.blockPrevIds[event.page],
          lastRegisteredOn: this.state.blockPrevRegon[event.page],
        },
      })
      .then((res) => {
        const ids = [...this.state.blockPrevIds];
        ids.splice(event.page + 1);
        const ids1 = [...this.state.blockPrevRegon];
        ids1.splice(event.page + 1);

        this.setState({
          // ...this.state,
          first: event.first,
          users: res?.data?.users,
          blockLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          blockLastRegisteredOn: res?.data?.lastRegisteredOn,
          blockPrevRegon: JSON.parse(JSON.stringify(ids1)),
          blockPrevIds: JSON.parse(JSON.stringify(ids)),
          blockPagingEnd: res?.data.lastEvaluatedKey ? false : true,
        });
      });
    }
  };

  onPageRecoverAccounts = async (event) => {
    const {registeredOn} = this.state.users[this.state.users.length - 1];

    if (event.first > this.state.first) {
      await getRecoverableListCase({
        payload: {
          lastEvaluatedKey: this.state.recoverLastEvaluatedKey,
          lastRegisteredOn: this.state.recoverLastRegisteredOn,
        },
      })
      .then((res) => {
        const ids = [...this.state.recoverPrevIds];
        ids[event.page] = this.state.recoverLastEvaluatedKey;
        const ids1 = [...this.state.recoverPrevRegon];
        ids1[event.page] = this.state.recoverLastRegisteredOn;
        this.setState({
          first: event.first,
          users: res?.data?.users,
          recoverLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          recoverLastRegisteredOn: res?.data?.lastRegisteredOn,
          recoverPrevIds: JSON.parse(JSON.stringify(ids)),
          recoverPrevRegon: JSON.parse(JSON.stringify(ids1)),
          recoverPagingEnd:
            res?.data?.lastEvaluatedKey === null ||
            res?.data?.lastEvaluatedKey === undefined,
        });
      });
    }
    if (event.first < this.state.first) {
      await getRecoverableListCase({
        payload: {
          lastEvaluatedKey: this.state.recoverPrevIds[event.page],
          lastRegisteredOn: this.state.recoverPrevRegon[event.page],
        },
      })
      .then((res) => {
        const ids = [...this.state.recoverPrevIds];
        ids.splice(event.page + 1);
        const ids1 = [...this.state.recoverPrevRegon];
        ids1.splice(event.page + 1);

        this.setState({
          // ...this.state,
          first: event.first,
          users: res?.data?.users,
          recoverLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          recoverLastRegisteredOn: res?.data?.lastRegisteredOn,
          recoverPrevRegon: JSON.parse(JSON.stringify(ids1)),
          recoverPrevIds: JSON.parse(JSON.stringify(ids)),
          recoverPagingEnd: res?.data.lastEvaluatedKey ? false : true,
        });
      });
    }
  };


  onPageDeleteAccounts = async (event) => {
    const {registeredOn} = this.state.users[this.state.users.length - 1];

    if (event.first > this.state.first) {
      await getDeletedListCase({
        payload: {
          lastEvaluatedKey: this.state.deleteLastEvaluatedKey,
          lastRegisteredOn: this.state.deleteLastRegisteredOn,
        },
      })
      .then((res) => {
        const ids = [...this.state.deletePrevIds];
        ids[event.page] = this.state.deleteLastEvaluatedKey;
        const ids1 = [...this.state.deletePrevRegon];
        ids1[event.page] = this.state.deleteLastRegisteredOn;
        this.setState({
          first: event.first,
          users: res?.data?.users,
          deleteLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          deleteLastRegisteredOn: res?.data?.lastRegisteredOn,
          deletePrevIds: JSON.parse(JSON.stringify(ids)),
          deletePrevRegon: JSON.parse(JSON.stringify(ids1)),
          deletePagingEnd:
            res?.data?.lastEvaluatedKey === null ||
            res?.data?.lastEvaluatedKey === undefined,
        });
      });
    }
    if (event.first < this.state.first) {
      await getDeletedListCase({
        payload: {
          lastEvaluatedKey: this.state.deletePrevIds[event.page],
          lastRegisteredOn: this.state.deletePrevRegon[event.page],
        },
      })
      .then((res) => {
        const ids = [...this.state.deletePrevIds];
        ids.splice(event.page + 1);
        const ids1 = [...this.state.deletePrevRegon];
        ids1.splice(event.page + 1);

        this.setState({
          // ...this.state,
          first: event.first,
          users: res?.data?.users,
          deleteLastEvaluatedKey: res?.data?.lastEvaluatedKey,
          deleteLastRegisteredOn: res?.data?.lastRegisteredOn,
          deletePrevRegon: JSON.parse(JSON.stringify(ids1)),
          deletePrevIds: JSON.parse(JSON.stringify(ids)),
          deletePagingEnd: res?.data.lastEvaluatedKey ? false : true,
        });
      });
    }
  };

  onSortAllAccount = (event) => {
    const {sortMeta, users} = this.state;

    let sortedUsers = [];
    if (
      event.sortField === 'trustScore' ||
      event.sortField === 'registeredOn'
    ) {
      sortedUsers = users.sort((obj1, obj2) => {
        return sortMeta.sortOrder === -1
          ? obj1[event.sortField] - obj2[event.sortField]
          : obj2[event.sortField] - obj1[event.sortField];
      });
    }

    if (event.sortField === 'name' || event.sortField === 'email') {
      sortedUsers = users.sort((obj1, obj2) => {
        const str1 = obj1.profile[event.sortField].toUpperCase();
        const str2 = obj2.profile[event.sortField].toUpperCase();

        let comparison = 0;
        if (str1 > str2) {
          comparison = 1;
        } else if (str1 < str2) {
          comparison = -1;
        }
        return sortMeta.sortOrder === -1 ? comparison : comparison * -1;
      });
    }

    const updatedMeta = JSON.parse(JSON.stringify(sortMeta));
    updatedMeta.sortOrder = sortMeta.sortOrder === -1 ? 1 : -1;
    updatedMeta.sortField = event.sortField;
    this.setState({
      sortMeta: updatedMeta,
      users: JSON.parse(JSON.stringify(sortedUsers)),
    });
  };

  contactTemplate(rowData) {
    return (
      <div>
        <div className='text-break'>{rowData?.profile?.phoneNumber}</div>
        <div className='text-break'>{rowData?.profile?.email}</div>
      </div>
    );
  }

  reportedContactTemplate(rowData) {
    return (
      <div
        style={{
          backgroundColor: 'red',
        }}>
        <div>{rowData.phoneNumber}</div>
        <div>{rowData.email}</div>
      </div>
    );
  }

  reportedTransactionTemplate(rowData) {
    return (
      <div>
        <div>{`${rowData.totalInvestmentsDone} x ${COMMON_CONST.LENT}`}</div>
        <div>{`${rowData.totalLoansTaken} x ${COMMON_CONST.BORROWED}`}</div>
      </div>
    );
  }

  reportedDefaultTemplate(rowData) {
    return (
      <div>
        <div>{`${rowData.totalDefaultedAsLender} ${COMMON_CONST.DEFAULT}`}</div>
        <div>{`${rowData.totalNotPaidAsBorrower} ${COMMON_CONST.UNPAID}`}</div>
      </div>
    );
  }

  headerRender(name) {
    return <span className='p-column-title text-break'>{name}</span>;
  }

  sortableHeaderTemplate(name, sortField) {
    const {sortMeta} = this.state;

    let icon = null;
    if (sortMeta.sortField === sortField) {
      if (sortMeta.sortOrder === 1) {
        icon = <span className='pi pi-fw pi-sort-amount-up-alt'></span>;
      } else {
        icon = <span className='pi pi-fw pi-sort-amount-down'></span>;
      }
    } else {
      icon = <span className='pi pi-fw pi-sort-alt'></span>;
    }

    return (
      <span
        className={`mt-2 ${styles.sortHeaderContainerStyle}`}>
        <span className='p-column-title text-break'>{name}</span>
        <span
          onClick={() => this.onSortAllAccount({sortField})}
          className={styles.sortHeaderIconStyle}
         >
          {icon}
        </span>
      </span>
    );
  }

  ammountTemlate(rowData) {
    return (
      <div>
        <div>{`${rowData?.loanStats?.totalAmountInvested} ${getCountryPoint(
          true
        )} ${COMMON_CONST.LENT}`}</div>
        <div>{`${rowData?.loanStats?.totalAmountBorrowed} ${getCountryPoint(
          true
        )} ${COMMON_CONST.BORROWED}`}</div>
      </div>
    );
  }

  reportedAmmountTemlate(rowData) {
    return (
      <div>
        <div>{`${rowData.totalAmountInvested} ${getCountryPoint(
          true
        )} lent`}</div>
        <div>{`${rowData.totalAmountBorrowed} ${getCountryPoint(
          true
        )} borrowed`}</div>
      </div>
    );
  }

  registeredOnTemplate(rowData) {
    const formated = dayjs
      .utc(rowData.registeredOn ? rowData.registeredOn : rowData.createdOn)
      .format('DD-MM-YYYY');
    return <div>{formated}</div>;
  }

  deletedOnTemplate(rowData) {
    const formated = dayjs.utc(rowData.deletedOn).format('DD-MM-YYYY');
    return <div>{formated}</div>;
  }

  transactionTemplate(rowData) {
    return (
      <div>
        <div>{`${rowData.loanStats?.totalInvestmentsDone} x ${COMMON_CONST.LENT}`}</div>
        <div>{`${rowData.loanStats?.totalLoansTaken} x ${COMMON_CONST.BORROWED}`}</div>
      </div>
    );
  }

  defaultTemplate(rowData) {
    let defaultValue = 0;
    return (
      <div>
        <div>{`${
          rowData.loanStats?.totLDefaultedLoans
            ? rowData.loanStats.totLDefaultedLoans
            : defaultValue
        } ${COMMON_CONST.UNPAID}`}</div>
        <div>{`${
          rowData.loanStats?.totalDefaultedLoans
            ? rowData.loanStats.totalDefaultedLoans
            : defaultValue
        } ${COMMON_CONST.DEFAULT}`}</div>
      </div>
    );
  }

  lastLoginTemplate(rowData) {
    const formated = dayjs(rowData.deletedOn).format('DD-MM-YYYY');
    return <div>{formated}</div>;
  }

  blockedDateTemplate(rowData) {
    const formated = dayjs(rowData.blockedOn).format('DD-MM-YYYY');
    return <div>{formated}</div>;
  }
  onfilter(value) {}
  onPreviousPage = () => {
    const event = {
      first: this.state.first - this.state.limit,
      page: this.state.pages - 1,
    };
    this.setState({pages: event.page});
    this.dt.state.first = 0;
    let count = Math.ceil(this.state.defaultUserCount / this.state.limit);
    this.onPageAllAccounts(event);
    let pagination = JSON.parse(JSON.stringify(this.state.pagination));
    pagination.pages.map((page, index) => {
      page.active = index === 0 ? true : false;
      page.displayPage = page.displayPage - count;
      page.disabled = false;
      return page;
    });
    // console.log("After paginatoior", pagination)
    this.setState({pagination: JSON.parse(JSON.stringify(pagination))});
  };
  onUpdateFirst = (tab, page) => {
    switch (tab) {
      case 'all':
        {
          this.setState({
            localFirst: (this.dt.state.first =
              (page.page - 1) * this.state.limit),
          });
          this.dt.state.first = (page.page - 1) * this.state.limit;
        }
        return this.state.pagination;
      case 'block':
        this.dt.state.first = (page.page - 1) * this.state.blockedUserLimit;
        return this.state.blockedUserPagination;
      case 'reported':
        this.dt.state.first = (page.page - 1) * this.state.reportedUserLimit;
        return this.state.reportedUserPagination;
      case 'recoverable':
        this.dt.state.first = (page.page - 1) * this.state.recoverableUserLimit;
        return this.state.recoverableUserPagination;
      case 'deleted':
        this.dt.state.first = (page.page - 1) * this.state.deletedUserLimit;
        return this.state.deletedUserPagination;
      default:
        this.dt.state.first = (page.page - 1) * this.state.limit;
    }
  };
  onUpdatePagination = (tab, pagination) => {
    switch (tab) {
      case 'all':
        this.setState({pagination: pagination});
        return;
      case 'block':
        this.setState({blockedUserPagination: pagination});
        return;
      case 'reported':
        this.setState({reportedUserPagination: pagination});
        return;
      case 'recoverable':
        this.setState({recoverableUserPagination: pagination});
        return;
      case 'deleted':
        this.setState({deletedUserPagination: pagination});
        return;
      default:
        this.setState({pagination: pagination});
    }
  };
  onPageChange = (page, index, tab) => {
    let pagination = this.onUpdateFirst(tab, page);
    pagination.pages.map((page, index1) => {
      page.active = index === index1 ? true : false;
    });
    this.onUpdatePagination(tab, pagination);
  };

  navigateToProfile = (e, from) => {
    const {ADMIN,SIDEBAR_ACCOUNT,INDIVIDUAL} = ApiConstants;
    const navigationRoutePath = ADMIN + SIDEBAR_ACCOUNT + INDIVIDUAL;
    if (!e.value) return;
    this.props.history.push({
      pathname: navigationRoutePath,
      state: {
        userData: e.value,
        showBlockUnBlock: true,
        activeTab: from,
        pagination: this.state.pagination,
        search: this.state.search,
        lastEvaluatedKey: this.state.lastEvaluatedKey,
        first: this.state.first,
        prevIds: this.state.prevIds,
        pages: this.state.pages,
        pageEnd: this.state.pageEnd,
        localFirst: this.state.localFirst,
        defaultUserCount: this.state.defaultUserCount,
      },
    });
  };

  getAllAccounts(accountList, accountCount) {
    const paginatorLeft = (
      <button
        disabled={
          this.state?.pagination?.pages?.[0].displayPage == 1 ? true : false
        }
        className='btn btn-dark btn-pill mr-4'
        onClick={this.onPreviousPage}>
        {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
      </button>
    );
    const paginatorRight = (
      <button
        disabled={!this.state.lastEvaluatedKey}
        className='btn btn-dark btn-pill ml-4'
        onClick={async (e) => {
          const event = {
            first: this.state.first + this.state.limit,
            page: this.state.pages + 1,
          };
          this.setState({pages: event.page});
          this.dt.state.first = 0;
          await this.onPageAllAccounts(event);
          let count = Math.ceil(this.state.defaultUserCount / this.state.limit);
          let pagination = JSON.parse(JSON.stringify(this.state.pagination));
          pagination.pages = pagination.pages.map((page, index) => {
            const afterAdd = page.displayPage + count;
            page.active = index === 0 ? true : false;
            page.displayPage = afterAdd;
            page.disabled =
              index + 1 > Math.ceil(this.state.users?.length / this.state.limit)
                ? true
                : false;
            return page;
          });
          this.setState({pagination: JSON.parse(JSON.stringify(pagination))});
        }}>
        {COMMON_CONST.NEXT_PAGE_BUTTON}
      </button>
    );
    return (
      <>
        <DataTable
          value={accountList}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          scrollHeight='400px'
          scrollable={true}
          className={styles.dataTableStyle}
          onSort={this.onSortAllAccount}
          responsive
          // onPage={(e) => console.log(e)}
          // currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          // paginatorTemplate="CurrentPageReport PrevPageLink NextPageLink"
          // lazy={this.state.search === ""}
          // first={this.state.search == "" ? 0 : this.state.first}
          ref={(el) => (this.dt = el)}
          paginator={accountCount && this.state.search === '' ? true : false}
          rows={
            this.state.search === ''
              ? this.state.limit
              : this.state.users.length
          }
          totalRecords={
            this.state.search === '' ? accountCount : this.state.users.length
          }
          paginatorTemplate=' '
          // globalFilter={this.state.search}
          onSelectionChange={(e) => this.navigateToProfile(e, 'all')}
          selectionMode='single'
          dataKey='id'
          sortOrder={1}>
          <Column
          header=''
          headerClassName={styles.allAccountProfileHeaderStyle}
          body={(rowData)=>{
            return(
            // <div className={classNames('pr-0', 'col-sm-6')}>
            <>
              {rowData.profile?.picture && (
                <img
                  className={styles.allAccountProfileImgStyle}
                  src={rowData.profile.picture}
                />
              )}
              </>
            // </div>
            )
          }}
          />
          <Column
            sortable
            // body={this.profile}
            body={(rowData)=>{
              return(
              <div 
              // className={'pr-3'}
              >
                <p className={'text-truncate mb-0'}>
                  {rowData.profile && rowData.profile.name + '  '}
                </p>
                <p className={'text-truncate mb-0 mt-8'}>
                  {rowData.profile && rowData.profile.surname}
                </p>
              </div>
              )
            }}
            header={this.sortableHeaderTemplate('Name', 'name')}
            headerClassName={styles.allAccountHeaderStyle}
            className={styles.allAccountNameStyle}
            filterField={'profile.name'}
            sortField={'name'}
          />
          <Column
            // sortable
            field='profile.email'
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.allAccountHeaderStyle}
            className={`text-break ${styles.allAccountcontactStyle}`}
            body={this.contactTemplate}
            filterField='profile.email'
            // sortField="email"
          />
          <Column
            field={`loanStats.amount`}
            header={COMMON_CONST.AMOUNTS}
            body={this.ammountTemlate}
            headerClassName={styles.allAccountAmountHeaderStyle}
            className={styles.allAccountcontactStyle}
            filterField='loanStats.totalAmountInvested'></Column>
          <Column
            sortable
            field='registeredOn'
            sortField='registeredOn'
            header={this.sortableHeaderTemplate(
              'Account Creation',
              'registeredOn'
            )}
            body={this.registeredOnTemplate}
            headerClassName={styles.allAccountCreationHeaderStyle}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='trustScore'
            header={this.sortableHeaderTemplate('Trust Score', 'trustScore')}
            headerClassName={styles.allAccountTrustHeaderStyle}
            className={styles.allAccountcontactStyle}
            sortable
            sortField='trustScore'
          />
          <Column
            field='loanStats.totalLoansTaken'
            header={COMMON_CONST.TRANSACTIONS}
            headerClassName={styles.allAccountAmountHeaderStyle}
            className={styles.allAccountcontactStyle}
            body={this.transactionTemplate}
            filterField='loanStats.totalLoansTaken'
          />
          <Column
            field='defaults'
            header={COMMON_CONST.DEFAULTS}
            headerClassName={styles.allAccountTrustHeaderStyle}
            className={styles.allAccountcontactStyle}
            body={this.defaultTemplate}
          />
          {utilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_BLK_UNBLK) && 
          <Column
            body={this.actionTemplate}
            headerClassName={styles.allAccountAmountHeaderStyle}
            className={styles.allAccountcontactStyle}
          />
          }
        </DataTable>
        <nav aria-label='...' className='ml-auto'>
          <ul className={classNames('pagination', styles.moveRight)}>
            {this.state.showPagination &&
            this.state.users?.length &&
            this.state.activeTab === 'all' &&
            this.state.search === '' ? (
              <>
                {paginatorLeft}
                {this.state.pagination?.pages?.map((page, index) => {
                  let classes = classNames('page-link', styles.pageNumbers);
                  if (page.active)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.activeGreen
                    );
                  if (page.disabled)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.pageDisabled
                    );
                  return (
                    <li
                      key={page.page}
                      className={`page-item mr-3 ${
                        page.active && classNames(styles.activeGreen)
                      }`}>
                      <span
                        className={classes}
                        onClick={(e) =>
                          !page?.disabled &&
                          this.onPageChange(page, index, 'all')
                        }>
                        {page.displayPage}
                      </span>
                    </li>
                  );
                })}
                {paginatorRight}
              </>
            ) : null}
          </ul>
        </nav>
      </>
    );
  }
  getBlockedAccounts(accountList, accountCount) {
    const paginatorLeft = (
      <button
        disabled={
          this.state?.blockedUserPagination?.pages?.[0]?.displayPage == 1 ? true : false
        }
        className='btn btn-dark btn-pill mr-4'
        onClick={(e)=>{
          const event = {
            first: this.state.first - this.state.limit,
            page: this.state.blockPages - 1,
          };
          this.setState({blockPages: event.page});
          this.dt.state.first = 0;
          let count = Math.ceil(this.state.blockedUsersCount / this.state.limit);
          this.onPageBlockAccounts(event);
          let pagination = JSON.parse(JSON.stringify(this.state.blockedUserPagination));
          pagination.pages.map((page, index) => {
            page.active = index === 0 ? true : false;
            page.displayPage = page.displayPage - count;
            page.disabled = false;
            return page;
          });
          // console.log("After paginatoior", pagination)
          this.setState({blockedUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
      </button>
    );
    const paginatorRight = (
      <button
        className='btn btn-dark btn-pill ml-4'
        disabled={!this.state.blockLastEvaluatedKey}
         onClick={async (e) => {
          const event = {
            first: this.state.first + this.state.limit,
            page: this.state.blockPages + 1,
          };
          this.setState({blockPages: event.page});
          this.dt.state.first = 0;
          await this.onPageBlockAccounts(event);
          let count = Math.ceil(this.state.blockedUsersCount / this.state.limit);
          let pagination = JSON.parse(JSON.stringify(this.state.blockedUserPagination));
          pagination.pages = pagination.pages.map((page, index) => {
            const afterAdd = page.displayPage + count;
            page.active = index === 0 ? true : false;
            page.displayPage = afterAdd;
            page.disabled =
              index + 1 > Math.ceil(this.state.users?.length / this.state.limit)
                ? true
                : false;
            return page;
          });
          this.setState({blockedUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.NEXT_PAGE_BUTTON}
      </button>
    );

    return (
      <>
        <DataTable
          value={accountList}
          scrollHeight='400px'
          scrollable={true}
          className={styles.dataTableStyle}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          // globalFilter={this.state.search}
          onSelectionChange={(e) => this.navigateToProfile(e, 'block')}
          selectionMode='single'
          ref={(el) => (this.dt = el)}
          paginator={accountCount && this.state.search === '' ? true : false}
          rows={
            this.state.search === ''
              ? this.state.blockedUserLimit
              : this.state.users.length
          }
          totalRecords={
            this.state.search === '' ? accountCount : this.state.users.length
          }
          paginatorTemplate=' '>
          <Column
          header=''
          headerClassName={styles.allAccountProfileHeaderStyle}
          body={(rowData)=>{
            return(
            // <div className={classNames('pr-0', 'col-sm-6')}>
            <>
              {rowData.profile.picture && (
                <img
                  className={styles.allAccountProfileImgStyle}
                  src={rowData.profile.picture}
                />
              )}
              </>
            // </div>
            )
          }}
          />
          <Column
            field='profile.name'
            // body={this.nameTemplate}
            body={(rowData)=>{
              return(
              <div 
              // className={'pr-3'}
              >
                <p className={'text-truncate mb-0'}>
                  {rowData.profile && rowData.profile.name + '  '}
                </p>
                <p className={'text-truncate mb-0 mt-8'}>
                  {rowData.profile && rowData.profile.surname}
                </p>
              </div>
              )
            }}
            header={this.headerRender(COMMON_CONST.NAME)}
            headerClassName={styles.allAccountHeaderStyle}
            sortable={true}
            sortField='profile.name'
            className={styles.allAccountNameStyle}
            filterField='profile.name'
          />
          <Column
            field='profile.email'
            body={this.contactTemplate}
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.allBlockedContactHeaderStyle}
            className={styles.allBlockedContactStyle}
            filterField='profile.email'
          />
          <Column
            field='blockedReason'
            header={ACCOUNT_LIST_CONST.BLOCKING_REASON}
            headerClassName={styles.allBlockedReasonHeaderStyle}
            className={styles.allBlockedContactStyle}
          />

          <Column
            field='blockedOn'
            header={this.headerRender(ACCOUNT_LIST_CONST.DATE_OF_BLOCKING)}
            headerClassName={styles.allBlockedReasonHeaderStyle}
            sortable={true}
            className={styles.allAccountcontactStyle}
            body={this.blockedDateTemplate}
          />
          <Column
            field='trustScore'
            header={this.headerRender(COMMON_CONST.TRUSTSCORE)}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            sortable={true}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='source'
            header={COMMON_CONST.TRANSACTIONS}
            headerClassName={styles.allBlockedReasonHeaderStyle}
            body={this.transactionTemplate}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='title'
            header={COMMON_CONST.DEFAULTS}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            body={this.defaultTemplate}
            className={styles.allAccountcontactStyle}
          />
           {utilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_BLK_UNBLK) && 
          <Column
            body={this.actionTemplate}
            headerClassName={styles.allBlockedReasonHeaderStyle}
            className={styles.allAccountcontactStyle}
          />
           }
        </DataTable>
        <nav aria-label='...' className='ml-auto'>
          <ul className={classNames('pagination', styles.moveRight)}>
            {this.state.showPagination &&
            accountCount &&
            this.state.blockedUserPagination &&
            this.state.search === '' ? (
              <>
                {paginatorLeft}
                {this.state.blockedUserPagination?.pages?.map((page, index) => {
                  let classes = classNames('page-link', styles.pageNumbers);
                  if (page.active)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.activeGreen
                    );
                  if (page.disabled)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.pageDisabled
                    );
                  return (
                    <li
                      key={page.page}
                      className={`page-item mr-3 ${
                        page.active && classNames(styles.activeGreen)
                      }`}>
                      <span
                        className={classes}
                        onClick={(e) =>
                          !page?.disabled &&
                          this.onPageChange(page, index, 'block')
                        }>
                        {page.displayPage}
                      </span>
                    </li>
                  );
                })}
                {paginatorRight}
              </>
            ) : null}
          </ul>
        </nav>
      </>
    );
  }

  getRecoverableAccounts(accountList, accountCount) {
    const paginatorLeft = (
      <button
        disabled={
          this.state?.recoverableUserPagination?.pages?.[0]?.displayPage == 1 ? true : false
        }
        className='btn btn-dark btn-pill mr-4'
        onClick={(e)=>{
          const event = {
            first: this.state.first - this.state.limit,
            page: this.state.recoverPages - 1,
          };
          this.setState({recoverPages: event.page});
          this.dt.state.first = 0;
          let count = Math.ceil(this.state.recoverableUsersCount / this.state.limit);
          this.onPageRecoverAccounts(event);
          let pagination = JSON.parse(JSON.stringify(this.state.recoverableUserPagination));
          pagination.pages.map((page, index) => {
            page.active = index === 0 ? true : false;
            page.displayPage = page.displayPage - count;
            page.disabled = false;
            return page;
          });
          // console.log("After paginatoior", pagination)
          this.setState({recoverableUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
      </button>
    );
    const paginatorRight = (
      <button
        disabled={!this.state.recoverLastEvaluatedKey}
        className='btn btn-dark btn-pill ml-4'
        onClick={async (e) => {
          const event = {
            first: this.state.first + this.state.limit,
            page: this.state.recoverPages + 1,
          };
          this.setState({recoverPages: event.page});
          this.dt.state.first = 0;
          await this.onPageRecoverAccounts(event);
          let count = Math.ceil(this.state.recoverableUsersCount / this.state.limit);
          let pagination = JSON.parse(JSON.stringify(this.state.recoverableUserPagination));
          pagination.pages = pagination.pages.map((page, index) => {
            const afterAdd = page.displayPage + count;
            page.active = index === 0 ? true : false;
            page.displayPage = afterAdd;
            page.disabled =
              index + 1 > Math.ceil(this.state.users?.length / this.state.limit)
                ? true
                : false;
            return page;
          });
          this.setState({recoverableUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.NEXT_PAGE_BUTTON}
      </button>
    );

    return (
      <>
        <DataTable
          value={accountList}
          scrollHeight='400px'
          scrollable={true}
          className={styles.dataTableStyle}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          onSelectionChange={(e) => {
            this.navigateToProfile(e, 'recoverable');
          }}
          selectionMode='single'
          ref={(el) => (this.dt = el)}
          paginator={accountCount && this.state.search === '' ? true : false}
          rows={
            this.state.search === ''
              ? this.state.recoverableUserLimit
              : this.state.users.length
          }
          totalRecords={
            this.state.search === '' ? accountCount : this.state.users.length
          }
          paginatorTemplate=' '>
           <Column
          header=''
           headerClassName={styles.allAccountProfileHeaderStyle}
          body={(rowData)=>{
            return(
            // <div className={classNames('pr-0', 'col-sm-6')}>
            <>
              {rowData.profile.picture && (
                <img
                  className={styles.allAccountProfileImgStyle}
                  src={rowData.profile.picture}
                />
              )}
              </>
            // </div>
            )
          }}
          />  
          <Column
            field='profile.name'
            body={this.nameTemplate}
            header={this.headerRender(COMMON_CONST.NAME)}
            headerClassName={styles.allRecoverNameStyle}
            sortable={true}
            className={styles.allAccountNameStyle}
            filterField='profile.name'
          />
          <Column
            field='profile.contacts'
            header={COMMON_CONST.CONTACTS}
            headerClassName={styles.allBlockedContactHeaderStyle}
            className={styles.allBlockedContactStyle}
            body={this.contactTemplate}
            filterField='profile.email'
          />

          <Column
            field='deletedReason'
            header={this.headerRender(ACCOUNT_LIST_CONST.DELETION_REASON)}
            headerClassName={styles.allBlockedContactHeaderStyle}
            className={styles.allBlockedContactStyle}
          />

          <Column
            field='trustScore'
            header={this.headerRender(COMMON_CONST.TRUSTSCORE)}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            sortable={true}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='source'
            header={COMMON_CONST.TRANSACTIONS}
            headerClassName={styles.allBlockedReasonHeaderStyle}
            body={this.transactionTemplate}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='title'
            header={COMMON_CONST.DEFAULTS}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            body={this.defaultTemplate}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='deletedOn'
            header={this.headerRender(COMMON_CONST.DELETED)}
            headerClassName={styles.allRecoverDeletedOnStyle}
            body={this.lastLoginTemplate}
            sortField='deletedOn'
            sortable={true}
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='daysLeft'
            header={this.headerRender(ACCOUNT_LIST_CONST.DAYS_LEFT)}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            sortable={true}
            className={styles.allAccountcontactStyle}
          />
          {utilsHelper.checkUserRole(USER_ROLE_CONFIG_KEY.ACC_RECOVER) && 
          <Column
            field=''
            header=''
            headerClassName={styles.allBlockedTrustHeaderStyle}
            body={(rowData) => (
              <button
                className='btn btn-danger btn-pill'
                onClick={() => {
                  this.setState({
                    showDeleteDialog: true,
                    tobeDeletedUser: rowData,
                  });
                }}>
                {COMMON_CONST.DELETE}
              </button>
            )}
          />
              }
        </DataTable>
        <nav aria-label='...' className='ml-auto'>
          <ul className={classNames('pagination', styles.moveRight)}>
            {this.state.showPagination &&
            accountCount &&
            this.state.recoverableUserPagination &&
            this.state.search === '' ? (
              <>
                {paginatorLeft}
                {this.state.recoverableUserPagination?.pages?.map(
                  (page, index) => {
                    let classes = classNames('page-link', styles.pageNumbers);
                    if (page.active)
                      classes = classNames(
                        'page-link',
                        styles.pageNumbers,
                        styles.activeGreen
                      );
                    if (page.disabled)
                      classes = classNames(
                        'page-link',
                        styles.pageNumbers,
                        styles.pageDisabled
                      );
                    return (
                      <li
                        key={page.page}
                        className={`page-item mr-3 ${
                          page.active && classNames(styles.activeGreen)
                        }`}>
                        <span
                          className={classes}
                          onClick={(e) =>
                            !page?.disabled &&
                            this.onPageChange(page, index, 'recoverable')
                          }>
                          {page.displayPage}
                        </span>
                      </li>
                    );
                  }
                )}
                {paginatorRight}
              </>
            ) : null}
          </ul>
        </nav>
      </>
    );
  }
  getDeletedAccounts(accountList, accountCount) {
    const paginatorLeft = (
      <button
      disabled={
        this.state?.deletedUserPagination?.pages?.[0]?.displayPage == 1 ? true : false
      }
        className='btn btn-dark btn-pill mr-4'
        onClick={(e)=>{
          const event = {
            first: this.state.first - this.state.limit,
            page: this.state.deletePages - 1,
          };
          this.setState({deletePages: event.page});
          this.dt.state.first = 0;
          let count = Math.ceil(this.state.deletedUsersCount / this.state.limit);
          this.onPageDeleteAccounts(event);
          let pagination = JSON.parse(JSON.stringify(this.state.deletedUserPagination));
          pagination.pages.map((page, index) => {
            page.active = index === 0 ? true : false;
            page.displayPage = page.displayPage - count;
            page.disabled = false;
            return page;
          });
          // console.log("After paginatoior", pagination)
          this.setState({deletedUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.PREVIOUS_PAGE_BUTTON}
      </button>
    );
    const paginatorRight = (
      <button
        disabled={!this.state.deleteLastEvaluatedKey}
        className='btn btn-dark btn-pill ml-4'
        onClick={async (e) => {
          const event = {
            first: this.state.first + this.state.limit,
            page: this.state.deletePages + 1,
          };
          this.setState({deletePages: event.page});
          this.dt.state.first = 0;
          await this.onPageDeleteAccounts(event);
          let count = Math.ceil(this.state.deletedUsersCount / this.state.limit);
          let pagination = JSON.parse(JSON.stringify(this.state.deletedUserPagination));
          pagination.pages = pagination.pages.map((page, index) => {
            const afterAdd = page.displayPage + count;
            page.active = index === 0 ? true : false;
            page.displayPage = afterAdd;
            page.disabled =
              index + 1 > Math.ceil(this.state.users?.length / this.state.limit)
                ? true
                : false;
            return page;
          });
          this.setState({deletedUserPagination: JSON.parse(JSON.stringify(pagination))});
        }}
        >
        {COMMON_CONST.NEXT_PAGE_BUTTON}
      </button>
    );

    return (
      <>
        <DataTable
          value={accountList}
          // globalFilter={this.state.search}
          scrollHeight='400px'
          scrollable={true}
          className={styles.allDeletedDataTableStyle}
          emptyMessage={COMMON_CONST.DATATABLE_EMPTY_MSG}
          // currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          // paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          // onSelectionChange={(e) => {
          //   if (!e.value) return;
          //   this.props.history.push({
          //     pathname: "/admin/account/induvidual",
          //     state: {
          //       userData: e.value,
          //     },
          //   });
          // }}
          // selectionMode="single"
          ref={(el) => (this.dt = el)}
          paginator={accountCount && this.state.search === '' ? true : false}
          rows={
            this.state.search === ''
              ? this.state.deletedUserLimit
              : this.state.users.length
          }
          totalRecords={
            this.state.search === '' ? accountCount : this.state.users.length
          }
          paginatorTemplate=' '>
          <Column
            field='id'
            header={this.headerRender(ACCOUNT_LIST_CONST.USER_ID)}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            sortable={true}
            className={styles.allAccountNameStyle}
            filterField='id'
          />

          <Column
            field='createdOn'
            header={this.headerRender(COMMON_CONST.CREATED)}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            sortable={true}
            body={this.registeredOnTemplate}
            filterField='createdOn'
            className={styles.allAccountcontactStyle}
          />
          <Column
            field='deletedOn'
            header={this.headerRender(COMMON_CONST.DELETED)}
            sortable={true}
            headerClassName={styles.allBlockedContactHeaderStyle}
            body={this.deletedOnTemplate}
            filterField='deletedOn'
            className={styles.allAccountcontactStyle}
          />

          <Column
            field='userHash'
            header={ACCOUNT_LIST_CONST.HASH}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            className={styles.allBlockedContactStyle}
            body={(rowData) => (
              <>
              {rowData.userHash?.length > COMMON_CONST.DATA_VISIBILITY_TOOLTIP ? 
              <p className="mb-0 text-truncate" title={rowData.userHash}>
                {rowData.userHash}
              </p>
              :
              <p className="mb-0 text-truncate">
              {rowData.userHash}
              </p>
              }
              </>
            )}
          />
          <Column
            field='reason'
            header={ACCOUNT_LIST_CONST.REASON_FOR_LEAVING}
            headerClassName={styles.allBlockedTrustHeaderStyle}
            className={styles.allAccountcontactStyle}
          />
          <Column field='reasonForLeaving' headerClassName={styles.allBlockedTrustHeaderStyle} className={styles.allAccountcontactStyle}/>
        </DataTable>
        <nav aria-label='...' className='ml-auto'>
          <ul className={classNames('pagination', styles.moveRight)}>
            {this.state.showPagination &&
            accountCount &&
            this.state.deletedUserPagination &&
            this.state.search === '' ? (
              <>
                {paginatorLeft}
                {this.state.deletedUserPagination?.pages?.map((page, index) => {
                  let classes = classNames('page-link', styles.pageNumbers);
                  if (page.active)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.activeGreen
                    );
                  if (page.disabled)
                    classes = classNames(
                      'page-link',
                      styles.pageNumbers,
                      styles.pageDisabled
                    );
                  return (
                    <li
                      key={page.page}
                      className={`page-item mr-3 ${
                        page.active && classNames(styles.activeGreen)
                      }`}>
                      <span
                        className={classes}
                        onClick={(e) =>
                          !page?.disabled &&
                          this.onPageChange(page, index, 'deleted')
                        }>
                        {page.displayPage}
                      </span>
                    </li>
                  );
                })}
                {paginatorRight}
              </>
            ) : null}
          </ul>
        </nav>
      </>
    );
  }
  getAccounts(accountList) {
    const {
      activeUsersCount,
      deletedUsersCount,
      recoverableUsersCount,
      reportedUsersCount,
      blockedUsersCount,
    } = this.state;
    switch (this.state.activeTab) {
      case 'all':
        return this.getAllAccounts(accountList, activeUsersCount);
      case 'block':
        return this.getBlockedAccounts(accountList, blockedUsersCount);
      case 'recoverable':
        return this.getRecoverableAccounts(accountList, recoverableUsersCount);
      case 'deleted':
        return this.getDeletedAccounts(accountList, deletedUsersCount);
      default:
        return this.getAllAccounts(accountList, activeUsersCount);
    }
  }

  onDeleteConfirm = () => {
    this.setState({
      showDeleteDialog: false,
      tobeDeletedUser: null,
    });

    deleteRecoverableUser(this.state.tobeDeletedUser.id).then((res) => {
      if (res.status === 200) {
        if (res.response) {
          this.setState({
            users: res.response,
            deletedUsersCount: this.state.deletedUsersCount + 1,
            recoverableUsersCount: res.response.length,
          });
        }
      }
    });
  };

  render() {
    const {
      users,
      activeUsersCount, 
      deletedUsersCount,
      recoverableUsersCount,
      reportedUsersCount,
      blockedUsersCount,
    } = this.state;

    return (
      <div className='wrapper'>
        <Header
          title={COMMON_CONST.ACCOUNT_CENTER}
          desc={
            this.state.activeTab === 'reported'
              ? ACCOUNT_LIST_CONST.REVIEW_REPORTS
              : ACCOUNT_LIST_CONST.REVIEW_LENDWILL_ACCOUNTS
          }>
          <Search search={this.searchUser} searchValue={this.state.search} />
        </Header>
        <hr />
        <div className='container-area'>
          <ul className='nav len-menu'>
            <li className='nav-item'>
              <a
                id='all'
                className={`nav-link ${
                  this.state.activeTab === 'all' ? 'active' : ''
                }`}
                href='javascript:void(0)'
                onClick={() => this.allAccounts(null, true)}>
                {`${ACCOUNT_LIST_CONST.ACTIVE_ACCOUNTS} (${activeUsersCount})`}
              </a>
            </li>
            <li className='nav-item'>
              <a
                id='unBlock'
                className={`nav-link ${
                  this.state.activeTab === 'block' ? 'active' : ''
                }`}
                href='javascript:void(0)'
                onClick={this.blockedAccounts}>
                {ACCOUNT_LIST_CONST.BLOCKED_ACCOUNTS} ({blockedUsersCount})
              </a>
            </li>
            <li className='nav-item'>
              <a
                id='recoverable'
                className={`nav-link ${
                  this.state.activeTab === 'recoverable' ? 'active' : ''
                }`}
                href='javascript:void(0)'
                onClick={this.recoverableAccounts}>
                {ACCOUNT_LIST_CONST.RECOVERABLE_ACCOUNTS} ({recoverableUsersCount})
              </a>
            </li>
            <li className='nav-item'>
              <a
                id='deleted'
                className={`nav-link ${
                  this.state.activeTab === 'deleted' ? 'active' : ''
                }`}
                href='javascript:void(0)'
                onClick={this.deletedAccounts}>
                {ACCOUNT_LIST_CONST.DELETED_ACCOUNTS} ({deletedUsersCount})
              </a>
            </li>
          </ul>
          <div
            className={classNames(
              'mt-4',
              this.state.activeTab === 'all' ? 'all-table' : 'len-datatable'
            )}>
            {this.getAccounts(users)}
          </div>
        </div>
        <ConfirmDialog
          visible={this.state.showDeleteDialog}
          header={`${ACCOUNT_LIST_CONST.DELETE_DIALOGBOX_HEADER} ${this.state.tobeDeletedUser?.profile?.name} ${this.state.tobeDeletedUser?.profile?.surname}?`}
          desc={ACCOUNT_LIST_CONST.DELETE_DIALOGBOX_SUBTEXT}
          footer={
            <div className='text-left'>
              <button
                className='btn btn-primary btn-pill'
                onClick={() =>
                  this.setState({
                    showDeleteDialog: false,
                    tobeDeletedUser: null,
                  })
                }>
                {ACCOUNT_LIST_CONST.DO_NOT_DELETE}
              </button>
              <button
                className='btn btn-dark btn-pill'
                onClick={this.onDeleteConfirm}>
                {COMMON_CONST.DELETE}
              </button>
            </div>
          }
          onHide={() =>
            this.setState({showDeleteDialog: false, tobeDeletedUser: null})
          }
        />

        <AccountDialog
          block={this.blockAccount}
          unBlock={this.unBlockAccount}
          onChange={this.handleChange}
          onHide={this.onHide}
          visible={this.state.visible}
          action={this.state.actionType}
          item={this.state.selectedItem}
          currentIndex={this.state.currentIndex}
          blockText={this.state.block}
          unblockText={this.state.unblock}
          profile={this.state.currentProfile}
        />
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  // console.log("ms", state);
  let backFromProfile = {
    pagination: state.AccountListReducer.pagination,
    search: state.AccountListReducer.search,
    lastEvaluatedKey: state.AccountListReducer.lastEvaluatedKey,
    first: state.AccountListReducer.first,
    prevIds: state.AccountListReducer.prevIds,
    pages: state.AccountListReducer.pages,
    pageEnd: state.AccountListReducer.pageEnd,
    localFirst: state.AccountListReducer.localFirst,
    activeTab: state.AccountListReducer.activeTab,
    defaultUserCount: state.AccountListReducer.defaultUserCount,
  };
  return {
    userData: state.Login.userData ? state.Login.userData : {},
    backFromProfile: backFromProfile,
    TabChanges: state.OTP.TabNavigate,
  };
};
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Object.assign(action), dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(AccountList);

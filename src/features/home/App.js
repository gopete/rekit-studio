import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import enUS from 'antd/lib/locale-provider/en_US';
import { LocaleProvider, message, Modal, Spin } from 'antd';
import { ErrorBoundary } from '../common';
import { TabsBar, SidePanel, SidePanelResizer, QuickOpen } from './';
import DialogPlace from '../rekit-cmds/DialogPlace';
import { fetchProjectData } from './redux/actions';

/*
  This is the root component of your app. Here you define the overall layout
  and the container of the react router. The default one is a two columns layout.
  You should adjust it acording to the type of your app.
*/

export class App extends Component {
  static propTypes = {
    // home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
  };

  componentDidMount() {
    this.props.actions.fetchProjectData().then(() => {
      document.title = this.props.projectName;
    }).catch(err => {
      Modal.error({
        title: 'Failed to load project data',
        content: err && (err.message || err.toString()),
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.projectDataNeedReload &&
      !nextProps.fetchProjectDataError &&
      !nextProps.fetchProjectDataPending
    ) {
      this.props.actions
        .fetchProjectData()
        .catch(e => {
          console.log('failed to fetch project data: ', e);
          message.error('Failed to refresh project data');
        });
    }
  }

  renderLoading() {
    return (
      <div className="home-app loading">
        <Spin />
        <span style={{ marginLeft: 20 }}>Loading...</span>
      </div>
    );
  }

  render() {
    if (!this.props.features) {
      return this.renderLoading();
    }

    return (
      <LocaleProvider locale={enUS}>
        <div className="home-app">
          <SidePanel />
          <TabsBar />
          <SidePanelResizer />
          <div id="page-container" className="page-container" style={{ left: `${this.props.sidePanelWidth}px` }}>
            <ErrorBoundary>{this.props.children}</ErrorBoundary>
          </div>
          <DialogPlace />
          <QuickOpen />
        </div>
      </LocaleProvider>
    );
  }
}

function mapStateToProps(state) {
  return _.pick(state.home, [
    'sidePanelWidth',
    'projectName',
    'features',
    'projectDataNeedReload',
    'fetchProjectDataError',
    'fetchProjectDataPending',

  ]);
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ fetchProjectData }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

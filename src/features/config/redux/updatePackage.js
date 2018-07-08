import axios from 'axios';
import {
  CONFIG_UPDATE_PACKAGE_BEGIN,
  CONFIG_UPDATE_PACKAGE_SUCCESS,
  CONFIG_UPDATE_PACKAGE_FAILURE,
  CONFIG_UPDATE_PACKAGE_DISMISS_ERROR,
} from './constants';

// Rekit uses redux-thunk for async actions by default: https://github.com/gaearon/redux-thunk
// If you prefer redux-saga, you can use rekit-plugin-redux-saga: https://github.com/supnate/rekit-plugin-redux-saga
export function updatePackage(name) {
  return (dispatch) => { // optionally you can have getState as the second argument
    dispatch({
      type: CONFIG_UPDATE_PACKAGE_BEGIN,
      data: { name },
    });

    // Return a promise so that you could control UI flow without states in the store.
    // For example: after submit a form, you need to redirect the page to another when succeeds or show some errors message if fails.
    // It's hard to use state to manage it, but returning a promise allows you to easily achieve it.
    // e.g.: handleSubmit() { this.props.actions.submitForm(data).then(()=> {}).catch(() => {}); }
    const promise = new Promise((resolve, reject) => {
      // doRequest is a placeholder Promise. You should replace it with your own logic.
      // See the real-word example at:  https://github.com/supnate/rekit/blob/master/src/features/home/redux/fetchRedditReactjsList.js
      // args.error here is only for test coverage purpose.
      // const doRequest = args.error ? Promise.reject(new Error()) : Promise.resolve();
      const doRequest = axios.post('/api/update-package', { name });
      doRequest.then(
        (res) => {
          dispatch({
            type: CONFIG_UPDATE_PACKAGE_SUCCESS,
            data: res.data,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: CONFIG_UPDATE_PACKAGE_FAILURE,
            data: { error: err },
          });
          reject(err);
        },
      );
    });

    return promise;
  };
}

// Async action saves request error by default, this method is used to dismiss the error info.
// If you don't want errors to be saved in Redux store, just ignore this method.
export function dismissUpdatePackageError() {
  return {
    type: CONFIG_UPDATE_PACKAGE_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case CONFIG_UPDATE_PACKAGE_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        [`updatePackage!${action.data.name}`]: true,
        updatePackagePending: true,
        updatePackageError: null,
      };

    case CONFIG_UPDATE_PACKAGE_SUCCESS:
      // The request is success
      return {
        ...state,
        updatePackagePending: false,
        updatePackageError: null,
      };

    case CONFIG_UPDATE_PACKAGE_FAILURE:
      // The request is failed
      return {
        ...state,
        updatePackagePending: false,
        updatePackageError: action.data.error,
      };

    case CONFIG_UPDATE_PACKAGE_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        updatePackageError: null,
      };

    default:
      return state;
  }
}

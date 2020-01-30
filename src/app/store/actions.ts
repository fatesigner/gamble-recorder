/**
 * actions
 */

import { createAction, on, props } from '@ngrx/store';
import { IAction, IActions } from '../public/ng-store';

import { Name } from './name';
import { IPartner, IParty, IState } from './models';
import { GetGUID } from '../public/utils';

// 定义 action types
export const ActionTypes = {
  reset: Name + '/reset',
  postParty: Name + '/postParty',
  removeParty: Name + '/removeParty',
  resetParty: Name + '/resetParty',
  postPartner: Name + '/postPartner',
  removePartner: Name + '/removePartner',
  presentAlert: Name + '/presentAlert'
};

// 定义 action 函数体
export const Actions = {
  reset: createAction(ActionTypes.reset, props<IAction<IState>>()),
  postParty: createAction(ActionTypes.postParty, props<IAction<IParty>>()),
  removeParty: createAction(ActionTypes.removeParty, props<IAction<IParty>>()),
  resetParty: createAction(ActionTypes.resetParty, props<IAction<IParty[]>>()),
  postPartner: createAction(
    ActionTypes.postPartner,
    props<IAction<IPartner>>()
  ),
  removePartner: createAction(
    ActionTypes.removePartner,
    props<IAction<IPartner>>()
  ),
  presentAlert: createAction(
    ActionTypes.presentAlert,
    props<IAction<{ message: string }>>()
  )
};

// 定义 action 逻辑
export const OnActions: IActions = [
  on(Actions.reset, (state: IState, action) => {
    if (action.payload) {
      state = action.payload;
    }
    return state;
  }),
  on(Actions.postParty, (state: IState, action) => {
    if (action.payload.id) {
      const index = state.parties.findIndex(x => x.id === action.payload.id);
      if (index > -1) {
        state.parties[index] = action.payload;
      }
    } else {
      action.payload.id = GetGUID(10).toLowerCase();
      state.parties.push(action.payload);
    }
    return state;
  }),
  on(Actions.removeParty, (state: IState, action) => {
    if (action.payload.id) {
      const index = state.parties.findIndex(x => x.id === action.payload.id);
      if (index > -1) {
        state.parties.splice(index, 1);
      }
    }
    return state;
  }),
  on(Actions.resetParty, (state: IState, action) => {
    state.parties = action.payload;
    return state;
  }),
  on(Actions.postPartner, (state: IState, action) => {
    if (action.payload.id) {
      const index = state.partners.findIndex(x => x.id === action.payload.id);
      if (index > -1) {
        state.partners[index] = action.payload;
      }
    } else {
      action.payload.id = GetGUID(10).toLowerCase();
      state.partners.push(action.payload);
    }
    return state;
  }),
  on(Actions.removePartner, (state: IState, action) => {
    if (action.payload.id) {
      const index = state.partners.findIndex(x => x.id === action.payload.id);
      if (index > -1) {
        state.partners.splice(index, 1);
      }
    }
    return state;
  }),
  on(Actions.presentAlert, (state: IState, action) => {
    return state;
  })
];

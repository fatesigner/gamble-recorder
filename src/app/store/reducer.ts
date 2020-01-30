import { ActionReducer, createReducer, MetaReducer } from '@ngrx/store';

import { environment } from '../../environments/environment';
import { InitialState } from './state';
import { OnActions } from './actions';
import { IState } from './models';

const _appReducer = createReducer(InitialState, ...OnActions);

export function Reducer(state, action) {
  return _appReducer(state, action);
}

export function logger(reducer: ActionReducer<IState>): ActionReducer<IState> {
  // tslint:disable-next-line:only-arrow-functions
  return function(state: IState, action: any): IState {
    console.log('state', state);
    console.log('action', action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<IState>[] = !environment.production
  ? [logger]
  : [];

/**
 * effects
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AlertController } from '@ionic/angular';
import { debounceTime, switchMap, withLatestFrom } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';

import { ActionTypes } from './actions';
import { IStore } from './models';
import { Name } from './name';

@Injectable()
export class Effects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private storage: Storage,
    private alertController: AlertController
  ) {
    this.saveToStorage$.subscribe(x => {});
  }

  presentAlert$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ActionTypes.presentAlert),
        switchMap(async (action: any) => {
          const alert = await this.alertController.create({
            // header: '提示',
            // subHeader: action.payload.message,
            message: action.payload.message,
            buttons: ['确定']
          });
          alert.present();
          return alert;
        })
      ),
    {
      dispatch: false
    }
  );

  saveToStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        debounceTime(1000),
        ofType(...Object.values(ActionTypes)),
        withLatestFrom(this.store$),
        switchMap(([action, state]) => {
          return this.storage.set(Name, state[Name]);
        })
      ),
    {
      dispatch: false
    }
  );
}

/**
 * service
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { fromPromise } from 'rxjs/internal-compatibility';
import { concatMapTo, delay, map, shareReplay, tap } from 'rxjs/operators';

import { Name } from './name';
import { ActionTypes } from './actions';
import { InitialState } from './state';
import { IPartner, IParty, IRecord, IStore } from './models';
import { GetGUID } from '../public/utils';
import { Observable } from 'rxjs';

// 将当前 state 以指定 name 保存到 storage
export const SaveToStorage = (path = ''): MethodDecorator => (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalValue = descriptor.value;
  descriptor.value = function(...args: any[]) {
    const result = originalValue.apply(this, args);
    // target.saveToStorage();
    // this.saveToStorage$.next();
    return result;
  };
};

@Injectable()
export class Service {
  // read data from storage
  state$ = fromPromise(this.storage.get(Name)).pipe(
    tap(stateData => {
      console.log('read data from storage ');
      stateData = stateData || InitialState;
      this.store$.dispatch({ type: ActionTypes.reset, payload: stateData });
      return stateData;
    }),
    delay(500),
    map(x => {
      return x;
    }),
    concatMapTo(this.store$.select(state => state)),
    shareReplay({
      bufferSize: 1,
      refCount: false
    })
  );

  constructor(private store$: Store<IStore>, private storage: Storage) {}

  // 添加测试数据
  getTestRecords$(party: IParty, total = 60): Observable<IParty> {
    return new Observable(subscriber => {
      const getRad = (min, max) => {
        return parseInt(Math.random() * (max - min + 1) + min, 10);
      };

      const getRadArr = (array, length) => {
        const arr = [];
        for (let i = 0; i < length; i++) {
          const num = Math.floor(Math.random() * array.length);
          arr.push(array[num]);
          array.splice(num, 1);
        }
        return arr;
      };

      const records = [];

      const date = new Date('2020-01-25 13:52:00');
      for (let i = 0; i < total; i++) {
        const sums = [];
        let _wins = 0;
        let _winarr = [];
        let _losearr = [];
        _wins = getRad(1, party.partners.length - 1);
        _losearr = Array.from(Array(party.partners.length).keys());
        _winarr = getRadArr(_losearr, _wins);
        console.log('  多少人赢 ' + _wins);
        console.log('  哪些人赢 ' + JSON.stringify(_winarr));
        console.log('  哪些人输 ' + JSON.stringify(_losearr));
        let _winnum = 0;
        _winarr.forEach(i => {
          const d = getRad(6, 57);
          _winnum += d;
          sums.push({
            partner: party.partners[i],
            diff: d
          });
        });
        _losearr.forEach((i, index) => {
          if (index < _losearr.length - 1) {
            const d = getRad(6, _winnum);
            _winnum -= d;
            sums.push({
              partner: party.partners[i],
              diff: -d
            });
          } else {
            sums.push({
              partner: party.partners[i],
              diff: -_winnum
            });
          }
        });

        const record: IRecord = {
          id: GetGUID(10),
          datetime: new Date(date.getTime() + getRad(5, 25) * 60000),
          sums: sums
        };
        records.unshift(record);
      }

      party.records = records;
      subscriber.next(party);
      subscriber.complete();
    });
  }

  @SaveToStorage()
  async resetParty(data: IPartner[]) {
    await this.store$.dispatch({ type: ActionTypes.resetParty, payload: data });
  }

  async postParty(data: IParty) {
    await this.store$.dispatch({ type: ActionTypes.postParty, payload: data });
  }

  async removeParty(data: IParty) {
    await this.store$.dispatch({
      type: ActionTypes.removeParty,
      payload: data
    });
  }

  async removeRecord(data: IRecord, party: IParty) {
    if (party) {
      const index = party.records.findIndex(x => x.id === data.id);
      if (index > -1) {
        party.records.splice(index, 1);
        this.postParty(party);
      }
    }
  }

  async postPartner(partner: IPartner, party?: IParty) {
    if (!partner || !partner.name) {
      throw new Error('信息填写错误');
    }
    if (party) {
      // 查找是否重名
      const index = party.partners.findIndex(x => x.id === partner.id);
      if (index > -1) {
        throw new Error('已添加该牌友');
      } else {
        partner.id = GetGUID(10).toLowerCase();
        party.partners.push(partner);
        // this.store$.dispatch({ type: ActionTypes.postParty, payload: party });
      }
    } else {
      this.store$.dispatch({ type: ActionTypes.postPartner, payload: partner });
    }
  }

  async removePartner(partner: IPartner, party?: IParty) {
    if (party) {
      const index = party.partners.findIndex(x => x.id === partner.id);
      if (index > -1) {
        party.partners.splice(index, 1);
      }
    } else {
      this.store$.dispatch({
        type: ActionTypes.removePartner,
        payload: partner
      });
    }
  }

  async presentAlert(data: { message: string }) {
    await this.store$.dispatch({
      type: ActionTypes.presentAlert,
      payload: data
    });
  }
}

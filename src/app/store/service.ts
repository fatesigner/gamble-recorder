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

      let date = new Date('2020-01-25 13:52:00');
      for (let i = 0; i < total; i++) {
        let sums = [];
        let _wins = 0;
        let _winarr = [];
        let _losearr = [];
        let _zz = -1;
        if (getRad(0, 3) > 0) {
          _zz = getRad(0, party.partners.length - 1);
          console.log(i + ' 谁做庄 ' + _zz);
          _wins = 1;
          if (getRad(0, 5) > 2) {
            console.log('  庄赢 ' + _zz);
            _winarr = [_zz];
            _losearr = Array.from(Array(party.partners.length).keys());
            _losearr.splice(_zz, 1);
          } else {
            console.log('  庄输 ' + _zz);
            _losearr = [_zz];
            _winarr = Array.from(Array(party.partners.length).keys());
            _winarr.splice(_zz, 1);
          }
        } else {
          console.log(i + ' 无人坐庄');
          _wins = getRad(1, party.partners.length - 1);
          _losearr = Array.from(Array(party.partners.length).keys());
          _winarr = getRadArr(_losearr, _wins);
        }
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

        sums = sums.sort((a, b) => {
          return a.partner.name.localeCompare(b.partner.name);
        });

        const _date = new Date(date.getTime() + getRad(5, 25) * 60000);
        date = _date;
        const record: IRecord = {
          id: GetGUID(10),
          datetime: _date,
          banker: party.partners[_zz],
          sums: sums
        };
        records.unshift(record);
      }

      party.records = records;
      subscriber.next(party);
      subscriber.complete();
    });
  }

  // 统计数据
  getTotal(
    party: IParty,
    startDate?,
    endDate?
  ): Observable<{
    total: number;
    count: {
      partner: IPartner;
      bankerNum: number;
      winNum: number;
      diff: number;
    }[];
    dateStart: Date;
    dateEnd: Date;
    latestime: string;
    maxDiff: {
      record: IRecord;
      partner: IPartner;
      diff: number;
    };
    minDiff: {
      record: IRecord;
      partner: IPartner;
      diff: number;
    };
    series: {
      win: {
        partner: IPartner;
        num: number;
      };
      lose: {
        partner: IPartner;
        num: number;
      };
    };
  }> {
    return new Observable(subscriber => {
      if (party.records.length) {
        const data = {
          total: 0,
          count: [],
          dateStart: null,
          dateEnd: null,
          latestime: '',
          maxDiff: null,
          minDiff: null,
          series: {
            win: null,
            lose: null
          }
        };
        let total = 0;
        // 获取叫庄、输赢次数
        const res: any = party.records.reduce(
          (tmp, cur, index) => {
            cur.datetime.setMilliseconds(0);
            const times = cur.datetime.getTime();
            // 过滤起始时间
            if (startDate && times < new Date(startDate).getTime()) {
              return tmp;
            }
            if (endDate && new Date(endDate).getTime() < times) {
              return tmp;
            }
            if (cur.banker) {
              if (tmp.sums[cur.banker.name]) {
                tmp.sums[cur.banker.name].bankerNum += 1;
              } else {
                tmp.sums[cur.banker.name] = {
                  partner: cur.banker,
                  bankerNum: 1,
                  winNum: 0,
                  diff: 0,
                  swinNum: 0,
                  sloseNum: 0
                };
              }
            }
            tmp = cur.sums.reduce((tmp2, cur2) => {
              if (tmp2.sums[cur2.partner.name]) {
                tmp2.sums[cur2.partner.name].diff += cur2.diff;
                tmp2.sums[cur2.partner.name].winNum += cur2.diff >= 0 ? 1 : 0;
                if (cur2.diff > 0) {
                  tmp2.sums[cur2.partner.name].swinNum += 1;
                  if (
                    tmp2.sums[cur2.partner.name].sloseNum > tmp2.series.lose.num
                  ) {
                    tmp2.series.lose.num =
                      tmp2.sums[cur2.partner.name].sloseNum;
                    tmp2.series.lose.partner = cur2.partner;
                  } else {
                    tmp2.sums[cur2.partner.name].sloseNum = 0;
                  }
                  if (index === party.records.length - 1) {
                    if (
                      tmp2.sums[cur2.partner.name].swinNum > tmp2.series.win.num
                    ) {
                      tmp2.series.win.num =
                        tmp2.sums[cur2.partner.name].swinNum;
                      tmp2.series.win.partner = cur2.partner;
                    } else {
                      tmp2.sums[cur2.partner.name].swinNum = 0;
                    }
                  }
                } else {
                  tmp2.sums[cur2.partner.name].sloseNum += 1;
                  if (
                    tmp2.sums[cur2.partner.name].swinNum > tmp2.series.win.num
                  ) {
                    tmp2.series.win.num = tmp2.sums[cur2.partner.name].swinNum;
                    tmp2.series.win.partner = cur2.partner;
                  } else {
                    tmp2.sums[cur2.partner.name].swinNum = 0;
                  }
                  if (index === party.records.length - 1) {
                    if (
                      tmp2.sums[cur2.partner.name].sloseNum >
                      tmp2.series.lose.num
                    ) {
                      tmp2.series.lose.num =
                        tmp2.sums[cur2.partner.name].sloseNum;
                      tmp2.series.lose.partner = cur2.partner;
                    } else {
                      tmp2.sums[cur2.partner.name].sloseNum = 0;
                    }
                  }
                }
              } else {
                tmp2.sums[cur2.partner.name] = {
                  partner: cur2.partner,
                  bankerNum: 0,
                  winNum: cur2.diff > 0 ? 1 : 0,
                  diff: cur2.diff,
                  swinNum: cur2.diff > 0 ? 1 : 0,
                  sloseNum: cur2.diff < 0 ? 1 : 0
                };
              }
              if (!tmp.maxDiff || cur2.diff > tmp.maxDiff.diff) {
                tmp.maxDiff = cur2;
                tmp.maxDiff.record = cur;
              }
              if (!tmp.minDiff || cur2.diff < tmp.minDiff.diff) {
                tmp.minDiff = cur2;
                tmp.minDiff.record = cur;
              }
              return tmp2;
            }, tmp);
            total++;
            return tmp;
          },
          {
            sums: {},
            maxDiff: null,
            minDiff: null,
            series: {
              win: {
                partner: null,
                num: 1
              },
              lose: {
                partner: null,
                num: 1
              }
            }
          }
        );
        const arr: any = Object.values(res.sums);
        data.total = total;
        data.count = arr.sort((a: any, b: any) =>
          a.diff > b.diff ? -1 : b.diff > a.diff ? 1 : 0
        );
        data.maxDiff = res.maxDiff;
        data.minDiff = res.minDiff;
        data.series = res.series;

        // 持续时长
        const date1 = party.records[
          party.records.length - 1
        ].datetime.getTime();
        const date2 = party.records[0].datetime.getTime();
        const diffTime = Math.abs(date1 - date2);
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          ((diffTime % (1000 * 60 * 60 * 24)) % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor(
          (((diffTime % (1000 * 60 * 60 * 24)) % (1000 * 60 * 60)) %
            (1000 * 60)) /
            1000
        );
        data.latestime =
          (days ? `${days}天` : '') +
          (hours ? `${hours}小时` : '') +
          (minutes ? `${minutes}分钟` : '') +
          (seconds ? `${seconds}秒` : '');
        subscriber.next(data);
        subscriber.complete();
      }
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

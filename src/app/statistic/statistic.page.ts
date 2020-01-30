import { Component, OnInit } from '@angular/core';
import { CreateBehaviorObservableData } from '../public/rxjs-utils';
import { concatMap, map } from 'rxjs/operators';
import { IPartner, IParty } from '../store/models';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import * as AppStore from '../store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.page.html',
  styleUrls: ['./statistic.page.scss']
})
export class StatisticPage implements OnInit {
  party = CreateBehaviorObservableData(
    this.route.params.pipe(
      concatMap(params =>
        this.appStoreService.state$.pipe(
          map(
            (state): IParty => {
              return state.applicationState.parties.find(
                x => x.id === params.id
              );
            }
          )
        )
      ),
      concatMap(parties => this.getTotal(parties))
    )
  );

  Math = Math;

  data: {
    count: {
      partner: IPartner;
      winNum: number;
      diff: number;
    }[];
    dateStart: Date;
    dateEnd: Date;
    latestime: string;
    maxDiff: {
      partner: IPartner;
      diff: number;
    };
    minDiff: {
      partner: IPartner;
      diff: number;
    };
  } = {
    count: [],
    dateStart: null,
    dateEnd: null,
    latestime: '',
    maxDiff: null,
    minDiff: null
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private storage: Storage,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {
    // 初始化数据
    this.party.reload();
  }

  getTotal(party: IParty): Observable<IParty> {
    return new Observable(subscriber => {
      if (party.records.length) {
        // 获取输赢次数
        const res: any = party.records.reduce(
          (tmp, cur) => {
            tmp = cur.sums.reduce((tmp2, cur2) => {
              if (tmp2.sums[cur2.partner.name]) {
                tmp2.sums[cur2.partner.name].diff += cur2.diff;
                tmp2.sums[cur2.partner.name].winNum += cur2.diff >= 0 ? 1 : 0;
              } else {
                tmp2.sums[cur2.partner.name] = {
                  partner: cur2.partner,
                  winNum: cur2.diff >= 0 ? 1 : 0,
                  diff: cur2.diff
                };
              }
              if (!tmp.maxDiff || cur2.diff > tmp.maxDiff.diff) {
                tmp.maxDiff = cur2;
              }
              if (!tmp.minDiff || cur2.diff < tmp.minDiff.diff) {
                tmp.minDiff = cur2;
              }
              return tmp2;
            }, tmp);

            return tmp;
          },
          {
            sums: {},
            maxDiff: null,
            minDiff: null
          }
        );
        const arr: any = Object.values(res.sums);
        this.data.count = arr.sort((a: any, b: any) =>
          a.diff > b.diff ? -1 : b.diff > a.diff ? 1 : 0
        );
        this.data.maxDiff = res.maxDiff;
        this.data.minDiff = res.minDiff;

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
        this.data.latestime =
          (days ? `${days}天` : '') +
          (hours ? `${hours}小时` : '') +
          (minutes ? `${minutes}分钟` : '') +
          (seconds ? `${seconds}秒` : '');
      }
      subscriber.next(party);
      subscriber.complete();
    });
  }
}

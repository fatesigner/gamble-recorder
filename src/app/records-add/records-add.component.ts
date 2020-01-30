import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import _ from 'lodash';

import { IParty, IRecord } from '../store/models';
import * as AppStore from '../store';
import { GetGUID } from '../public/utils';

@Component({
  selector: 'app-records-add',
  templateUrl: './records-add.component.html',
  styleUrls: ['./records-add.component.scss']
})
export class RecordsAddComponent implements OnInit {
  @Input() public party: IParty;

  selectedWinman: string[] = [];

  get totalDiff() {
    return this.record.sums.reduce(
      (num, cur) => {
        if (this.selectedWinman.indexOf(cur.partner.id) > -1) {
          num.add += cur.diff;
        } else {
          num.minus += cur.diff;
        }
        return num;
      },
      {
        add: 0,
        minus: 0
      }
    );
  }

  countSelections = Array.from(Array(50).keys());

  record: IRecord = {
    id: '',
    datetime: null,
    sums: []
  };

  onDiffInputChange$ = new Subject();

  constructor(
    private modalController: ModalController,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {
    this.record.sums = this.party.partners.map(x => {
      return {
        partner: x,
        diff: null
      };
    });
    this.onDiffInputChange$.pipe(debounceTime(100)).subscribe(() => {
      const num = this.record.sums.reduce((prev, cur) => {
        if (this.selectedWinman.indexOf(cur.partner.id) > -1) {
          return prev;
        } else {
          const diff = cur.diff ? parseInt(cur.diff.toString(), 10) : 0;
          return prev + diff;
        }
      }, 0);
      const s = this.record.sums.find(
        x => this.selectedWinman.indexOf(x.partner.id) > -1
      );
      s.diff = num;
    });
  }

  submit() {
    // 验证
    if (this.selectedWinman.length >= this.party.partners.length) {
      return this.appStoreService.presentAlert({
        message: '没有输家的嘛，这样的牌局请叫上我呀！0.0'
      });
    }
    if (!this.record.sums.every(item => !!item.diff)) {
      return this.appStoreService.presentAlert({
        message: '部分信息未填写完整'
      });
    }
    if (this.totalDiff.add - this.totalDiff.minus !== 0) {
      return this.appStoreService.presentAlert({
        message: '输赢数不相等'
      });
    }
    const record: IRecord = _.merge({}, _.cloneDeep(this.record), {
      id: GetGUID(10),
      datetime: new Date()
    });
    record.sums.forEach(cur => {
      if (this.selectedWinman.indexOf(cur.partner.id) < 0) {
        cur.diff = -cur.diff;
      }
    });
    record.sums = record.sums.sort((a: any, b: any) =>
      a.diff > b.diff ? -1 : b.diff > a.diff ? 1 : 0
    );
    this.party.records.unshift(record);
    this.appStoreService.postParty(this.party);
    this.closeModal();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}

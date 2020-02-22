import { Component, OnInit } from '@angular/core';
import { CreateBehaviorObservableData } from '../public/rxjs-utils';
import { concatMap, map } from 'rxjs/operators';
import { IParty } from '../store/models';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

import * as AppStore from '../store';
import { RecordComponent } from '../record/record.component';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.page.html',
  styleUrls: ['./statistic.page.scss']
})
export class StatisticPage implements OnInit {
  datasource = CreateBehaviorObservableData(
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
      concatMap((party: IParty) => {
        if (!this.startDate.value) {
          this.startDate.value = this.datePipe.transform(
            party.records[party.records.length - 1].datetime,
            'yyyy-MM-dd HH:mm:ss'
          );
          this.endData.value = this.datePipe.transform(
            party.records[0].datetime,
            'yyyy-MM-dd HH:mm:ss'
          );
          this.endData.min = this.startDate.min =
            party.records[party.records.length - 1].datetime;
          this.endData.min = this.startDate.min =
            party.records[party.records.length - 1].datetime;
          this.endData.max = this.startDate.max = party.records[0].datetime;
        }
        return this.appStoreService
          .getTotal(party, this.startDate.value, this.endData.value)
          .pipe(
            map(x => {
              return {
                party: party,
                stats: x
              };
            })
          );
      })
    )
  );

  Math = Math;

  startDate = {
    value: null,
    min: null,
    max: null
  };

  endData = {
    value: null,
    min: null,
    max: null
  };

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private storage: Storage,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {
    // 初始化数据
    this.datasource.reload();
  }

  startDateChanged() {
    // 设置结束时间的 min
    this.endData.min = this.startDate.value;
    this.datasource.reload();
  }

  endDateChanged() {
    // 设置起始时间的 max
    this.startDate.max = this.endData.value;
    this.datasource.reload();
  }

  async showRecordModal(record) {
    const modal = await this.modalController.create({
      component: RecordComponent,
      componentProps: {
        record: record
      }
    });
    await modal.present();
  }
}

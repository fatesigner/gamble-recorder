import { Component, OnInit } from '@angular/core';
import { concatMap, map } from 'rxjs/operators';
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';

import * as AppStore from '../store';
import { CreateBehaviorObservableData } from '../public/rxjs-utils';
import { RecordsAddComponent } from '../records-add/records-add.component';
import { IRecord } from '../store/models';
import { GetGUID } from '../public/utils';

@Component({
  selector: 'app-records',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss']
})
export class RecordsPage implements OnInit {
  party = CreateBehaviorObservableData(
    this.route.params.pipe(
      concatMap(params =>
        this.appStoreService.state$.pipe(
          map(state => {
            const s = state.applicationState.parties.find(
              x => x.id === params.id
            );
            if (!s) {
              throw new Error('数据发生错误');
            }
            return s;
          })
        )
      )
      // concatMap(parties => this.appStoreService.getTestRecords$(parties, 123))
    )
  );

  constructor(
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private storage: Storage,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.party.reload().catch(() => {});
  }

  trackBy(index, item) {
    return item ? item.id : index;
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '设置',
      buttons: [
        {
          text: '添加',
          icon: 'add',
          handler: () => {
            this.presentAddModal();
          }
        },
        {
          text: '合并',
          icon: 'cube',
          handler: async () => {
            const alert = await this.alertController.create({
              header: '合并记录',
              message: '合并后，将会把所有数据合并为一条！确认合并？',
              buttons: [
                {
                  text: '取消',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {}
                },
                {
                  text: '确定',
                  handler: async () => {
                    const sums = await this.appStoreService
                      .getTotal(this.party.value)
                      .pipe(
                        map(x => {
                          return x.count.map(y => {
                            return {
                              partner: y.partner,
                              diff: y.diff
                            };
                          });
                        })
                      )
                      .toPromise();

                    const record: IRecord = {
                      id: GetGUID(10),
                      datetime: new Date(),
                      banker: null,
                      sums
                    };

                    this.party.value.records = [record];
                    this.appStoreService.postParty(this.party.value);
                  }
                }
              ]
            });
            alert.present();
          }
        },
        {
          text: '更新',
          icon: 'create',
          handler: () => {
            this.router.navigate(['/party/' + this.party.value.id]);
          }
        },
        {
          text: '统计',
          icon: 'clipboard',
          handler: () => {
            this.router.navigate(['/statistic/' + this.party.value.id]);
          }
        },
        {
          text: '取消',
          icon: 'close',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    await actionSheet.present();
  }

  async presentAddModal() {
    const modal = await this.modalController.create({
      component: RecordsAddComponent,
      componentProps: {
        party: this.party.value
      }
    });
    await modal.present();
  }

  async remove(record) {
    const alert = await this.alertController.create({
      header: '提示',
      message: '确认删除该记录？',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },
        {
          text: '确定',
          handler: () => {
            this.appStoreService.removeRecord(record, this.party.value);
          }
        }
      ]
    });
    await alert.present();
  }
}

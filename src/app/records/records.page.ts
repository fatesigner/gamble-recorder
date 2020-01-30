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
      // concatMap(parties => this.appStoreService.getTestRecords$(parties, 12))
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
    this.party.reload().catch(x => {});
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '设置',
      buttons: [
        {
          text: '更新',
          icon: 'create',
          handler: () => {
            this.router.navigate(['/party/' + this.party.value.id]);
          }
        },
        {
          text: '统计',
          icon: 'paper-plane',
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

  async presentModal() {
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

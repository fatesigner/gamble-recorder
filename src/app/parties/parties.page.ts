import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { map } from 'rxjs/operators';

import * as AppStore from '../store';
import { CreateBehaviorObservableData } from '../public/rxjs-utils';

@Component({
  selector: 'app-parties',
  templateUrl: './parties.page.html',
  styleUrls: ['./parties.page.scss']
})
export class PartiesPage implements OnInit {
  parties = CreateBehaviorObservableData(
    this.appStoreService.state$.pipe(map(x => x.applicationState.parties))
  );

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {
    this.parties.reload();
  }

  async remove(item) {
    const alert = await this.alertController.create({
      header: '提示',
      message: '确认删除该牌局？',
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
            this.appStoreService.removeParty(item);
          }
        }
      ]
    });
    await alert.present();
  }
}

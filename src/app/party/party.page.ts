import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { concatMap, delay, map } from 'rxjs/operators';

import { IParty } from '../store/models';
import * as AppStore from '../store';
import { CreateBehaviorObservableData } from '../public/rxjs-utils';

@Component({
  selector: 'app-party',
  templateUrl: './party.page.html',
  styleUrls: ['./party.page.scss']
})
export class PartyPage implements OnInit {
  party = CreateBehaviorObservableData(
    this.route.params.pipe(
      concatMap(params =>
        this.appStoreService.state$.pipe(
          map(
            (state): IParty => {
              return (
                state.applicationState.parties.find(
                  x => x.id === params.id
                ) || {
                  id: '',
                  title: '牌局' + (state.applicationState.parties.length + 1),
                  datetime: new Date(),
                  partners: [],
                  records: []
                }
              );
            }
          )
        )
      )
    ),
    {
      duplicate: true
    }
  );

  constructor(
    private router: Router,
    private alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private storage: Storage,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.party.reload().catch(x => {});
  }

  // 更新
  update() {
    if (this.party.value.partners.length < 2) {
      return this.appStoreService.presentAlert({
        message: '请至少添加两位牌友'
      });
    }
    if (!this.party.value.title) {
      return this.appStoreService.presentAlert({ message: '请填写牌局名称' });
    }
    this.appStoreService
      .postParty(this.party.value)
      .then(() =>
        this.router.navigate(['/records/' + this.party.value.id], {
          replaceUrl: true
        })
      )
      .catch(err =>
        this.appStoreService.presentAlert({ message: err.message })
      );
  }

  async postPartner() {
    const alert = await this.alertController.create({
      header: '添加牌友',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: '填写姓名'
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: '确定',
          handler: (inputs: any) => {
            this.appStoreService
              .postPartner(
                {
                  id: '',
                  name: inputs.name,
                  balance: 0
                },
                this.party.value
              )
              .catch(err =>
                this.appStoreService.presentAlert({ message: err.message })
              );
          }
        }
      ]
    });

    await alert.present();
  }

  async removeParter(item) {
    this.appStoreService
      .removePartner(item, this.party.value)
      .catch(err =>
        this.appStoreService.presentAlert({ message: err.message })
      );
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as AppStore from '../store';
import { IRecord } from '../store/models';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {
  @Input() public record: IRecord;

  constructor(
    private modalController: ModalController,
    private appStoreService: AppStore.Service
  ) {}

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }
}

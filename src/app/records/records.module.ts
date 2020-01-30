import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordsPageRoutingModule } from './records-routing.module';

import { RecordsPage } from './records.page';
import { RecordsAddComponent } from '../records-add/records-add.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RecordsPageRoutingModule],
  entryComponents: [RecordsAddComponent],
  declarations: [RecordsPage, RecordsAddComponent]
})
export class RecordsPageModule {}

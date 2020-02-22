import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatisticPageRoutingModule } from './statistic-routing.module';

import { StatisticPage } from './statistic.page';
import { RecordComponent } from '../record/record.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, StatisticPageRoutingModule],
  entryComponents: [RecordComponent],
  providers: [DatePipe],
  declarations: [StatisticPage, RecordComponent]
})
export class StatisticPageModule {}

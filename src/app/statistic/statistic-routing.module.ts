import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatisticPage } from './statistic.page';

const routes: Routes = [
  {
    path: '',
    component: StatisticPage
  },
  {
    path: ':id',
    component: StatisticPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticPageRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PartyPage } from './party.page';

const routes: Routes = [
  {
    path: '',
    component: PartyPage
  },
  {
    path: ':id',
    component: PartyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartyPageRoutingModule {}

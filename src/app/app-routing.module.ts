import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'parties',
    pathMatch: 'full'
  },
  {
    path: 'parties',
    loadChildren: () =>
      import('./parties/parties.module').then(m => m.PartiesPageModule)
  },
  {
    path: 'party',
    loadChildren: () =>
      import('./party/party.module').then(m => m.PartyPageModule)
  },
  {
    path: 'records',
    loadChildren: () =>
      import('./records/records.module').then(m => m.RecordsPageModule)
  },
  {
    path: 'statistic',
    loadChildren: () =>
      import('./statistic/statistic.module').then(m => m.StatisticPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

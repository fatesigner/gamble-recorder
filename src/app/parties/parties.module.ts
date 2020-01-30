import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartiesPageRoutingModule } from './parties-routing.module';

import { PartiesPage } from './parties.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PartiesPageRoutingModule],
  declarations: [PartiesPage]
})
export class PartiesPageModule {}

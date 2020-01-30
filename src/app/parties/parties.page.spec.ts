import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartiesPage } from './parties.page';

describe('PartiesPage', () => {
  let component: PartiesPage;
  let fixture: ComponentFixture<PartiesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PartiesPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

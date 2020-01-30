import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecordsPage } from './records.page';

describe('RecordsPage', () => {
  let component: RecordsPage;
  let fixture: ComponentFixture<RecordsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

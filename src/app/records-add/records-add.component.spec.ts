import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecordsAddComponent } from './records-add.component';

describe('RecordsAddComponent', () => {
  let component: RecordsAddComponent;
  let fixture: ComponentFixture<RecordsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsAddComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

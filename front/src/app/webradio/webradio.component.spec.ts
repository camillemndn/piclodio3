import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WebradioComponent } from './webradio.component';

describe('WebradioComponent', () => {
  let component: WebradioComponent;
  let fixture: ComponentFixture<WebradioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WebradioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebradioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

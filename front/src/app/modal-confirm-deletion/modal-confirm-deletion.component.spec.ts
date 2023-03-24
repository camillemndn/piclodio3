import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalConfirmDeletionComponent } from './modal-confirm-deletion.component';

describe('ModalConfirmDeletionComponent', () => {
  let component: ModalConfirmDeletionComponent;
  let fixture: ComponentFixture<ModalConfirmDeletionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmDeletionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmDeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

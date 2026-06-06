import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTypeDialog } from './order-type-dialog';

describe('OrderTypeDialog', () => {
  let component: OrderTypeDialog;
  let fixture: ComponentFixture<OrderTypeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderTypeDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypeDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

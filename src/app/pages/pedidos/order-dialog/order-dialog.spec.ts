import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDialog } from './order-dialog';

describe('OrderDialog', () => {
  let component: OrderDialog;
  let fixture: ComponentFixture<OrderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTypes } from './order-types';

describe('OrderTypes', () => {
  let component: OrderTypes;
  let fixture: ComponentFixture<OrderTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

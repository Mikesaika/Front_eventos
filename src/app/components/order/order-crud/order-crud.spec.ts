import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCrud } from './order-crud';

describe('OrderCrud', () => {
  let component: OrderCrud;
  let fixture: ComponentFixture<OrderCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

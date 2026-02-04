import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCrud } from './services-crud';

describe('ServicesCrud', () => {
  let component: ServicesCrud;
  let fixture: ComponentFixture<ServicesCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

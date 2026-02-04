import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReutilizable } from './table-reutilizable';

describe('TableReutilizable', () => {
  let component: TableReutilizable;
  let fixture: ComponentFixture<TableReutilizable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableReutilizable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableReutilizable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

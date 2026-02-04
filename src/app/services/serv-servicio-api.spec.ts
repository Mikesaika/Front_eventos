import { TestBed } from '@angular/core/testing';

import { ServServicioApi } from './serv-servicio-api';

describe('ServServicioApi', () => {
  let service: ServServicioApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServServicioApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

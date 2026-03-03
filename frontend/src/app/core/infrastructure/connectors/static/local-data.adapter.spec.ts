import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LocalDataAdapter } from './local-data.adapter';
import { AschenbachCompendium } from './static-data.types';
import { ConnectorError } from '../common/connector.types';

describe('LocalDataAdapter', () => {
  let service: LocalDataAdapter;
  let httpMock: HttpTestingController;

  const mockCompendium: AschenbachCompendium = {
    monster: [
      { name: 'Beholder', meta: 'Large aberration' } as any,
      { name: 'Ancient Red Dragon', meta: 'Gargantuan dragon' } as any,
    ],
    spell: [{ name: 'Fireball', level: '3rd-level' } as any],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalDataAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LocalDataAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load monster from static data', (done) => {
    service.getMonster('beholder').subscribe((resource) => {
      expect(resource.name).toBe('Beholder');
      expect(resource.index).toBe('beholder');
      done();
    });

    const req = httpMock.expectOne('assets/data/srd/5e-SRD.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockCompendium);
  });

  it('should load spell from static data', (done) => {
    service.getSpell('fireball').subscribe((resource) => {
      expect(resource.name).toBe('Fireball');
      expect(resource.index).toBe('fireball');
      done();
    });

    const req = httpMock.expectOne('assets/data/srd/5e-SRD.json');
    req.flush(mockCompendium);
  });

  it('should throw error if monster not found', (done) => {
    service.getMonster('tarrasque').subscribe({
      error: (error: ConnectorError) => {
        expect(error.message).toContain('tarrasque');
        done();
      },
    });

    const req = httpMock.expectOne('assets/data/srd/5e-SRD.json');
    req.flush(mockCompendium);
  });

  it('should share replay the compendium loading', () => {
    service.getMonster('beholder').subscribe();
    service.getSpell('fireball').subscribe();

    // Solo debe haber una petición HTTP por el shareReplay
    const req = httpMock.expectOne('assets/data/srd/5e-SRD.json');
    req.flush(mockCompendium);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DndApiService } from './dnd-api';
import { AppStateService } from '../../../../core/services/app-state/app';

describe('DndApiService', () => {
  let service: DndApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DndApiService,
        AppStateService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DndApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

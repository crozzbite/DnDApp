import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DndApiService } from '../../services/dnd/dnd-api';
import { AppStateService } from '../../../../core/services/app-state/app';
import { BuscadorComponent } from './buscador';

describe('BuscadorComponent', () => {
  let component: BuscadorComponent;
  let fixture: ComponentFixture<BuscadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorComponent],
      providers: [
        DndApiService,
        AppStateService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

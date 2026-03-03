import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppStateService } from '../../../../core/services/app-state/app';
import { FiltradorComponent } from './filtrador';

describe('FiltradorComponent', () => {
  let component: FiltradorComponent;
  let fixture: ComponentFixture<FiltradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltradorComponent],
      providers: [
        AppStateService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

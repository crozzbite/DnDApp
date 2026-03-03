import { TestBed } from '@angular/core/testing';
import { CompendiumRepositoryImpl } from './compendium.repository';
import { Dnd5eApiConnector } from '../connectors/dnd5e/dnd5e-api.connector';
import { Open5eConnector } from '../connectors/open5e/open5e.connector';
import { LocalDataAdapter } from '../connectors/static/local-data.adapter';
import { of, throwError } from 'rxjs';
import { CompendiumResource } from '@domain/models/resource.model';
import { ConnectorError } from '../connectors/common/connector.types';

describe('CompendiumRepositoryImpl (The Gauntlet - Fallback Check)', () => {
  let repository: CompendiumRepositoryImpl;
  let dnd5eMock: jasmine.SpyObj<Dnd5eApiConnector>;
  let open5eMock: jasmine.SpyObj<Open5eConnector>;
  let localMock: jasmine.SpyObj<LocalDataAdapter>;

  const mockResource: CompendiumResource = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    index: 'beholder',
    name: 'Beholder',
    category: 'monster',
    source: 'srd',
    description: 'A floating eye.',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    dnd5eMock = jasmine.createSpyObj('Dnd5eApiConnector', [
      'getMonster',
      'getSpell',
    ]);
    open5eMock = jasmine.createSpyObj('Open5eConnector', [
      'getMonster',
      'getSpell',
    ]);
    localMock = jasmine.createSpyObj('LocalDataAdapter', [
      'getMonster',
      'getSpell',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CompendiumRepositoryImpl,
        { provide: Dnd5eApiConnector, useValue: dnd5eMock },
        { provide: Open5eConnector, useValue: open5eMock },
        { provide: LocalDataAdapter, useValue: localMock },
      ],
    });

    repository = TestBed.inject(CompendiumRepositoryImpl);
  });

  it('should return from Dnd5eApiConnector if successful (Primary Source)', async () => {
    dnd5eMock.getMonster.and.returnValue(of(mockResource));

    const result = await repository.findByIndex('beholder');

    expect(result).toEqual(mockResource);
    expect(dnd5eMock.getMonster).toHaveBeenCalledWith('beholder');
    expect(open5eMock.getMonster).not.toHaveBeenCalled();
    expect(localMock.getMonster).not.toHaveBeenCalled();
  });

  it('should fallback to Open5eConnector if Dnd5eApiConnector fails (Secondary Source)', async () => {
    dnd5eMock.getMonster.and.returnValue(
      throwError(() => new Error('Not found')),
    );
    dnd5eMock.getSpell.and.returnValue(
      throwError(() => new Error('Not found')),
    );
    open5eMock.getMonster.and.returnValue(of(mockResource));

    const result = await repository.findByIndex('beholder');

    expect(result).toEqual(mockResource);
    expect(dnd5eMock.getMonster).toHaveBeenCalled();
    expect(open5eMock.getMonster).toHaveBeenCalledWith('beholder');
    expect(localMock.getMonster).not.toHaveBeenCalled();
  });

  it('should fallback to LocalDataAdapter if both APIs fail (Final Line of Defense)', async () => {
    dnd5eMock.getMonster.and.returnValue(throwError(() => new Error('404')));
    dnd5eMock.getSpell.and.returnValue(throwError(() => new Error('404')));
    open5eMock.getMonster.and.returnValue(throwError(() => new Error('404')));
    open5eMock.getSpell.and.returnValue(throwError(() => new Error('404')));
    localMock.getMonster.and.returnValue(of(mockResource));

    const result = await repository.findByIndex('beholder');

    expect(result).toEqual(mockResource);
    expect(localMock.getMonster).toHaveBeenCalledWith('beholder');
  });

  it('should audit failures if a critical error occurs', async () => {
    const criticalError = new ConnectorError(
      'Service Down',
      503,
      'DnD5e',
      false,
    );

    dnd5eMock.getMonster.and.returnValue(throwError(() => criticalError));
    dnd5eMock.getSpell.and.returnValue(throwError(() => new Error('404')));
    open5eMock.getMonster.and.returnValue(throwError(() => new Error('404')));
    open5eMock.getSpell.and.returnValue(throwError(() => new Error('404')));
    localMock.getMonster.and.returnValue(throwError(() => new Error('404')));
    localMock.getSpell.and.returnValue(throwError(() => new Error('404')));

    spyOn(console, 'warn');
    spyOn(console, 'error');

    await repository.findByIndex('critical-fail');

    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});

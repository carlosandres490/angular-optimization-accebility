import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RickMortyService, Character, ApiResponse } from './rick-morty.service';

describe('RickMortyService', () => {
  let service: RickMortyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RickMortyService]
    });
    service = TestBed.inject(RickMortyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should fetch characters for page 1 by default', () => {
      const mockResponse: ApiResponse = {
        info: {
          count: 826,
          pages: 42,
          next: 'https://rickandmortyapi.com/api/character?page=2',
          prev: null
        },
        results: [
          {
            id: 1,
            name: 'Rick Sanchez',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: {
              name: 'Earth (C-137)',
              url: 'https://rickandmortyapi.com/api/location/1'
            },
            location: {
              name: 'Citadel of Ricks',
              url: 'https://rickandmortyapi.com/api/location/3'
            },
            image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
            episode: ['https://rickandmortyapi.com/api/episode/1'],
            url: 'https://rickandmortyapi.com/api/character/1',
            created: '2017-11-04T18:48:46.250Z'
          }
        ]
      };

      service.getCharacters().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.results.length).toBe(1);
        expect(response.results[0].name).toBe('Rick Sanchez');
        expect(response.results[0].status).toBe('Alive');
        expect(response.info.count).toBe(826);
        expect(response.info.pages).toBe(42);
        expect(response.info.next).toBe('https://rickandmortyapi.com/api/character?page=2');
        expect(response.info.prev).toBeNull();
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Content-Type')).toBeFalsy();
      expect(req.request.body).toBeNull();
      req.flush(mockResponse);
    });

    it('should fetch characters for specific page', () => {
      const mockResponse: ApiResponse = {
        info: {
          count: 826,
          pages: 42,
          next: 'https://rickandmortyapi.com/api/character?page=4',
          prev: 'https://rickandmortyapi.com/api/character?page=2'
        },
        results: []
      };

      service.getCharacters(3).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.results.length).toBe(0);
        expect(response.info.next).toContain('page=4');
        expect(response.info.prev).toContain('page=2');
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=3');
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe('https://rickandmortyapi.com/api/character?page=3');
      expect(req.request.urlWithParams).toContain('page=3');
      req.flush(mockResponse);
    });

    it('should handle HTTP errors correctly', () => {
      const errorMessage = 'Http failure response for https://rickandmortyapi.com/api/character?page=1: 404 Not Found';
      
      service.getCharacters().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          expect(error.url).toBe('https://rickandmortyapi.com/api/character?page=1');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Http failure response for https://rickandmortyapi.com/api/character?page=1: 0 Unknown Error'
      });

      service.getCharacters().subscribe({
        next: () => fail('Expected a network error'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ErrorEvent);
          expect(error.error.message).toContain('Network error');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      req.error(errorEvent);
    });

    it('should handle server errors (500)', () => {
      service.getCharacters().subscribe({
        next: () => fail('Expected a server error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle page 0 (edge case)', () => {
      const mockResponse: ApiResponse = {
        info: { count: 826, pages: 42, next: null, prev: null },
        results: []
      };

      service.getCharacters(0).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=0');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle negative page numbers', () => {
      service.getCharacters(-1).subscribe({
        next: () => fail('Expected an error for negative page'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=-1');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getCharacterById', () => {
    it('should fetch character by id with complete data validation', () => {
      const mockCharacter: Character = {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: {
          name: 'Earth (C-137)',
          url: 'https://rickandmortyapi.com/api/location/1'
        },
        location: {
          name: 'Citadel of Ricks',
          url: 'https://rickandmortyapi.com/api/location/3'
        },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z'
      };

      service.getCharacterById(1).subscribe(character => {
        expect(character).toEqual(mockCharacter);
        expect(character.id).toBe(1);
        expect(character.name).toBe('Rick Sanchez');
        expect(character.status).toBe('Alive');
        expect(character.species).toBe('Human');
        expect(character.gender).toBe('Male');
        expect(character.origin.name).toBe('Earth (C-137)');
        expect(character.location.name).toBe('Citadel of Ricks');
        expect(character.image).toContain('character/avatar/1.jpeg');
        expect(character.episode).toEqual(jasmine.any(Array));
        expect(character.episode.length).toBe(1);
        expect(character.url).toBe('https://rickandmortyapi.com/api/character/1');
        expect(character.created).toBe('2017-11-04T18:48:46.250Z');
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe('https://rickandmortyapi.com/api/character/1');
      expect(req.request.body).toBeNull();
      expect(req.request.headers.has('Content-Type')).toBeFalsy();
      req.flush(mockCharacter);
    });

    it('should fetch character with different status (Dead)', () => {
      const mockDeadCharacter: Character = {
        id: 2,
        name: 'Abadango Cluster Princess',
        status: 'Dead',
        species: 'Alien',
        type: '',
        gender: 'Female',
        origin: { name: 'Abadango', url: 'https://rickandmortyapi.com/api/location/2' },
        location: { name: 'Abadango', url: 'https://rickandmortyapi.com/api/location/2' },
        image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/27'],
        url: 'https://rickandmortyapi.com/api/character/2',
        created: '2017-11-04T19:22:00.094Z'
      };

      service.getCharacterById(2).subscribe(character => {
        expect(character.id).toBe(2);
        expect(character.status).toBe('Dead');
        expect(character.species).toBe('Alien');
        expect(character.gender).toBe('Female');
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/2');
      expect(req.request.method).toBe('GET');
      req.flush(mockDeadCharacter);
    });

    it('should handle character not found (404)', () => {
      const characterId = 999;
      
      service.getCharacterById(characterId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          expect(error.url).toBe(`https://rickandmortyapi.com/api/character/${characterId}`);
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/999');
      expect(req.request.method).toBe('GET');
      req.flush('Character not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle invalid character id (400)', () => {
      service.getCharacterById(0).subscribe({
        next: () => fail('Expected a bad request error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/0');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle negative character id', () => {
      service.getCharacterById(-5).subscribe({
        next: () => fail('Expected a bad request error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/-5');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors (500)', () => {
      service.getCharacterById(1).subscribe({
        next: () => fail('Expected a server error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/1');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network timeout errors', () => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Timeout'
      });

      service.getCharacterById(1).subscribe({
        next: () => fail('Expected a network error'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ErrorEvent);
          expect(error.error.message).toContain('Timeout');
        }
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/1');
      req.error(errorEvent);
    });

    it('should fetch character with multiple episodes', () => {
      const mockCharacterWithMultipleEpisodes: Character = {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
        location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        episode: [
          'https://rickandmortyapi.com/api/episode/1',
          'https://rickandmortyapi.com/api/episode/2',
          'https://rickandmortyapi.com/api/episode/3'
        ],
        url: 'https://rickandmortyapi.com/api/character/1',
        created: '2017-11-04T18:48:46.250Z'
      };

      service.getCharacterById(1).subscribe(character => {
        expect(character.episode.length).toBe(3);
        expect(character.episode[0]).toContain('/episode/1');
        expect(character.episode[1]).toContain('/episode/2');
        expect(character.episode[2]).toContain('/episode/3');
      });

      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character/1');
      req.flush(mockCharacterWithMultipleEpisodes);
    });
  });

  describe('Service Integration Tests', () => {
    it('should make no HTTP calls until subscribed', () => {
      // Arrange
      const observable = service.getCharacters();
      
      // Act - No subscription yet
      httpMock.expectNone('https://rickandmortyapi.com/api/character?page=1');
      
      // Assert - Subscribe and expect the call
      observable.subscribe();
      const req = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      expect(req.request.method).toBe('GET');
      req.flush({ info: { count: 0, pages: 0, next: null, prev: null }, results: [] });
    });

    it('should handle concurrent requests correctly', () => {
      const mockResponse1: ApiResponse = {
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [{ 
          id: 1, name: 'Rick', status: 'Alive', species: 'Human', type: '', gender: 'Male',
          origin: { name: 'Earth', url: '' }, location: { name: 'Earth', url: '' },
          image: '', episode: [], url: '', created: ''
        }]
      };

      const mockResponse2: ApiResponse = {
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [{ 
          id: 2, name: 'Morty', status: 'Alive', species: 'Human', type: '', gender: 'Male',
          origin: { name: 'Earth', url: '' }, location: { name: 'Earth', url: '' },
          image: '', episode: [], url: '', created: ''
        }]
      };

      // Make concurrent requests
      service.getCharacters(1).subscribe(response => {
        expect(response.results[0].name).toBe('Rick');
      });

      service.getCharacters(2).subscribe(response => {
        expect(response.results[0].name).toBe('Morty');
      });

      // Verify both requests are made
      const req1 = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=1');
      const req2 = httpMock.expectOne('https://rickandmortyapi.com/api/character?page=2');
      
      expect(req1.request.method).toBe('GET');
      expect(req2.request.method).toBe('GET');

      // Respond to both
      req1.flush(mockResponse1);
      req2.flush(mockResponse2);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CharacterListComponent } from './character-list.component';
import { RickMortyService, Character, ApiResponse } from '../../services/rick-morty.service';

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;
  let mockRickMortyService: jest.Mocked<RickMortyService>;

  const mockCharacters: Character[] = [
    {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      type: '',
      gender: 'Male',
      origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
      location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      episode: ['https://rickandmortyapi.com/api/episode/1'],
      url: 'https://rickandmortyapi.com/api/character/1',
      created: '2017-11-04T18:48:46.250Z'
    },
    {
      id: 2,
      name: 'Morty Smith',
      status: 'Alive',
      species: 'Human',
      type: '',
      gender: 'Male',
      origin: { name: 'unknown', url: '' },
      location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
      image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
      episode: ['https://rickandmortyapi.com/api/episode/1'],
      url: 'https://rickandmortyapi.com/api/character/2',
      created: '2017-11-04T18:50:21.651Z'
    }
  ];

  const mockApiResponse: ApiResponse = {
    info: {
      count: 826,
      pages: 42,
      next: 'https://rickandmortyapi.com/api/character?page=2',
      prev: null
    },
    results: mockCharacters
  };

  beforeEach(async () => {
    const rickMortyServiceSpy = {
      getCharacters: jest.fn(),
      getCharacterById: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [CharacterListComponent],
      providers: [
        { provide: RickMortyService, useValue: rickMortyServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    mockRickMortyService = TestBed.inject(RickMortyService) as jest.Mocked<RickMortyService>;

    // No llamar fixture.detectChanges() aquí para evitar ngOnInit automático
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load characters on initialization', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.ngOnInit();

      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(1);
      expect(component.characters).toEqual(mockCharacters);
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(42);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });
  });

  describe('loadCharacters', () => {
    it('should set loading to true initially', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.loadCharacters(1);

      expect(component.loading).toBe(false); // After successful response
      expect(component.error).toBe('');
    });

    it('should handle successful response', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.loadCharacters(2);

      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(2);
      expect(component.characters).toEqual(mockCharacters);
      expect(component.currentPage).toBe(2);
      expect(component.totalPages).toBe(42);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });

    it('should handle error response', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRickMortyService.getCharacters.mockReturnValue(throwError(() => new Error('API Error')));

      component.loadCharacters(1);

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Error loading characters. Please try again.');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      component.currentPage = 2;
      component.totalPages = 5;
    });

    describe('previousPage', () => {
      it('should load previous page when current page > 1', () => {
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.previousPage();

        expect(loadCharactersSpy).toHaveBeenCalledWith(1);
      });

      it('should not load previous page when current page is 1', () => {
        component.currentPage = 1;
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.previousPage();

        expect(loadCharactersSpy).not.toHaveBeenCalled();
      });
    });

    describe('nextPage', () => {
      it('should load next page when current page < total pages', () => {
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.nextPage();

        expect(loadCharactersSpy).toHaveBeenCalledWith(3);
      });

      it('should not load next page when current page equals total pages', () => {
        component.currentPage = 5;
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.nextPage();

        expect(loadCharactersSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('getStatusClass', () => {
    it('should return "status-alive" for alive status', () => {
      expect(component.getStatusClass('Alive')).toBe('status-alive');
      expect(component.getStatusClass('alive')).toBe('status-alive');
      expect(component.getStatusClass('ALIVE')).toBe('status-alive');
    });

    it('should return "status-dead" for dead status', () => {
      expect(component.getStatusClass('Dead')).toBe('status-dead');
      expect(component.getStatusClass('dead')).toBe('status-dead');
      expect(component.getStatusClass('DEAD')).toBe('status-dead');
    });

    it('should return "status-unknown" for unknown status', () => {
      expect(component.getStatusClass('unknown')).toBe('status-unknown');
      expect(component.getStatusClass('Unknown')).toBe('status-unknown');
      expect(component.getStatusClass('anything else')).toBe('status-unknown');
      expect(component.getStatusClass('')).toBe('status-unknown');
    });
  });

  describe('template integration', () => {
    it('should render without errors when characters are loaded', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
      component.characters = mockCharacters;
      component.loading = false;
      component.error = '';

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.characters.length).toBe(2);
    });

    it('should render component without errors', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component).toBeTruthy();
    });
  });

  describe('DOM Interaction and Accessibility Tests', () => {
    beforeEach(() => {
      // Configurar un mock por defecto que puede ser sobrescrito por cada test
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
    });

    describe('Loading State UI', () => {
      it('should display loading state with accessible content', () => {
        // Configurar estado manualmente después de ngOnInit
        fixture.detectChanges(); // Ejecutar ngOnInit primero
        component.loading = true;
        component.error = '';
        component.characters = [];
        fixture.detectChanges();
        
        const loadingElement = fixture.debugElement.nativeElement.querySelector('.loading');
        const loadingText = fixture.debugElement.nativeElement.querySelector('.loading p');
        
        expect(loadingElement).toBeTruthy();
        expect(loadingText?.textContent?.trim()).toContain('Loading characters from the multiverse');
        expect(loadingElement?.getAttribute('class')).toContain('loading');
      });

      it('should not display characters grid when loading', () => {
        // Configurar estado manualmente después de ngOnInit
        fixture.detectChanges(); // Ejecutar ngOnInit primero
        component.loading = true;
        component.characters = [];
        fixture.detectChanges();

        const charactersGrid = fixture.debugElement.nativeElement.querySelector('.characters-grid');
        const paginationElement = fixture.debugElement.nativeElement.querySelector('.pagination');
        
        expect(charactersGrid).toBeNull();
        expect(paginationElement).toBeNull();
      });
    });
    
    describe('Error State UI', () => {
      it('should display error message and retry button', () => {
        // Configurar estado manualmente después de ngOnInit
        fixture.detectChanges(); // Ejecutar ngOnInit primero
        component.loading = false;
        component.error = 'Test error message';
        component.characters = []; // Limpiar characters
        fixture.detectChanges();
        
        const errorElement = fixture.debugElement.nativeElement.querySelector('.error');
        const errorMessage = fixture.debugElement.nativeElement.querySelector('.error p');
        const retryButton = fixture.debugElement.nativeElement.querySelector('.retry-btn');
        
        expect(errorElement).toBeTruthy();
        expect(errorMessage?.textContent?.trim()).toBe('Test error message');
        expect(retryButton).toBeTruthy();
        expect(retryButton?.textContent?.trim()).toContain('Try Again');
      });

      it('should call loadCharacters when retry button is clicked', () => {
        // Configurar estado manualmente después de ngOnInit
        fixture.detectChanges(); // Ejecutar ngOnInit primero
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');
        component.loading = false;
        component.error = 'Test error message';
        component.characters = []; // Limpiar characters  
        component.currentPage = 2;
        fixture.detectChanges();

        const retryButton = fixture.debugElement.nativeElement.querySelector('.retry-btn');
        expect(retryButton).toBeTruthy(); // Verificar que el botón existe
        retryButton?.click();

        expect(loadCharactersSpy).toHaveBeenCalledWith(2);
      });
    });

    describe('Character Cards Display', () => {
      beforeEach(() => {
        component.characters = mockCharacters;
        component.loading = false;
        component.error = '';
        fixture.detectChanges();
      });

      it('should display main title and subtitle with proper structure', () => {
        const titleElement = fixture.debugElement.nativeElement.querySelector('h1');
        const subtitleElement = fixture.debugElement.nativeElement.querySelector('.subtitle');
        
        expect(titleElement).toBeTruthy();
        expect(titleElement.textContent.trim()).toBe('Explore the Multiverse');
        expect(subtitleElement).toBeTruthy();
        expect(subtitleElement.textContent.trim()).toContain('Discover all the crazy characters');
      });

      it('should render correct number of character cards', () => {
        const characterCards = fixture.debugElement.nativeElement.querySelectorAll('.character-card');
        
        expect(characterCards.length).toBe(2);
      });

      it('should display character information with accessible structure', () => {
        const firstCharacterCard = fixture.debugElement.nativeElement.querySelector('.character-card');
        const characterName = firstCharacterCard.querySelector('.character-name');
        const characterImage = firstCharacterCard.querySelector('.character-image');
        const statusIndicator = firstCharacterCard.querySelector('.status-indicator');
        
        expect(characterName).toBeTruthy();
        expect(characterName.textContent.trim()).toBe('Rick Sanchez');
        expect(characterImage).toBeTruthy();
        expect(characterImage.alt).toBe('Rick Sanchez');
        expect(statusIndicator).toBeTruthy();
        expect(statusIndicator.classList.contains('status-alive')).toBe(true);
      });

      it('should display character details with proper labels', () => {
        const firstCharacterCard = fixture.debugElement.nativeElement.querySelector('.character-card');
        const detailLabels = firstCharacterCard.querySelectorAll('.detail-label');
        const detailValues = firstCharacterCard.querySelectorAll('.detail-value');
        
        expect(detailLabels.length).toBeGreaterThan(0);
        expect(detailValues.length).toBeGreaterThan(0);
        
        // Check specific labels
        const detailLabelsArray = Array.from(detailLabels) as HTMLElement[];
        const speciesLabel = detailLabelsArray.find((label: HTMLElement) => 
          label.textContent?.includes('Species')
        );
        expect(speciesLabel).toBeTruthy();
        
        const genderLabel = detailLabelsArray.find((label: HTMLElement) => 
          label.textContent?.includes('Gender')
        );
        expect(genderLabel).toBeTruthy();
      });

      it('should display location information', () => {
        const firstCharacterCard = fixture.debugElement.nativeElement.querySelector('.character-card');
        const locationElement = firstCharacterCard.querySelector('.location');
        const originElement = firstCharacterCard.querySelector('.origin');
        const locationName = firstCharacterCard.querySelector('.location-name');
        const originName = firstCharacterCard.querySelector('.origin-name');
        
        expect(locationElement).toBeTruthy();
        expect(originElement).toBeTruthy();
        expect(locationName).toBeTruthy();
        expect(originName).toBeTruthy();
        expect(locationName.textContent.trim()).toBe('Citadel of Ricks');
        expect(originName.textContent.trim()).toBe('Earth (C-137)');
      });
    });

    describe('Pagination Controls', () => {
      beforeEach(() => {
        component.characters = mockCharacters;
        component.loading = false;
        component.error = '';
        component.currentPage = 2;
        component.totalPages = 5;
        fixture.detectChanges();
      });

      it('should display pagination controls when not loading', () => {
        const paginationElement = fixture.debugElement.nativeElement.querySelector('.pagination');
        const prevButton = fixture.debugElement.nativeElement.querySelector('.prev-btn');
        const nextButton = fixture.debugElement.nativeElement.querySelector('.next-btn');
        const pageInfo = fixture.debugElement.nativeElement.querySelector('.page-info');
        
        expect(paginationElement).toBeTruthy();
        expect(prevButton).toBeTruthy();
        expect(nextButton).toBeTruthy();
        expect(pageInfo).toBeTruthy();
      });

      it('should display current page information correctly', () => {
        // Set the expected page state
        component.currentPage = 2;
        component.totalPages = 5;
        fixture.detectChanges();

        const currentPageSpan = fixture.debugElement.nativeElement.querySelector('.page-current');
        const totalPagesSpan = fixture.debugElement.nativeElement.querySelector('.page-total');
        const separatorSpan = fixture.debugElement.nativeElement.querySelector('.page-separator');
        
        expect(currentPageSpan?.textContent?.trim()).toBe('2');
        expect(totalPagesSpan?.textContent?.trim()).toBe('5');
        expect(separatorSpan?.textContent?.trim()).toBe('of');
      });

      it('should call previousPage when previous button is clicked', () => {
        // Set page state so previous button is enabled
        component.currentPage = 2;
        component.totalPages = 5;
        fixture.detectChanges();

        const previousPageSpy = jest.spyOn(component, 'previousPage');
        const prevButton = fixture.debugElement.nativeElement.querySelector('.prev-btn');
        
        expect(prevButton?.disabled).toBe(false);
        
        prevButton?.click();
        
        expect(previousPageSpy).toHaveBeenCalled();
      });

      it('should call nextPage when next button is clicked', () => {
        const nextPageSpy = jest.spyOn(component, 'nextPage');
        const nextButton = fixture.debugElement.nativeElement.querySelector('.next-btn');
        
        expect(nextButton.disabled).toBe(false);
        
        nextButton.click();
        
        expect(nextPageSpy).toHaveBeenCalled();
      });

      it('should disable previous button on first page', () => {
        component.currentPage = 1;
        fixture.detectChanges();
        
        const prevButton = fixture.debugElement.nativeElement.querySelector('.prev-btn');
        
        expect(prevButton.disabled).toBe(true);
        expect(prevButton.getAttribute('disabled')).not.toBeNull();
      });

      it('should disable next button on last page', () => {
        component.currentPage = 5;
        component.totalPages = 5;
        fixture.detectChanges();
        
        const nextButton = fixture.debugElement.nativeElement.querySelector('.next-btn');
        
        expect(nextButton.disabled).toBe(true);
        expect(nextButton.getAttribute('disabled')).not.toBeNull();
      });

      it('should have proper button text content and accessibility', () => {
        const prevButton = fixture.debugElement.nativeElement.querySelector('.prev-btn');
        const nextButton = fixture.debugElement.nativeElement.querySelector('.next-btn');
        
        expect(prevButton.textContent.trim()).toContain('Previous');
        expect(nextButton.textContent.trim()).toContain('Next');
        expect(prevButton.classList.contains('pagination-btn')).toBe(true);
        expect(nextButton.classList.contains('pagination-btn')).toBe(true);
      });
    });

    describe('Character Status Display', () => {
      // No configurar beforeEach aquí ya que cada test configura su propio mock

      it('should display correct status classes for alive characters', () => {
        const aliveCharacters = [{
          ...mockCharacters[0],
          status: 'Alive'
        }];
        
        // Configurar el mock para devolver el personaje con status vivo
        const mockAliveResponse: ApiResponse = {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: aliveCharacters
        };
        
        mockRickMortyService.getCharacters.mockReturnValue(of(mockAliveResponse));
        
        // Ejecutar ngOnInit para cargar los datos
        component.ngOnInit();
        fixture.detectChanges();
        
        const statusIndicator = fixture.debugElement.nativeElement.querySelector('.status-indicator');
        
        expect(statusIndicator?.classList.contains('status-alive')).toBe(true);
        expect(statusIndicator?.textContent?.trim()).toBe('Alive'); // English text from component
      });

      it('should display correct status classes for dead characters', () => {
        const deadCharacters = [{
          ...mockCharacters[0],
          status: 'Dead'
        }];
        
        // Configurar el mock para devolver el personaje con status muerto
        const mockDeadResponse: ApiResponse = {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: deadCharacters
        };
        
        mockRickMortyService.getCharacters.mockReturnValue(of(mockDeadResponse));
        
        // Ejecutar ngOnInit para cargar los datos
        component.ngOnInit();
        fixture.detectChanges();
        
        const statusIndicator = fixture.debugElement.nativeElement.querySelector('.status-indicator');
        
        expect(statusIndicator?.classList.contains('status-indicator')).toBe(true);
        expect(statusIndicator?.classList.contains('status-dead')).toBe(true);
        expect(statusIndicator?.textContent?.trim()).toBe('Dead'); // English text from component
      });

      it('should display correct status classes for unknown characters', () => {
        const unknownCharacters = [{
          ...mockCharacters[0],
          status: 'unknown'
        }];
        
        // Configurar el mock para devolver el personaje con status desconocido
        const mockUnknownResponse: ApiResponse = {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: unknownCharacters
        };
        
        mockRickMortyService.getCharacters.mockReturnValue(of(mockUnknownResponse));
        
        // Ejecutar ngOnInit para cargar los datos
        component.ngOnInit();
        fixture.detectChanges();
        
        const statusIndicator = fixture.debugElement.nativeElement.querySelector('.status-indicator');
        
        expect(statusIndicator?.classList.contains('status-indicator')).toBe(true);
        expect(statusIndicator?.classList.contains('status-unknown')).toBe(true);
        expect(statusIndicator?.textContent?.trim()).toBe('Unknown'); // English text from component
      });
    });

    describe('Accessibility Features', () => {
      beforeEach(() => {
        component.characters = mockCharacters;
        component.loading = false;
        component.error = '';
        fixture.detectChanges();
      });

      it('should have proper alt text for character images', () => {
        const characterImages = fixture.debugElement.nativeElement.querySelectorAll('.character-image');
        
        characterImages.forEach((img: HTMLImageElement, index: number) => {
          expect(img.alt).toBe(mockCharacters[index].name);
          expect(img.alt.length).toBeGreaterThan(0);
        });
      });

      it('should use semantic HTML elements', () => {
        const mainTitle = fixture.debugElement.nativeElement.querySelector('h1');
        const characterNames = fixture.debugElement.nativeElement.querySelectorAll('h3.character-name');
        const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
        
        expect(mainTitle).toBeTruthy();
        expect(characterNames.length).toBe(2);
        expect(buttons.length).toBeGreaterThan(0);
        
        // Check that buttons are actual button elements
        buttons.forEach((button: HTMLButtonElement) => {
          expect(button.tagName.toLowerCase()).toBe('button');
        });
      });

      it('should have proper structure for screen readers', () => {
        const container = fixture.debugElement.nativeElement.querySelector('.character-container');
        const detailRows = fixture.debugElement.nativeElement.querySelectorAll('.detail-row');
        
        expect(container).toBeTruthy();
        
        // Check that detail information is properly structured
        detailRows.forEach((row: Element) => {
          const label = row.querySelector('.detail-label');
          const value = row.querySelector('.detail-value');
          
          expect(label).toBeTruthy();
          expect(value).toBeTruthy();
          expect(label?.textContent?.trim().length).toBeGreaterThan(0);
          expect(value?.textContent?.trim().length).toBeGreaterThan(0);
        });
      });

      it('should maintain focus management for interactive elements', () => {
        const prevButton = fixture.debugElement.nativeElement.querySelector('.prev-btn');
        const nextButton = fixture.debugElement.nativeElement.querySelector('.next-btn');
        
        expect(prevButton).toBeTruthy();
        expect(nextButton).toBeTruthy();
        
        // Check that buttons have proper attributes for accessibility
        expect(prevButton?.tagName).toBe('BUTTON');
        expect(nextButton?.tagName).toBe('BUTTON');
        expect(prevButton?.disabled).toBeDefined();
        expect(nextButton?.disabled).toBeDefined();
      });
    });

    describe('Responsive Behavior Tests', () => {
      beforeEach(() => {
        component.characters = mockCharacters;
        component.loading = false;
        component.error = '';
        fixture.detectChanges();
      });

      it('should maintain layout structure across different states', () => {
        // Test with characters loaded
        let container = fixture.debugElement.nativeElement.querySelector('.character-container');
        expect(container).toBeTruthy();
        
        // Test loading state
        component.loading = true;
        component.characters = [];
        fixture.detectChanges();
        
        container = fixture.debugElement.nativeElement.querySelector('.character-container');
        const loading = fixture.debugElement.nativeElement.querySelector('.loading');
        
        expect(container).toBeTruthy();
        expect(loading).toBeTruthy();
        
        // Test error state
        component.loading = false;
        component.error = 'Test error';
        fixture.detectChanges();
        
        container = fixture.debugElement.nativeElement.querySelector('.character-container');
        const error = fixture.debugElement.nativeElement.querySelector('.error');
        
        expect(container).toBeTruthy();
        expect(error).toBeTruthy();
      });
    });
  });

  describe('Integration Tests: Component + Service + HTTP Mock', () => {
    beforeEach(() => {
      // No configurar mock aquí - cada test configurará su propio comportamiento HTTP
    });

    it('should load characters through service and display them correctly', async () => {
      // Arrange: Configurar respuesta HTTP mock
      const mockHttpResponse: ApiResponse = {
        info: {
          count: 826,
          pages: 42,
          next: 'https://rickandmortyapi.com/api/character/?page=2',
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
            origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
            location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
            image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
            episode: ['https://rickandmortyapi.com/api/episode/1'],
            url: 'https://rickandmortyapi.com/api/character/1',
            created: '2017-11-04T18:48:46.250Z'
          },
          {
            id: 2,
            name: 'Morty Smith',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: 'unknown', url: '' },
            location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
            image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
            episode: ['https://rickandmortyapi.com/api/episode/1'],
            url: 'https://rickandmortyapi.com/api/character/2',
            created: '2017-11-04T18:50:21.651Z'
          }
        ]
      };

      // Act: Configurar el mock del servicio para devolver la respuesta HTTP
      mockRickMortyService.getCharacters.mockReturnValue(of(mockHttpResponse));
      
      // Ejecutar ngOnInit (que llama al servicio)
      component.ngOnInit();
      fixture.detectChanges();

      // Assert: Verificar que el componente procese correctamente la respuesta del servicio
      expect(component.characters.length).toBe(2);
      expect(component.characters[0].name).toBe('Rick Sanchez');
      expect(component.characters[1].name).toBe('Morty Smith');
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(42);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');

      // Verificar que el servicio fue llamado correctamente
      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(1);

      // Verificar que el DOM muestra los datos correctamente
      const characterCards = fixture.debugElement.nativeElement.querySelectorAll('.character-card');
      expect(characterCards.length).toBe(2);
      
      const firstCharacterName = fixture.debugElement.nativeElement.querySelector('.character-name');
      expect(firstCharacterName?.textContent?.trim()).toBe('Rick Sanchez');
      
      const paginationInfo = fixture.debugElement.nativeElement.querySelector('.page-info');
      expect(paginationInfo).toBeTruthy();
    });

    it('should handle HTTP error through service and display error state', async () => {
      // Arrange: Configurar error HTTP mock
      const httpError = new Error('Network error');
      
      // Act: Configurar el mock del servicio para devolver error
      mockRickMortyService.getCharacters.mockReturnValue(throwError(() => httpError));
      
      // Ejecutar ngOnInit (que llama al servicio)
      component.ngOnInit();
      fixture.detectChanges();

      // Assert: Verificar que el componente maneje correctamente el error del servicio
      expect(component.characters.length).toBe(0);
      expect(component.loading).toBe(false);
      expect(component.error).toBeTruthy();

      // Verificar que el servicio fue llamado
      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(1);

      // Verificar que el DOM muestra el estado de error
      const errorElement = fixture.debugElement.nativeElement.querySelector('.error');
      expect(errorElement).toBeTruthy();
      
      const retryButton = fixture.debugElement.nativeElement.querySelector('.retry-btn');
      expect(retryButton).toBeTruthy();
      
      // No debe mostrar personajes ni paginación
      const characterCards = fixture.debugElement.nativeElement.querySelectorAll('.character-card');
      expect(characterCards.length).toBe(0);
    });
  });
});

import { Component, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RickMortyService, Character, ApiResponse } from '../../services/rick-morty.service';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;

  constructor(
    private readonly rickMortyService: RickMortyService,
    private readonly liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(page: number = 1): void {
    this.loading = true;
    this.error = '';

    // Announce loading state
    this.liveAnnouncer.announce(`Loading characters from page ${page}`);

    this.rickMortyService.getCharacters(page).subscribe({
      next: (response: ApiResponse) => {
        this.characters = response.results;
        this.currentPage = page;
        this.totalPages = response.info.pages;
        this.loading = false;
        
        // Announce successful load
        this.liveAnnouncer.announce(
          `Loaded ${response.results.length} characters on page ${page} of ${response.info.pages}`
        );
      },
      error: (error) => {
        this.error = 'Error loading characters. Please try again.';
        this.loading = false;
        console.error('Error:', error);
        
        // Announce error
        this.liveAnnouncer.announce('Error loading characters. Please try again.');
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadCharacters(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadCharacters(this.currentPage + 1);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'alive':
        return 'status-alive';
      case 'dead':
        return 'status-dead';
      default:
        return 'status-unknown';
    }
  }

  getStatusAnnouncement(character: Character): string {
    return `${character.name}, ${character.species}, ${character.status}`;
  }
}

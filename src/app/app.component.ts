import { Component, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-sofkau';

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    // Announce that the application has loaded
    this.liveAnnouncer.announce('Rick and Morty Character Explorer loaded');
  }

  skipToContent(): void {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      this.liveAnnouncer.announce('Skipped to main content');
    }
  }
}

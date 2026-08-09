import { Component, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = signal(false);
  isLightTheme = signal(false);

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
      this.isLightTheme.set(true);
      document.documentElement.classList.add('light');
    } else {
      this.isLightTheme.set(false);
      document.documentElement.classList.remove('light');
    }
  }

  toggleTheme() {
    const newThemeState = !this.isLightTheme();
    this.isLightTheme.set(newThemeState);
    
    if (newThemeState) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}

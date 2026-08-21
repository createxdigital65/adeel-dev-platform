import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

/** Home-page section ids tracked by the nav scroll-spy. */
const SPY_SECTIONS = ['about', 'projects', 'services', 'ai-playground', 'contact'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: [],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = signal(false);
  isLightTheme = signal(false);
  activeSection = signal('');

  private readonly router = inject(Router);
  private sectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
      this.isLightTheme.set(true);
      document.documentElement.classList.add('light');
    } else {
      this.isLightTheme.set(false);
      document.documentElement.classList.remove('light');
    }

    // Re-arm the scroll-spy whenever the route changes; sections only exist on '/'.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.initScrollSpy();
    });
    this.initScrollSpy();
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  /**
   * Watches home-page sections crossing a band around the viewport middle and
   * highlights the matching nav link. Safe on routes without those sections.
   */
  private initScrollSpy(): void {
    this.sectionObserver?.disconnect();
    // Wait one frame so route views have rendered before querying sections.
    requestAnimationFrame(() => {
      const sections = SPY_SECTIONS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null,
      );

      if (!sections.length) {
        this.activeSection.set('');
        return;
      }

      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeSection.set(entry.target.id);
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      );
      sections.forEach((section) => this.sectionObserver?.observe(section));
    });
  }

  toggleTheme(): void {
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

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}

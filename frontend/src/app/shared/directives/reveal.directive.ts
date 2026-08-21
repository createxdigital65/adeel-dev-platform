import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Scroll-reveal directive.
 * Fades and slides the host element in the first time it enters the viewport.
 * Respects prefers-reduced-motion by revealing content immediately.
 *
 * Usage:
 *   <div appReveal>...</div>
 *   <div appReveal [revealDelay]="120">...</div>
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Optional stagger delay in milliseconds before the transition starts. */
  @Input() revealDelay = 0;

  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      node.classList.add('revealed');
      return;
    }

    node.classList.add('reveal');
    if (this.revealDelay > 0) {
      node.style.transitionDelay = `${this.revealDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('revealed');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

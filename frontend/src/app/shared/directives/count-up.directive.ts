import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Animated count-up directive.
 * Animates the host's numeric text content from 0 to `countTo` with an
 * ease-out cubic curve when it first scrolls into view.
 * Respects prefers-reduced-motion by rendering the final value immediately.
 *
 * Usage:
 *   <span appCountUp [countTo]="3" suffix="x">3x</span>
 *   <span appCountUp [countTo]="99.9" [decimals]="1" suffix="%">99.9%</span>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnDestroy {
  /** Target numeric value rendered by the animation. */
  @Input() countTo = 0;
  /** Decimal places to render (e.g. 1 for "99.9"). */
  @Input() decimals = 0;
  /** Static text rendered before the number. */
  @Input() prefix = '';
  /** Static text rendered after the number (e.g. "%", "x", "h"). */
  @Input() suffix = '';
  /** Animation duration in milliseconds. */
  @Input() duration = 1400;

  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    const render = (value: number): void => {
      node.textContent = `${this.prefix}${value.toFixed(this.decimals)}${this.suffix}`;
    };
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined' || !this.countTo) {
      render(this.countTo);
      return;
    }

    render(0);
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.animate(render);
          this.observer?.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    this.observer.observe(node);
  }

  private animate(render: (value: number) => void): void {
    const start = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min((now - start) / this.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      render(this.countTo * eased);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

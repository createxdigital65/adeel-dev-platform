import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export interface TrackingEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Pushes a structured event to the Google Tag Manager / GA4 dataLayer safely.
   */
  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    if (!this.isBrowser) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...params,
    });
  }

  /**
   * Tracks primary Call-To-Action clicks across the site.
   */
  trackCtaClick(ctaName: string, location: string): void {
    this.trackEvent('cta_click', {
      cta_name: ctaName,
      location,
    });
  }

  /**
   * Tracks high-intent consultation requests and outreach triggers.
   */
  trackConsultationRequest(
    method: 'form' | 'calendly' | 'email' | 'whatsapp' | 'linkedin',
    details: Record<string, any> = {},
  ): void {
    this.trackEvent('consultation_request', {
      method,
      ...details,
    });
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: []
})
export class FooterComponent {
  private readonly analyticsService = inject(AnalyticsService);
  currentYear = new Date().getFullYear();

  trackOutreach(
    method: Parameters<AnalyticsService['trackConsultationRequest']>[0],
  ): void {
    this.analyticsService.trackCtaClick(`Contact via ${method}`, 'footer');
    this.analyticsService.trackConsultationRequest(method, { location: 'footer' });
  }

  trackProfileClick(profile: string): void {
    this.analyticsService.trackCtaClick(`${profile} profile`, 'footer');
  }

  trackNavigation(section: string): void {
    this.analyticsService.trackCtaClick(`footer_${section}`, 'footer-nav');
  }
}

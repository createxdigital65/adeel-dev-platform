import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TechSpec {
  title: string;
  badge: string;
  description: string;
  bullets: string[];
  codeBlock: string;
}

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './architecture.html',
  styleUrls: []
})
export class ArchitectureComponent {
  selectedTab = signal<string>('clean-arch');

  specs: Record<string, TechSpec> = {
    'clean-arch': {
      title: 'Clean Architecture Pattern',
      badge: 'Core Pattern',
      description: 'The backend separates concerns into distinct layers: Domain, Application, Infrastructure, and Api. Dependencies point inward, ensuring business rules are isolated and highly testable.',
      bullets: [
        'Domain Layer: Contains only pure business entities, specifications, and values. Zero dependencies.',
        'Application Layer: Defines orchestration contracts, interfaces, validation rules, CQRS commands, and MediatR handlers.',
        'Infrastructure Layer: Implements external integrations like Entity Framework core database connectivity, file-storage adapters, and email client interfaces.',
        'Api Layer: Serves as the outer HTTP interface containing endpoints, middlewares, authentication mapping, and documentation outputs.'
      ],
      codeBlock: `// Typical Application Request Handler Flow
public class CreateProjectCommandHandler 
    : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTime _dateTime;

    public CreateProjectCommandHandler(IApplicationDbContext context, IDateTime dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var entity = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Created = _dateTime.Now
        };

        _context.Projects.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}`
    },
    'frontend-arch': {
      title: 'Reactive Angular Architecture',
      badge: 'Client Stack',
      description: 'Built on Angular 20, using Standalone Components to eliminate NgModule boilerplate and Angular Signals for precise, reactive state propagation.',
      bullets: [
        'Standalone Setup: Components define their imports directly, enhancing modularity and lazy-loading boundaries.',
        'Angular Signals: Writable and computed signals ensure target UI sections update instantly without expensive global change detection ticks.',
        'HTTP Interceptors: Automatic injection of JWT tokens, centralized error handling, and performance logging.',
        'Zoneless Execution: Prepared to run without zone.js, relying entirely on signal graph notifications for optimal performance.'
      ],
      codeBlock: `// Angular 20 Standalone Component using Signals
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <button (click)="increment()">Count: {{ count() }}</button>
    <p>Double: {{ doubleCount() }}</p>
  \`
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}`
    },
    'devops-arch': {
      title: 'Dockerized Deployment Strategy',
      badge: 'Infrastructure',
      description: 'Standardized infrastructure deployment utilizing multi-stage Docker builds compiled under Linux environments and managed with Docker Compose.',
      bullets: [
        'Multi-stage Dockerfiles: Shrinks final production image sizes by using temporary SDK build containers and lightweight runtime-only release containers.',
        'Reverse Proxy: Employs a lightweight Caddy or Nginx router to proxy frontend client requests and API queries, handling automatic HTTPS certificates.',
        'Dev-Prod Parity: Guarantees that local environment execution mirrors the target Linux VPS runtime setup, avoiding configuration drift.',
        'CI/CD Pipelines: Automated lint, test, container build, and remote server composition via SSH deploy scripts.'
      ],
      codeBlock: `# Multi-stage backend build Dockerfile snippet
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy and restore sln layers
COPY *.sln .
COPY backend/src/Api/*.csproj ./backend/src/Api/
RUN dotnet restore

# Copy all resources and build release
COPY . .
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "Backend.Api.dll"]`
    }
  };

  selectTab(tabId: string) {
    this.selectedTab.set(tabId);
  }

  getCurrentSpec(): TechSpec {
    return this.specs[this.selectedTab()] || this.specs['clean-arch'];
  }
}

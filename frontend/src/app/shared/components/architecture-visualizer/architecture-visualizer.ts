import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TechNode {
  id: string;
  name: string;
  category: string;
  description: string;
  techs: string[];
  x: number;
  y: number;
}

@Component({
  selector: 'app-architecture-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-visualizer.html',
  styleUrls: []
})
export class ArchitectureVisualizerComponent {
  selectedNode = signal<string>('frontend');
  activeFlow = signal<boolean>(true);

  nodes: TechNode[] = [
    {
      id: 'frontend',
      name: 'Angular Frontend',
      category: 'Client Layer',
      description: 'Responsive SPA engineered with Angular 20, Signals for state management, Standalone Components, and Tailwind CSS. Optimised for performance, accessibility, and high visual engagement.',
      techs: ['Angular 20', 'Signals', 'TypeScript', 'Tailwind CSS'],
      x: 10, y: 15
    },
    {
      id: 'api',
      name: '.NET Web API',
      category: 'Application Layer',
      description: 'Robust RESTful API designed with ASP.NET Core 10, implementing Clean Architecture. Features CQRS pattern, structured validation, token auth, and enterprise routing.',
      techs: ['.NET 10', 'ASP.NET Core', 'Clean Architecture', 'MediatR'],
      x: 50, y: 15
    },
    {
      id: 'db',
      name: 'SQL Server / Postgres',
      category: 'Data Layer',
      description: 'Persistent database storage utilizing Entity Framework Core. Structured for transactional integrity, optimized indexing, and robust relations.',
      techs: ['EF Core', 'PostgreSQL', 'SQL Server', 'Migrations'],
      x: 90, y: 15
    },
    {
      id: 'ai',
      name: 'AI Agent Service',
      category: 'Automation Layer',
      description: 'Asynchronous integrations with OpenAI APIs, background workflows, semantic parsing, and intelligent agent routines coordinated via background tasks.',
      techs: ['OpenAI API', 'AI Workflows', 'Background Services', 'Semantic Agents'],
      x: 50, y: 65
    },
    {
      id: 'deployment',
      name: 'Docker Infrastructure',
      category: 'DevOps Layer',
      description: 'Multi-stage Docker containerization deployed on a secured Linux VPS. Managed via Docker Compose with automated CI/CD pipelines.',
      techs: ['Docker', 'Docker Compose', 'Linux VPS', 'CI/CD Pipelines'],
      x: 10, y: 65
    }
  ];

  selectNode(id: string) {
    this.selectedNode.set(id);
  }

  getCurrentNode(): TechNode {
    return this.nodes.find(n => n.id === this.selectedNode()) || this.nodes[0];
  }

  toggleFlow() {
    this.activeFlow.update(v => !v);
  }
}

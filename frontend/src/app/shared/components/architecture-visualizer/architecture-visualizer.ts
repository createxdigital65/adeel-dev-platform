import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TechNode {
  id: string;
  name: string;
  category: string;
  description: string;
  techs: string[];
  status?: 'current' | 'previous';
}

@Component({
  selector: 'app-architecture-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-visualizer.html',
  styleUrls: []
})
export class ArchitectureVisualizerComponent {
  selectedNode = signal<string>('');
  activeFlow = signal<boolean>(true);
  showGraph = signal<boolean>(false);

  // Current (interactive) architecture nodes
  nodes: TechNode[] = [
    {
      id: 'frontend',
      name: 'Angular Frontend',
      category: 'Client Layer',
      description: 'Modern static portfolio built with Angular 20, TypeScript, and Tailwind CSS. Optimised for performance, accessibility, and high visual engagement.',
      techs: ['Angular 20', 'TypeScript', 'Tailwind CSS 4.0'],
      status: 'current'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Pages',
      category: 'Hosting',
      description: 'Global static hosting and edge delivery for the portfolio website, serving content with low latency.',
      techs: ['Cloudflare Pages', 'CDN / Edge Delivery', 'HTTPS'],
      status: 'current'
    },
    {
      id: 'playground',
      name: 'AI Playground',
      category: 'Client App',
      description: "Interactive AI assistant designed to answer questions about Adeel, his skills, projects, services and professional experience.",
      techs: ['Angular 20', 'AI integration', 'Serverless communication'],
      status: 'current'
    },
    {
      id: 'worker',
      name: 'AI Edge Function',
      category: 'Serverless',
      description: 'Secure serverless layer between the public AI Playground and the AI provider, keeping private API credentials away from the browser.',
      techs: ['Cloudflare Workers / Pages Functions', 'Serverless / Edge Runtime', 'Secrets'],
      status: 'current'
    },
    {
      id: 'ai-provider',
      name: 'AI Provider',
      category: 'AI Layer',
      description: 'External AI model used by the AI Playground to generate responses based on approved portfolio knowledge.',
      techs: ['Google Gemini API', 'Generative Model'],
      status: 'current'
    }
  ];

  // Previous (deprecated) architecture nodes - informational only
  previousNodes: TechNode[] = [
    {
      id: 'prev-frontend',
      name: 'Angular Client',
      category: 'Client Layer (Deprecated)',
      description: 'The frontend app configured to hit dynamic server endpoints.',
      techs: ['Angular', 'Dynamic HttpClient'],
      status: 'previous'
    },
    {
      id: 'prev-api',
      name: '.NET Web API',
      category: 'Application Layer (Deprecated)',
      description: 'Previous implementation using an ASP.NET Core backend for server-side logic and APIs.',
      techs: ['.NET Core', 'ASP.NET Web API', 'Clean Architecture'],
      status: 'previous'
    },
    {
      id: 'prev-db',
      name: 'Database',
      category: 'Data Layer (Deprecated)',
      description: 'Traditional relational database previously used to persist portfolio data.',
      techs: ['SQL Server', 'Postgres'],
      status: 'previous'
    }
  ];

  selectNode(id: string) {
    if (id.startsWith('prev-')) return;
    if (this.selectedNode() === id) {
      this.selectedNode.set('');
    } else {
      this.selectedNode.set(id);
    }
  }

  getCurrentNode(): TechNode | null {
    return this.nodes.find(n => n.id === this.selectedNode()) || null;
  }

  toggleGraph() {
    this.showGraph.update(v => !v);
  }
}

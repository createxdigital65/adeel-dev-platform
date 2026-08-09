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
  // No default selection so the inspector shows a prompt
  selectedNode = signal<string>('');
  activeFlow = signal<boolean>(true);
  // Current (interactive) architecture nodes
  nodes: TechNode[] = [
    {
      id: 'frontend',
      name: 'Angular Frontend',
      category: 'Client Layer',
      description: 'Modern static portfolio built with Angular, TypeScript and Tailwind CSS.',
      techs: ['Angular', 'TypeScript', 'Tailwind CSS'],
      x: 10, y: 15,
      status: 'current'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Pages',
      category: 'Hosting',
      description: 'Global static hosting and edge delivery for the portfolio website.',
      techs: ['Cloudflare Pages', 'CDN / Edge Delivery', 'HTTPS'],
      x: 50, y: 15,
      status: 'current'
    },
    {
      id: 'ai-provider',
      name: 'AI Provider',
      category: 'AI Layer',
      description: 'External AI model used by the AI Playground to generate responses based on approved portfolio knowledge.',
      techs: [],
      x: 90, y: 15,
      status: 'current'
    },
    {
      id: 'worker',
      name: 'AI Edge Function',
      category: 'Serverless',
      description: 'Secure serverless layer between the public AI Playground and the AI provider, keeping private API credentials away from the browser.',
      techs: ['Cloudflare Workers / Pages Functions', 'Serverless / Edge Runtime', 'Secrets'],
      x: 10, y: 65,
      status: 'current'
    },
    {
      id: 'playground',
      name: 'AI Playground',
      category: 'Client App',
      description: "Interactive AI assistant designed to answer questions about Adeel, his skills, projects, services and professional experience.",
      techs: ['Angular', 'AI integration', 'Serverless communication'],
      x: 90, y: 65,
      status: 'current'
    }
  ];

  // Previous (deprecated) architecture nodes - informational only
  previousNodes: TechNode[] = [
    {
      id: 'prev-api',
      name: '.NET Web API',
      category: 'Application Layer (Deprecated)',
      description: 'Previous implementation using an ASP.NET Core backend for server-side logic and APIs.',
      techs: ['.NET', 'ASP.NET Core'],
      x: 0, y: 0,
      status: 'previous'
    },
    {
      id: 'prev-db',
      name: 'Database',
      category: 'Data Layer (Deprecated)',
      description: 'Traditional relational database previously used to persist portfolio data.',
      techs: ['SQL Server', 'Postgres'],
      x: 0, y: 0,
      status: 'previous'
    }
  ];

  selectNode(id: string) {
    // Prevent selecting deprecated previous architecture nodes
    if (id.startsWith('prev-')) return;
    // toggle selection: clicking already-selected node will deselect
    if (this.selectedNode() === id) {
      this.selectedNode.set('');
    } else {
      this.selectedNode.set(id);
    }
  }

  getCurrentNode(): TechNode | null {
    return this.nodes.find(n => n.id === this.selectedNode()) || null;
  }

  toggleFlow() {
    this.activeFlow.update(v => !v);
  }
}

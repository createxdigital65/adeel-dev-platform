import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ApiProjectDto {
  id: string;
  title: string;
  category: string;
  description: string;
  techs: string[];
  features: string[];
  challenges: string;
  lessons: string;
}

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  techs: string[];
  features: string[];
  challenges: string;
  lessons: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/projects';

  getProjects(): Observable<ProjectItem[]> {
    return this.http.get<ApiProjectDto[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => ({
        title: dto.title,
        category: dto.category,
        description: dto.description,
        techs: dto.techs,
        features: dto.features,
        challenges: dto.challenges,
        lessons: dto.lessons,
        expanded: false
      })))
    );
  }
}

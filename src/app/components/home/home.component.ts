import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommandService } from '../../services/command.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 class="text-4xl font-bold mb-4 text-gray-800">Command Builder</h1>
        <p class="text-lg text-gray-600 mb-6">
          Build complex commands with ease using our interactive GUI. Select options, 
          flags, and parameters visually, and get the complete command ready to copy and paste.
        </p>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 class="font-semibold text-blue-800 mb-2">Features:</h2>
          <ul class="list-disc list-inside text-blue-700 space-y-1">
            <li>Interactive GUI for command generation</li>
            <li>Real-time command preview</li>
            <li>Pre-configured examples</li>
            <li>Command history stored locally</li>
            <li>Support for multiple commands</li>
          </ul>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Available Commands</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (command of commands(); track command.id) {
            <a
              [routerLink]="['/command', command.id]"
              class="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-xl font-bold font-mono text-blue-600">{{ command.name }}</h3>
                @if (command.link) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
              </div>
              <p class="text-gray-600 text-sm">{{ command.description }}</p>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class HomeComponent implements OnInit {
  private commandService = inject(CommandService);
  private titleService = inject(Title);
  
  commands = computed(() => this.commandService.commands());

  ngOnInit(): void {
    this.titleService.setTitle('Command Builder');
  }
}

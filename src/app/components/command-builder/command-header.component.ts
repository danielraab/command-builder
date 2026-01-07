import { Component, input } from '@angular/core';
import { Command } from '../../models/command.model';

@Component({
  selector: 'app-command-header',
  template: `
    @if (command(); as cmd) {
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-3xl font-bold mb-2 font-mono">{{ cmd.name }}</h1>
        <p class="text-gray-600">
          {{ cmd.description }}
          @if (cmd.link) {
            <a [href]="cmd.link" target="_blank" rel="noopener noreferrer" class="ml-2 text-blue-500 hover:text-blue-700 underline">
              View documentation
            </a>
          }
        </p>
      </div>
    }
  `
})
export class CommandHeaderComponent {
  command = input.required<Command>();
}

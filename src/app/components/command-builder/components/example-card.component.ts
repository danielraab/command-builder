import { Component, input, output } from '@angular/core';

export interface CommandExample {
  command: string;
  description: string;
  presets: Record<string, any>;
}

@Component({
  selector: 'app-example-card',
  template: `
    @if (example(); as ex) {
      <div class="border border-gray-200 rounded-md p-4 hover:border-blue-300 transition-colors">
        <code class="text-sm font-mono text-blue-600 block mb-2 break-all">
          {{ ex.command }}
        </code>
        <p class="text-xs text-gray-600 mb-3">{{ ex.description }}</p>
        <button
          (click)="apply.emit()"
          class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          [attr.aria-label]="'Apply example: ' + ex.description"
        >
          Apply Example
        </button>
      </div>
    }
  `
})
export class ExampleCardComponent {
  example = input.required<CommandExample>();
  apply = output<void>();
}

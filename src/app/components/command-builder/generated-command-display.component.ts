import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-generated-command-display',
  template: `
    <div class="bg-gray-900 text-green-400 rounded-lg shadow-md p-6 mb-6 sticky top-0 z-10">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-semibold">Generated Command</h2>
        <button
          (click)="handleCopy()"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          [attr.aria-label]="'Copy command to clipboard'"
        >
          {{ buttonText() }}
        </button>
      </div>
      <code class="text-xl font-mono block break-all">{{ command() }}</code>
    </div>
  `
})
export class GeneratedCommandDisplayComponent {
  command = input.required<string>();
  copy = output<void>();
  
  buttonText = signal('Copy');

  handleCopy(): void {
    navigator.clipboard.writeText(this.command()).then(() => {
      this.buttonText.set('Copied!');
      setTimeout(() => this.buttonText.set('Copy'), 2000);
    });
    this.copy.emit();
  }
}

import { Component, input, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandService, CommandHistoryEntry } from '../services/command.service';

@Component({
  selector: 'app-command-history',
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Command History</h2>
        @if (history().length > 0) {
          <button
            (click)="clearHistory()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
            [attr.aria-label]="'Clear command history'"
          >
            Clear History
          </button>
        }
      </div>

      @if (history().length === 0) {
        <p class="text-gray-500 text-center py-8">
          No commands saved yet. Click "Save to History" to save generated commands.
        </p>
      } @else {
        <div class="space-y-3 max-h-96 overflow-y-auto">
          @for (entry of history(); track entry.timestamp) {
            <div class="border border-gray-200 rounded-md p-4 hover:border-blue-300 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <code class="text-sm font-mono text-blue-600 flex-1 break-all">
                  {{ entry.command }}
                </code>
                <button
                  (click)="copyToClipboard(entry.command)"
                  class="ml-3 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md transition-colors shrink-0"
                  [attr.aria-label]="'Copy command to clipboard'"
                >
                  Copy
                </button>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatTimestamp(entry.timestamp) }}
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: ``
})
export class CommandHistoryComponent {
  commandId = input.required<string>();
  
  private commandService = inject(CommandService);
  private historyData = signal<CommandHistoryEntry[]>([]);
  
  history = computed(() => this.historyData());

  constructor() {
    effect(() => {
      const id = this.commandId();
      if (id) {
        this.loadHistory();
      }
    });
  }

  loadHistory(): void {
    const id = this.commandId();
    const history = this.commandService.getHistory(id);
    this.historyData.set(history);
  }

  clearHistory(): void {
    const id = this.commandId();
    this.commandService.clearHistory(id);
    this.loadHistory();
  }

  copyToClipboard(command: string): void {
    navigator.clipboard.writeText(command);
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

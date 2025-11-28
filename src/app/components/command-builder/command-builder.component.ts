import { Component, signal, computed, effect, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommandService } from '../../services/command.service';
import { Command, Flag, Option } from '../../models/command.model';
import { CommandHistoryComponent } from '../command-history/command-history.component';

interface FlagState {
  id: string;
  selected: boolean;
}

interface OptionState {
  id: string;
  selected: boolean;
  value?: string | number;
}

@Component({
  selector: 'app-command-builder',
  imports: [FormsModule, CommonModule, CommandHistoryComponent],
  template: `
    @if (isLoading()) {
      <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 class="text-xl font-semibold text-gray-800">Loading command...</h2>
        </div>
      </div>
    } @else if (command(); as cmd) {
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Command Header -->
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

        <!-- Generated Command -->
        <div class="bg-gray-900 text-green-400 rounded-lg shadow-md p-6 mb-6  sticky top-0 z-10 ">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold">Generated Command</h2>
            <button
              (click)="copyToClipboard()"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              [attr.aria-label]="'Copy command to clipboard'"
            >
              {{ copyButtonText() }}
            </button>
          </div>
          <code class="text-xl font-mono block break-all">{{ generatedCommand() }}</code>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Flags and Options -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Flags Section -->
            @if (cmd.flags.length > 0) {
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold mb-4">Flags</h2>
                <div class="space-y-3">
                  @for (flag of cmd.flags; track flag.id) {
                    <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        [id]="'flag-' + flag.id"
                        [checked]="getFlagState(flag.id)"
                        (change)="toggleFlag(flag.id)"
                        class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label [attr.for]="'flag-' + flag.id" class="flex-1 cursor-pointer">
                        <div class="font-mono font-semibold text-blue-600">{{ flag.flag }}</div>
                        <div class="text-sm text-gray-600">
                          {{ flag.description }}
                          @if (flag.link) {
                            <a [href]="flag.link" target="_blank" rel="noopener noreferrer" class="ml-1 text-blue-500 hover:text-blue-700 underline" (click)="$event.stopPropagation()">
                              Learn more
                            </a>
                          }
                        </div>
                      </label>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Options Section -->
            @if (cmd.options.length > 0) {
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold mb-4">Options</h2>
                <div class="space-y-4">
                  @for (option of cmd.options; track option.id) {
                    <div class="p-4 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                      <div class="flex items-start space-x-3 mb-3">
                        <input
                          type="checkbox"
                          [id]="'option-' + option.id"
                          [checked]="getOptionState(option.id).selected"
                          (change)="toggleOption(option.id)"
                          class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label [attr.for]="'option-' + option.id" class="flex-1 cursor-pointer">
                          @if (option.option) {
                            <div class="font-mono font-semibold text-blue-600">{{ option.option }}</div>
                          }
                          <div class="text-sm text-gray-600">
                            {{ option.description }}
                            @if (option.link) {
                              <a [href]="option.link" target="_blank" rel="noopener noreferrer" class="ml-1 text-blue-500 hover:text-blue-700 underline" (click)="$event.stopPropagation()">
                                Learn more
                              </a>
                            }
                          </div>
                        </label>
                      </div>

                      @if (option.parameter && getOptionState(option.id).selected) {
                        <div class="ml-7 mt-2">
                          @if (option.parameter.type === 'text') {
                            <input
                              type="text"
                              [id]="'param-' + option.id"
                              [value]="getOptionState(option.id).value || ''"
                              (input)="updateOptionValue(option.id, $event)"
                              [placeholder]="option.parameter.placeholder || ''"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              [attr.aria-label]="option.description + ' value'"
                            />
                          }

                          @if (option.parameter.type === 'number') {
                            <input
                              type="number"
                              [id]="'param-' + option.id"
                              [value]="getOptionState(option.id).value || ''"
                              (input)="updateOptionValue(option.id, $event)"
                              [placeholder]="option.parameter.placeholder || ''"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              [attr.aria-label]="option.description + ' value'"
                            />
                          }

                          @if (option.parameter.type === 'enum' && option.parameter.enumValues) {
                            <select
                              [id]="'param-' + option.id"
                              [value]="getOptionState(option.id).value || option.parameter.defaultValue || ''"
                              (change)="updateOptionValue(option.id, $event)"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              [attr.aria-label]="option.description + ' value'"
                            >
                              <option value="">Select...</option>
                              @for (enumVal of option.parameter.enumValues; track enumVal.value) {
                                <option [value]="enumVal.value" [title]="enumVal.description || ''">
                                  {{ enumVal.label }}
                                </option>
                              }
                            </select>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Examples and Actions -->
          <div class="space-y-6">
            @if (cmd.examples && cmd.examples.length > 0) {
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4">Examples</h2>
                <div class="space-y-4">
                  @for (example of cmd.examples; track example.command) {
                    <div class="border border-gray-200 rounded-md p-4 hover:border-blue-300 transition-colors">
                      <code class="text-sm font-mono text-blue-600 block mb-2 break-all">
                        {{ example.command }}
                      </code>
                      <p class="text-xs text-gray-600 mb-3">{{ example.description }}</p>
                      <button
                        (click)="applyExample(example)"
                        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                        [attr.aria-label]="'Apply example: ' + example.description"
                      >
                        Apply Example
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="bg-white rounded-lg shadow-md p-6">
              <button
                (click)="saveCommand()"
                class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors mb-2"
                [attr.aria-label]="'Save command to history'"
              >
                {{ saveButtonText() }}
              </button>
              <button
                (click)="resetCommand()"
                class="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors"
                [attr.aria-label]="'Reset command to default'"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Command History -->
        <div class="mt-6">
          <app-command-history [commandId]="cmd.id" />
        </div>
      </div>
    } @else {
      <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 class="text-2xl font-bold text-gray-800">Command not found</h2>
          <p class="text-gray-600 mt-2">Please select a command from the navigation bar.</p>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class CommandBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private commandService = inject(CommandService);
  private titleService = inject(Title);
  private historyComponent = viewChild(CommandHistoryComponent);

  command = signal<Command | undefined>(undefined);
  isLoading = signal(true);
  private flagStates = signal<Map<string, FlagState>>(new Map());
  private optionStates = signal<Map<string, OptionState>>(new Map());
  copyButtonText = signal('Copy');
  saveButtonText = signal('Save to History');

  generatedCommand = computed(() => {
    const cmd = this.command();
    if (!cmd) return '';

    const parts: string[] = [cmd.name];

    // Add flags
    const flags = cmd.flags
      .filter(flag => this.getFlagState(flag.id))
      .map(flag => flag.flag);
    parts.push(...flags);

    // Add options
    cmd.options.forEach(option => {
      const state = this.getOptionState(option.id);
      if (!state.selected) return;

      if (option.option) {
        parts.push(option.option);
      }

      if (option.parameter && state.value) {
        const value = state.value.toString();
        // Quote if contains spaces
        const quotedValue = value.includes(' ') ? `"${value}"` : value;
        parts.push(quotedValue);
      }
    });

    return parts.join(' ');
  });

  constructor() {
    // Auto-save effect
    effect(() => {
      this.generatedCommand(); // Track changes
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.isLoading.set(true);
        this.command.set(undefined);
        
        // Wait for commands to be loaded if they haven't been yet
        if (this.commandService.commands().length === 0) {
          await this.commandService.loadCommands();
        }
        
        const cmd = this.commandService.getCommand(id);
        this.command.set(cmd);
        if (cmd) {
          this.initializeStates(cmd);
          this.titleService.setTitle(`Command Builder - ${cmd.name}`);
        }
      }

      this.isLoading.set(false);
    });
  }

  private initializeStates(cmd: Command): void {
    const flagMap = new Map<string, FlagState>();
    cmd.flags.forEach(flag => {
      flagMap.set(flag.id, {
        id: flag.id,
        selected: flag.selected || false
      });
    });
    this.flagStates.set(flagMap);

    const optionMap = new Map<string, OptionState>();
    cmd.options.forEach(option => {
      optionMap.set(option.id, {
        id: option.id,
        selected: option.selected || false,
        value: option.parameter?.defaultValue
      });
    });
    this.optionStates.set(optionMap);
  }

  getFlagState(id: string): boolean {
    return this.flagStates().get(id)?.selected || false;
  }

  toggleFlag(id: string): void {
    const newMap = new Map(this.flagStates());
    const current = newMap.get(id);
    if (current) {
      newMap.set(id, { ...current, selected: !current.selected });
      this.flagStates.set(newMap);
    }
  }

  getOptionState(id: string): OptionState {
    return this.optionStates().get(id) || { id, selected: false };
  }

  toggleOption(id: string): void {
    const newMap = new Map(this.optionStates());
    const current = newMap.get(id);
    if (current) {
      newMap.set(id, { ...current, selected: !current.selected });
      this.optionStates.set(newMap);
    }
  }

  updateOptionValue(id: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'number' ? Number(target.value) : target.value;
    
    const newMap = new Map(this.optionStates());
    const current = newMap.get(id);
    if (current) {
      newMap.set(id, { ...current, value });
      this.optionStates.set(newMap);
    }
  }

  applyExample(example: any): void {
    const cmd = this.command();
    if (!cmd) return;

    // Reset states
    this.initializeStates(cmd);

    // Apply presets
    const flagMap = new Map(this.flagStates());
    const optionMap = new Map(this.optionStates());

    Object.keys(example.presets).forEach(key => {
      const preset = example.presets[key];
      
      // Check if it's a flag
      if (flagMap.has(key)) {
        flagMap.set(key, { id: key, selected: preset.selected });
      }
      
      // Check if it's an option
      if (optionMap.has(key)) {
        optionMap.set(key, {
          id: key,
          selected: preset.selected,
          value: preset.value
        });
      }
    });

    this.flagStates.set(flagMap);
    this.optionStates.set(optionMap);
  }

  resetCommand(): void {
    const cmd = this.command();
    if (cmd) {
      this.initializeStates(cmd);
    }
  }

  saveCommand(): void {
    const cmd = this.command();
    const cmdString = this.generatedCommand();
    if (cmd && cmdString) {
      this.commandService.saveToHistory(cmd.id, cmdString);
      // Refresh history instantly
      this.historyComponent()?.loadHistory();
      // Show feedback
      this.saveButtonText.set('✓ Saved!');
      setTimeout(() => this.saveButtonText.set('Save to History'), 2000);
    }
  }

  copyToClipboard(): void {
    const cmd = this.generatedCommand();
    navigator.clipboard.writeText(cmd).then(() => {
      this.copyButtonText.set('Copied!');
      setTimeout(() => this.copyButtonText.set('Copy'), 2000);
    });
  }
}

import { Component, signal, computed, effect, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommandService } from '../../services/command.service';
import { Command } from '../../models/command.model';
import { CommandHistoryComponent } from '../command-history.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner.component';
import { CommandHeaderComponent } from './components/command-header.component';
import { GeneratedCommandDisplayComponent } from './components/generated-command-display.component';
import { FlagItemComponent } from './components/flag-item.component';
import { OptionItemComponent } from './components/option-item.component';
import { ExampleCardComponent, CommandExample } from './components/example-card.component';

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
  imports: [
    CommandHistoryComponent,
    LoadingSpinnerComponent,
    CommandHeaderComponent,
    GeneratedCommandDisplayComponent,
    FlagItemComponent,
    OptionItemComponent,
    ExampleCardComponent
  ],
  templateUrl: './command-builder.component.html',
})
export class CommandBuilderComponent {
  private route = inject(ActivatedRoute);
  private commandService = inject(CommandService);
  private titleService = inject(Title);
  private historyComponent = viewChild(CommandHistoryComponent);

  private routeParams = toSignal(this.route.paramMap);
  command = signal<Command | undefined>(undefined);
  isLoading = signal(true);
  private flagStates = signal<Map<string, FlagState>>(new Map());
  private optionStates = signal<Map<string, OptionState>>(new Map());
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
    effect(() => {
      this.generatedCommand();
    });

    effect(() => {
      const params = this.routeParams();
      const id = params?.get('id');
      
      if (id) {
        this.isLoading.set(true);
        this.command.set(undefined);
        
        const cmd = this.commandService.getCommand(id);
        this.command.set(cmd);
        
        if (cmd) {
          this.initializeStates(cmd);
          this.titleService.setTitle(`Command Builder - ${cmd.name}`);
        }
        
        this.isLoading.set(false);
      }
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

  applyExample(example: CommandExample): void {
    const cmd = this.command();
    if (!cmd) return;

    this.initializeStates(cmd);

    const flagMap = new Map(this.flagStates());
    const optionMap = new Map(this.optionStates());

    Object.keys(example.presets).forEach(key => {
      const preset = example.presets[key];
      
      if (flagMap.has(key)) {
        flagMap.set(key, { id: key, selected: preset.selected });
      }
      
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
      this.historyComponent()?.loadHistory();
      this.saveButtonText.set('✓ Saved!');
      setTimeout(() => this.saveButtonText.set('Save to History'), 2000);
    }
  }
}

import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Command, CommandData } from '../models/command.model';

export interface CommandHistoryEntry {
  command: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private platformId = inject(PLATFORM_ID);
  
  private commandsData = signal<Command[]>([]);
  
  commands = computed(() => this.commandsData());
  
  async loadCommands(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      const response = await fetch('/commands.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CommandData = await response.json();
      if (data) {
        this.commandsData.set(data.commands);
      }
    } catch (error) {
      console.error('Failed to load commands:', error);
      this.commandsData.set([]);
    }
  }
  
  getCommand(id: string): Command | undefined {
    return this.commandsData().find(cmd => cmd.id === id);
  }
  
  saveToHistory(commandId: string, commandString: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const key = `command-history-${commandId}`;
    const history = this.getHistory(commandId);
    
    const entry: CommandHistoryEntry = {
      command: commandString,
      timestamp: Date.now()
    };
    
    // Add to beginning and limit to 20 entries
    const updatedHistory = [entry, ...history].slice(0, 20);
    
    try {
      localStorage.setItem(key, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
  
  getHistory(commandId: string): CommandHistoryEntry[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    
    const key = `command-history-${commandId}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  }
  
  clearHistory(commandId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const key = `command-history-${commandId}`;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

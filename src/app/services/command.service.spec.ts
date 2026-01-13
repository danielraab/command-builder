import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { CommandService } from './command.service';
import { Command, CommandGroup, MenuItem } from '../models/command.model';

describe('CommandService', () => {
  let service: CommandService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn()
    } as Storage;

    TestBed.configureTestingModule({
      providers: [
        CommandService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(CommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadCommands', () => {
    it('should load commands successfully', async () => {
      const mockData = {
        commands: [
          {
            id: 'test-cmd',
            name: 'test',
            description: 'Test command',
            flags: [],
            options: []
          }
        ]
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response);

      await service.loadCommands();

      expect(service.commands()).toEqual(mockData.commands);
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await service.loadCommands();

      expect(service.commands()).toEqual([]);
      consoleErrorSpy.mockRestore();
    });

    it('should handle HTTP errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      } as Response);

      await service.loadCommands();

      expect(service.commands()).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCommand', () => {
    it('should find a command by id', async () => {
      const mockData = {
        commands: [
          {
            id: 'cmd1',
            name: 'test1',
            description: 'Test command 1',
            flags: [],
            options: []
          },
          {
            id: 'cmd2',
            name: 'test2',
            description: 'Test command 2',
            flags: [],
            options: []
          }
        ]
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response);

      await service.loadCommands();

      const result = service.getCommand('cmd1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('cmd1');
    });

    it('should return undefined for non-existent command', async () => {
      const mockData = { commands: [] };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response);

      await service.loadCommands();

      const result = service.getCommand('non-existent');
      expect(result).toBeUndefined();
    });

    it('should find commands in nested groups', async () => {
      const mockData = {
        commands: [
          {
            id: 'group1',
            name: 'Group 1',
            items: [
              {
                id: 'nested-cmd',
                name: 'nested',
                description: 'Nested command',
                flags: [],
                options: []
              }
            ]
          }
        ]
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response);

      await service.loadCommands();

      const result = service.getCommand('nested-cmd');
      expect(result).toBeDefined();
      expect(result?.id).toBe('nested-cmd');
    });
  });

  describe('getFlatCommands', () => {
    it('should return all commands flattened', async () => {
      const mockData = {
        commands: [
          {
            id: 'cmd1',
            name: 'test1',
            description: 'Test 1',
            flags: [],
            options: []
          },
          {
            id: 'group',
            name: 'Group',
            items: [
              {
                id: 'cmd2',
                name: 'test2',
                description: 'Test 2',
                flags: [],
                options: []
              }
            ]
          }
        ]
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response);

      await service.loadCommands();

      const result = service.getFlatCommands();
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain('cmd1');
      expect(result.map(c => c.id)).toContain('cmd2');
    });
  });

  describe('History Management', () => {
    const commandId = 'test-cmd';

    it('should save command to history', () => {
      const commandString = 'test --flag value';
      
      service.saveToHistory(commandId, commandString);

      const history = service.getHistory(commandId);
      expect(history).toHaveLength(1);
      expect(history[0].command).toBe(commandString);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should add new entries to the beginning', () => {
      service.saveToHistory(commandId, 'first');
      service.saveToHistory(commandId, 'second');

      const history = service.getHistory(commandId);
      expect(history[0].command).toBe('second');
      expect(history[1].command).toBe('first');
    });

    it('should limit history to 20 entries', () => {
      // Add 25 entries
      for (let i = 0; i < 25; i++) {
        service.saveToHistory(commandId, `command-${i}`);
      }

      const history = service.getHistory(commandId);
      expect(history).toHaveLength(20);
      expect(history[0].command).toBe('command-24');
    });

    it('should get empty history for new command', () => {
      const history = service.getHistory('non-existent-cmd');
      expect(history).toEqual([]);
    });

    it('should clear history', () => {
      service.saveToHistory(commandId, 'test');
      service.clearHistory(commandId);

      const history = service.getHistory(commandId);
      expect(history).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Mock localStorage to throw error
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => service.saveToHistory(commandId, 'test')).not.toThrow();
      consoleErrorSpy.mockRestore();
    });
  });
});

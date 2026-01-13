import { Command, CommandGroup, isCommand, isCommandGroup } from './command.model';

describe('Command Model', () => {
  describe('isCommand', () => {
    it('should return true for command objects', () => {
      const command: Command = {
        id: 'test',
        name: 'test',
        description: 'Test command',
        flags: [],
        options: []
      };

      expect(isCommand(command)).toBe(true);
    });

    it('should return false for command group objects', () => {
      const group: CommandGroup = {
        id: 'group',
        name: 'Group',
        items: []
      };

      expect(isCommand(group)).toBe(false);
    });

    it('should identify command with only flags', () => {
      const command: Command = {
        id: 'test',
        name: 'test',
        description: 'Test',
        flags: [{ id: 'f1', flag: '-v', description: 'Verbose' }],
        options: []
      };

      expect(isCommand(command)).toBe(true);
    });

    it('should identify command with only options', () => {
      const command: Command = {
        id: 'test',
        name: 'test',
        description: 'Test',
        flags: [],
        options: [{ id: 'o1', option: '-o', description: 'Output' }]
      };

      expect(isCommand(command)).toBe(true);
    });
  });

  describe('isCommandGroup', () => {
    it('should return true for command group objects', () => {
      const group: CommandGroup = {
        id: 'group',
        name: 'Group',
        items: []
      };

      expect(isCommandGroup(group)).toBe(true);
    });

    it('should return false for command objects', () => {
      const command: Command = {
        id: 'test',
        name: 'test',
        description: 'Test command',
        flags: [],
        options: []
      };

      expect(isCommandGroup(command)).toBe(false);
    });

    it('should identify group with nested commands', () => {
      const group: CommandGroup = {
        id: 'group',
        name: 'Group',
        items: [
          {
            id: 'cmd1',
            name: 'cmd1',
            description: 'Command 1',
            flags: [],
            options: []
          }
        ]
      };

      expect(isCommandGroup(group)).toBe(true);
    });

    it('should identify nested groups', () => {
      const group: CommandGroup = {
        id: 'parent',
        name: 'Parent',
        items: [
          {
            id: 'child',
            name: 'Child',
            items: []
          }
        ]
      };

      expect(isCommandGroup(group)).toBe(true);
      expect(isCommandGroup(group.items[0])).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should correctly discriminate between types', () => {
      const command: Command = {
        id: 'cmd',
        name: 'cmd',
        description: 'Command',
        flags: [],
        options: []
      };

      const group: CommandGroup = {
        id: 'grp',
        name: 'Group',
        items: []
      };

      const mixed = [command, group];

      mixed.forEach(item => {
        if (isCommand(item)) {
          expect(item.flags).toBeDefined();
          expect(item.options).toBeDefined();
        } else if (isCommandGroup(item)) {
          expect(item.items).toBeDefined();
        }
      });
    });
  });
});

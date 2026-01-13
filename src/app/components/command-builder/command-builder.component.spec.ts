import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { CommandBuilderComponent } from './command-builder.component';
import { CommandService } from '../../services/command.service';
import { Command } from '../../models/command.model';

describe('CommandBuilderComponent', () => {
  let component: CommandBuilderComponent;
  let fixture: ComponentFixture<CommandBuilderComponent>;
  let mockCommandService: any;
  let mockActivatedRoute: any;
  let mockTitleService: any;

  const mockCommand: Command = {
    id: 'test-cmd',
    name: 'testcmd',
    description: 'Test command',
    flags: [
      { id: 'flag1', flag: '-v', description: 'Verbose' },
      { id: 'flag2', flag: '--debug', description: 'Debug mode' }
    ],
    options: [
      {
        id: 'opt1',
        option: '-o',
        description: 'Output file',
        parameter: { type: 'text', placeholder: 'filename' }
      },
      {
        id: 'opt2',
        option: '--port',
        description: 'Port number',
        parameter: { type: 'number', defaultValue: 8080 }
      }
    ],
    examples: [
      {
        command: 'testcmd -v',
        description: 'Run in verbose mode',
        presets: {
          flag1: { selected: true }
        }
      }
    ]
  };

  beforeEach(async () => {
    mockCommandService = {
      getCommand: vi.fn().mockReturnValue(mockCommand),
      saveToHistory: vi.fn(),
      getHistory: vi.fn().mockReturnValue([])
    };

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => key === 'id' ? 'test-cmd' : null,
        getAll: () => [],
        keys: [],
        has: () => false
      })
    };

    mockTitleService = {
      setTitle: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CommandBuilderComponent],
      providers: [
        { provide: CommandService, useValue: mockCommandService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Title, useValue: mockTitleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load command on init', () => {
    expect(component.command()).toEqual(mockCommand);
    expect(component.isLoading()).toBe(false);
  });

  it('should set page title', () => {
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Command Builder - testcmd');
  });

  describe('Flag Management', () => {
    it('should toggle flag state', () => {
      expect(component.getFlagState('flag1')).toBe(false);
      
      component.toggleFlag('flag1');
      
      expect(component.getFlagState('flag1')).toBe(true);
    });

    it('should toggle flag state back to false', () => {
      component.toggleFlag('flag1');
      component.toggleFlag('flag1');
      
      expect(component.getFlagState('flag1')).toBe(false);
    });
  });

  describe('Option Management', () => {
    it('should toggle option state', () => {
      expect(component.getOptionState('opt1').selected).toBe(false);
      
      component.toggleOption('opt1');
      
      expect(component.getOptionState('opt1').selected).toBe(true);
    });

    it('should update option value', () => {
      const event = {
        target: { value: 'output.txt', type: 'text' }
      } as any;
      
      component.updateOptionValue('opt1', event);
      
      expect(component.getOptionState('opt1').value).toBe('output.txt');
    });

    it('should handle number values', () => {
      const event = {
        target: { value: '3000', type: 'number' }
      } as any;
      
      component.updateOptionValue('opt2', event);
      
      expect(component.getOptionState('opt2').value).toBe(3000);
    });

    it('should initialize with default values', () => {
      expect(component.getOptionState('opt2').value).toBe(8080);
    });
  });

  describe('Command Generation', () => {
    it('should generate base command', () => {
      expect(component.generatedCommand()).toBe('testcmd');
    });

    it('should include selected flags', () => {
      component.toggleFlag('flag1');
      
      expect(component.generatedCommand()).toBe('testcmd -v');
    });

    it('should include multiple flags', () => {
      component.toggleFlag('flag1');
      component.toggleFlag('flag2');
      
      expect(component.generatedCommand()).toBe('testcmd -v --debug');
    });

    it('should include options with values', () => {
      component.toggleOption('opt1');
      component.updateOptionValue('opt1', {
        target: { value: 'file.txt', type: 'text' }
      } as any);
      
      expect(component.generatedCommand()).toBe('testcmd -o file.txt');
    });

    it('should quote values with spaces', () => {
      component.toggleOption('opt1');
      component.updateOptionValue('opt1', {
        target: { value: 'my file.txt', type: 'text' }
      } as any);
      
      expect(component.generatedCommand()).toBe('testcmd -o "my file.txt"');
    });

    it('should generate complex command', () => {
      component.toggleFlag('flag1');
      component.toggleOption('opt2');
      component.updateOptionValue('opt2', {
        target: { value: '9000', type: 'number' }
      } as any);
      
      expect(component.generatedCommand()).toBe('testcmd -v --port 9000');
    });
  });

  describe('Example Application', () => {
    it('should apply example presets', () => {
      const example = mockCommand.examples![0];
      
      component.applyExample(example);
      
      expect(component.getFlagState('flag1')).toBe(true);
    });

    it('should reset unselected flags when applying example', () => {
      component.toggleFlag('flag1');
      component.toggleFlag('flag2');
      
      const example = mockCommand.examples![0];
      component.applyExample(example);
      
      expect(component.getFlagState('flag1')).toBe(true);
      expect(component.getFlagState('flag2')).toBe(false);
    });
  });

  describe('Reset Command', () => {
    it('should reset all states', () => {
      component.toggleFlag('flag1');
      component.toggleOption('opt1');
      
      component.resetCommand();
      
      expect(component.getFlagState('flag1')).toBe(false);
      expect(component.getOptionState('opt1').selected).toBe(false);
    });
  });

  describe('Save Command', () => {
    it('should save command to history', () => {
      component.toggleFlag('flag1');
      
      component.saveCommand();
      
      expect(mockCommandService.saveToHistory).toHaveBeenCalledWith('test-cmd', 'testcmd -v');
    });

    it('should update save button text temporarily', async () => {
      vi.useFakeTimers();
      
      component.saveCommand();
      
      expect(component.saveButtonText()).toBe('✓ Saved!');
      
      vi.advanceTimersByTime(2000);
      
      expect(component.saveButtonText()).toBe('Save to History');
      
      vi.useRealTimers();
    });
  });

  describe('Command Not Found', () => {
    it('should handle non-existent command', () => {
      mockCommandService.getCommand.mockReturnValue(undefined);
      fixture = TestBed.createComponent(CommandBuilderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component.command()).toBeUndefined();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on save button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const saveButton = compiled.querySelector('button[aria-label="Save command to history"]');
      
      expect(saveButton).toBeTruthy();
    });

    it('should have aria-label on reset button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const resetButton = compiled.querySelector('button[aria-label="Reset command to default"]');
      
      expect(resetButton).toBeTruthy();
    });

    it('should use semantic headings', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headings = compiled.querySelectorAll('h1, h2');
      
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});

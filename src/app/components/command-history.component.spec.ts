import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandHistoryComponent } from './command-history.component';
import { CommandService, CommandHistoryEntry } from '../services/command.service';

describe('CommandHistoryComponent', () => {
  let component: CommandHistoryComponent;
  let fixture: ComponentFixture<CommandHistoryComponent>;
  let mockCommandService: any;

  const mockHistory: CommandHistoryEntry[] = [
    { command: 'git commit -m "test"', timestamp: Date.now() - 1000 },
    { command: 'git push origin main', timestamp: Date.now() - 60000 },
    { command: 'git pull', timestamp: Date.now() - 3600000 }
  ];

  beforeEach(async () => {
    mockCommandService = {
      getHistory: vi.fn().mockReturnValue(mockHistory),
      clearHistory: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CommandHistoryComponent],
      providers: [
        { provide: CommandService, useValue: mockCommandService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandHistoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('commandId', 'test-cmd');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load history on init', () => {
    expect(component.history()).toEqual(mockHistory);
  });

  it('should display history entries', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const entries = compiled.querySelectorAll('code');
    
    expect(entries.length).toBe(3);
    expect(entries[0].textContent?.trim()).toBe('git commit -m "test"');
  });

  it('should show empty state when no history', () => {
    mockCommandService.getHistory.mockReturnValue([]);
    component.loadHistory();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector('p.text-gray-500');
    
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage?.textContent).toContain('No commands saved yet');
  });

  describe('copyToClipboard', () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true
      });
    });

    it('should copy command to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true
      });

      await component.copyToClipboard('git status');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('git status');
    });
  });

  describe('formatTimestamp', () => {
    it('should show "Just now" for recent timestamps', () => {
      const now = Date.now();
      expect(component.formatTimestamp(now)).toBe('Just now');
    });

    it('should show minutes for timestamps less than an hour ago', () => {
      const timestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago
      expect(component.formatTimestamp(timestamp)).toBe('5 minutes ago');
    });

    it('should show singular minute', () => {
      const timestamp = Date.now() - 1 * 60 * 1000; // 1 minute ago
      expect(component.formatTimestamp(timestamp)).toBe('1 minute ago');
    });

    it('should show singular hour', () => {
      const timestamp = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      expect(component.formatTimestamp(timestamp)).toBe('1 hour ago');
    });

    it('should show hours for timestamps less than a day ago', () => {
      const timestamp = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago
      expect(component.formatTimestamp(timestamp)).toBe('3 hours ago');
    });

    it('should show singular day', () => {
      const timestamp = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 day ago
      expect(component.formatTimestamp(timestamp)).toBe('1 day ago');
    });

    it('should show days for timestamps less than a week ago', () => {
      const timestamp = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
      expect(component.formatTimestamp(timestamp)).toBe('2 days ago');
    });

    it('should show full date for older timestamps', () => {
      const timestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      const result = component.formatTimestamp(timestamp);
      expect(result).toMatch(/\d+\/\d+\/\d+/); // Contains date format
    });
  });

  it('should reload history when commandId changes', () => {
    mockCommandService.getHistory.mockClear();
    
    fixture.componentRef.setInput('commandId', 'new-cmd');
    fixture.detectChanges();
    
    expect(mockCommandService.getHistory).toHaveBeenCalledWith('new-cmd');
  });

  describe('accessibility', () => {
    it('should have aria-label on clear history button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const clearButton = compiled.querySelector('button[aria-label="Clear command history"]');
      
      expect(clearButton).toBeTruthy();
    });

    it('should have aria-label on copy buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const copyButtons = compiled.querySelectorAll('button[aria-label="Copy command to clipboard"]');
      
      expect(copyButtons.length).toBe(mockHistory.length);
    });

    it('should use semantic heading for title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const heading = compiled.querySelector('h2');
      
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toContain('Command History');
    });
  });

  it('should clear and reload history', () => {
    component.clearHistory();
    
    expect(mockCommandService.clearHistory).toHaveBeenCalledWith('test-cmd');
    expect(mockCommandService.getHistory).toHaveBeenCalledWith('test-cmd');
  });
});

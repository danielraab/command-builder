import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommandService } from '../services/command.service';
import { Command } from '../models/command.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockCommandService: any;
  let mockTitleService: any;

  const mockCommands: Command[] = [
    {
      id: 'git',
      name: 'git',
      description: 'Git version control',
      link: 'https://git-scm.com',
      flags: [],
      options: []
    },
    {
      id: 'docker',
      name: 'docker',
      description: 'Docker container management',
      flags: [],
      options: []
    }
  ];

  beforeEach(async () => {
    mockCommandService = {
      getFlatCommands: vi.fn().mockReturnValue(mockCommands)
    };

    mockTitleService = {
      setTitle: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: CommandService, useValue: mockCommandService },
        { provide: Title, useValue: mockTitleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title on init', () => {
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Command Builder');
  });

  it('should display available commands', () => {
    expect(component.commands()).toEqual(mockCommands);
  });

  it('should render command cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const commandCards = compiled.querySelectorAll('a[class*="block p-6"]');
    
    expect(commandCards.length).toBe(2);
  });

  it('should display command names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const commandNames = Array.from(compiled.querySelectorAll('h3.font-mono'));
    const names = commandNames.map(el => el.textContent?.trim());
    
    expect(names).toContain('git');
    expect(names).toContain('docker');
  });

  it('should display command descriptions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptions = Array.from(compiled.querySelectorAll('p.text-gray-600'));
    
    expect(descriptions.some(el => el.textContent?.includes('Git version control'))).toBe(true);
    expect(descriptions.some(el => el.textContent?.includes('Docker container management'))).toBe(true);
  });

  it('should create router links for each command', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[class*="block p-6"]');
    
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toContain('/command/');
  });

  it('should show link icon only for commands with links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const commandCards = compiled.querySelectorAll('a[class*="block p-6"]');
    
    // First command (git) has a link, second (docker) does not
    const firstCardIcons = commandCards[0].querySelectorAll('svg');
    const secondCardIcons = commandCards[1].querySelectorAll('svg');
    
    expect(firstCardIcons.length).toBe(1);
    expect(secondCardIcons.length).toBe(0);
  });

  it('should display features list', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const features = compiled.querySelector('.bg-blue-50');
    
    expect(features).toBeTruthy();
    expect(features?.textContent).toContain('Interactive GUI');
    expect(features?.textContent).toContain('Real-time command preview');
  });

  it('should handle empty command list', () => {
    mockCommandService.getFlatCommands.mockReturnValue([]);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const commandCards = compiled.querySelectorAll('a[class*="block p-6"]');
    
    expect(commandCards.length).toBe(0);
  });
});

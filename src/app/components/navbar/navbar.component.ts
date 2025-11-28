import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommandService } from '../../services/command.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bg-gray-800 text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="shrink-0">
            <a routerLink="/" class="flex items-center gap-2 text-xl font-bold hover:text-gray-300 transition-colors">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="6,8 10,12 6,16" />
                <line x1="14" y1="16" x2="18" y2="16" />
              </svg>
              Command Builder
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex md:items-center md:space-x-1">
            @for (command of commands(); track command.id) {
              <a
                [routerLink]="['/command', command.id]"
                routerLinkActive="bg-gray-900"
                class="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-mono text-sm whitespace-nowrap"
              >
                {{ command.name }}
              </a>
            }
          </div>

          <!-- Mobile menu button -->
          <button
            type="button"
            class="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            (click)="toggleMenu()"
            [attr.aria-expanded]="isMenuOpen()"
            aria-label="Toggle navigation menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              @if (isMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        @if (isMenuOpen()) {
          <div class="md:hidden pb-4">
            <div class="flex flex-col space-y-1">
              @for (command of commands(); track command.id) {
                <a
                  [routerLink]="['/command', command.id]"
                  routerLinkActive="bg-gray-900"
                  class="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-mono text-sm"
                  (click)="closeMenu()"
                >
                  {{ command.name }}
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>
  `,
  styles: ``
})
export class NavbarComponent {
  private commandService = inject(CommandService);
  
  commands = computed(() => this.commandService.commands());
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}

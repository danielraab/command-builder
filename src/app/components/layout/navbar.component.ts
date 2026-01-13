import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandService } from '../../services/command.service';
import { isCommand, isCommandGroup } from '../../models/command.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styles: ``
})
export class NavbarComponent implements AfterViewInit {
  private commandService = inject(CommandService);
  
  commands = computed(() => this.commandService.commands());
  isMenuOpen = signal(false);
  openSubmenus = signal<Set<string>>(new Set());
  hoveredSubmenu = signal<string | null>(null);
  submenuPositions = signal<Map<string, 'left' | 'right'>>(new Map());

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleSubmenu(id: string) {
    const newSet = new Set(this.openSubmenus());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.openSubmenus.set(newSet);
  }

  isSubmenuOpen(id: string): boolean {
    return this.openSubmenus().has(id);
  }

  onSubmenuMouseEnter(id: string) {
    this.hoveredSubmenu.set(id);
  }

  onSubmenuMouseLeave() {
    this.hoveredSubmenu.set(null);
  }

  isSubmenuHovered(id: string): boolean {
    return this.hoveredSubmenu() === id;
  }

  getSubmenuPosition(id: string): 'left' | 'right' {
    return this.submenuPositions().get(id) || 'right';
  }

  ngAfterViewInit() {
    // Set up a mutation observer to adjust submenu positions as needed
    setTimeout(() => {
      this.adjustSubmenuPositions();
    }, 0);
  }

  private adjustSubmenuPositions() {
    const submenuElements = document.querySelectorAll('[data-submenu-id]');
    const positions = new Map<string, 'left' | 'right'>();

    submenuElements.forEach(element => {
      const id = element.getAttribute('data-submenu-id');
      if (id) {
        const rect = element.getBoundingClientRect();
        // If the submenu would overflow to the right, position it to the left
        if (rect.right + 192 > window.innerWidth) {
          positions.set(id, 'left');
        } else {
          positions.set(id, 'right');
        }
      }
    });

    this.submenuPositions.set(positions);
  }

  isCommand = isCommand;
  isCommandGroup = isCommandGroup;
}

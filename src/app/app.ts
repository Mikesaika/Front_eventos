import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'EventosApp';
  // Estado de los menús
  activeMenu: string | null = null;
  isMobileMenuOpen: boolean = false;

  toggleDropdown(menuName: string) {
    this.activeMenu = this.activeMenu === menuName ? null : menuName;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMenu() {
    this.activeMenu = null;
    this.isMobileMenuOpen = false;
  }
}
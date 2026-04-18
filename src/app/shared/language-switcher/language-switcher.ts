import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Translation } from '../../core/services/translation';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  lang = inject(Translation);
}

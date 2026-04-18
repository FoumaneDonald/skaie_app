import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class Translation {
  private translate = inject(TranslateService);

  private readonly STORAGE_KEY = 'skaie_lang';
  readonly supported: Lang[] = ['en', 'fr'];

  activeLang = signal<Lang>(this.loadLang());

  init(): void {
    const lang = this.activeLang();
    this.translate.addLangs(this.supported);
    this.translate.setDefaultLang('en');
    this.translate.use(lang);
  }

  switch(lang: Lang): void {
    this.translate.use(lang);
    this.activeLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    // Update html lang attribute for accessibility
    document.documentElement.lang = lang;
  }

  toggle(): void {
    this.switch(this.activeLang() === 'en' ? 'fr' : 'en');
  }

  private loadLang(): Lang {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Lang | null;
    if (stored && this.supported.includes(stored)) return stored;
    // Detect browser language
    const browser = navigator.language.split('-')[0] as Lang;
    return this.supported.includes(browser) ? browser : 'en';
  }
}

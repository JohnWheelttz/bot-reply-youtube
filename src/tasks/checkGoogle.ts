import puppeteer from 'puppeteer-extra';
import { Browser } from 'puppeteer';

import log from '../utils/log';

import accounts from '../accounts.json';

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Page } from 'puppeteer';

export default class CheckGoogleAccounts {
    private _puppeteer: typeof puppeteer = puppeteer;
    private _page: Page | null = null;
    private browser: Browser | null = null;
    
    async start(): Promise<void | never> {
        this._puppeteer.use(StealthPlugin());

        try {
            this.browser = await this._puppeteer.launch({
                args: ['--no-sandbox', '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"'],
                headless: true
            });
        } catch(e) {
            throw new Error('Erro ao abrir o browser');
        }
    }

    async close(): Promise<void> {
        this.browser && await this.browser.close();
    }

    async check(email: string, password: string, nameFile: string): Promise<void | never> {
        try {
            this._page = await this.browser!.newPage();
            await this._page.goto('https://accounts.google.com/', {
                waitUntil: 'networkidle0'
            });

            log('Entrou no google');
    
            await this._page.type('[type="email"]', email);
    
            await this._page.click('#identifierNext');
    
            log('Email selecionado');
    
            await this._page.waitForNavigation();
            
            await this._page.waitForSelector('[type="password"]');
            await this._page.waitForTimeout(2000);
            
            await this._page.type('[type="password"]', password);
    
            await this._page.click('#passwordNext');
    
            log('Senha adicionada');

            await this._page.waitForTimeout(5000);

            await this._page.screenshot({ path: nameFile });

            log('Print efetuada');
        } catch(e) {
            this.close();
            throw new Error('Erro ao fazer o login');
        }
    }
}

(async function() {
    for(let i = 0; i < accounts.length; i++) {
        const checkGoogleAccounts = new CheckGoogleAccounts();
        await checkGoogleAccounts.start();
        await checkGoogleAccounts.check(accounts[i].email, accounts[i].password, `login_${i}.png`);
        await checkGoogleAccounts.close();
    }
})();
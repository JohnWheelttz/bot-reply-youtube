import puppeteer from 'puppeteer-extra';
import { Browser } from 'puppeteer';

import events from '../utils/events';

import log from '../utils/log';

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Page } from 'puppeteer';

export default class Bot {
    private _botIsRunning: boolean = false;
    private _puppeteer: typeof puppeteer = puppeteer;
    private _page: Page | null = null;
    private browser: Browser | null = null;

    get botIsRunning(): boolean {
        return this._botIsRunning;
    }
    
    async start(): Promise<void | never> {
        this._botIsRunning = true;

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

    private async spamResYotube(com: string, delay: number): Promise<void | never> {     
            const res_com = com;

            try {
                await this._page!.waitForSelector('tp-yt-paper-button#button.style-scope.ytd-button-renderer.style-text.size-default[aria-label="Responder"]');

                log('Comentarios carregados');
    
                await this._page!.evaluate(() => {
                    window.scrollBy(0, 800);
                });
    
                log('Carregando mais comentarios');
    
                await this._page!.waitForTimeout(5000);
    
                await this._page!.evaluate(() => {
                    window.scrollBy(0, 1600);
                });
    
                log('Renderizando os comentarios');
    
                await this._page!.waitForTimeout(5000);
    
                await this._page!.evaluate((res_com: string, delay: number) => {
                    async function sleep(delay: number): Promise<void> {
                        return new Promise((resolve) => setTimeout(() => {
                            resolve();
                        }, delay));
                    }
                    
                    const comments = document.querySelectorAll('ytd-comment-renderer#comment');;
    
                    const c = [ ...comments ];
    
                    if(!c) return log('Nao tem comentarios');
                    
                    console.log(c.length);
                    async function spam(): Promise<void> {
                        for(let index = 0; index < c.length; index++) {  
                            console.log('+1 comentario');  
                            await sleep(delay);
    
                            (c[index].querySelector('div#toolbar')!.querySelector('tp-yt-paper-button#button.style-scope.ytd-button-renderer.style-text.size-default[aria-label="Responder"]') as HTMLButtonElement).click();
        
                            (c[index].querySelector('div#reply-dialog')!.querySelector('[aria-label="Adicione uma resposta pública..."]') as HTMLDivElement).innerText = res_com;
        
                            c[index].querySelector('div#reply-dialog')!.querySelector('[aria-label="Responder"]')!.parentElement!.parentElement!.removeAttribute('disabled');
    
                            (c[index].querySelector('div#reply-dialog')!.querySelector('[aria-label="Responder"]') as HTMLButtonElement).click();
                            }
                        }
    
                    spam().then(() => {
                        console.log('Spam finalizado');
                    });
                }, res_com, delay);
            } catch(e) {
                this.close();
                throw new Error('Erro ao tentar comentar');
            }
    }

    public async spam(id: string, comment: string, delay: number = 4000): Promise<void | never> {
        if(!this._page) {
            this.browser && this.browser.close();
            throw new Error('Login first');
        }

        try {
            await this._page.goto(`https://www.youtube.com/watch?v=${id}`, {
                waitUntil: 'networkidle0'
            });

            log('Entrou no youtube');
    
            await this._page.evaluate(() => {
                window.scrollBy(0, 400);
            });
            
            await this.spamResYotube(comment, delay);
        } catch(e) {
            this.close();
            throw new Error('Erro ao acessar o youtube');
        }
    }

    async close(event: string = 'close'): Promise<void> {
        this._botIsRunning = false;
        events.emit(`bot_${event}`);
        this.browser && await this.browser.close();
    }

    async login(email: string, password: string): Promise<void | never> {
        try {
            this._page = await this.browser!.newPage();
            await this._page.goto('https://accounts.google.com/', {
                waitUntil: 'networkidle0'
            });

            this._page!.on('console', (c) => {
                if(c.type() === 'log' && c.text() === '+1 comentario') {
                    log(c.text());
                }

                if(c.type() === 'log' && c.text() === 'Spam finalizado') {
                    log('Spam finalizado');
                    this.close('finished');
                }
            });

            await this._page.setViewport({ width: 1366, height: 768});

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
    
            await this._page.waitForNavigation({
                waitUntil: 'load'
            });
    
            log('Logado com sucesso no google');
        } catch(e) {
            this.close();
            throw new Error('Erro ao fazer o login');
        }
    }
}

/*
(async function() {
    const bot = new Bot();
    await bot.start();
    await bot.login('baitaliww2@gmail.com', 'senhaaberta');
    await bot.spam('IwYL8X0Cxtw', 'Ei nerd xingando seus inscritos https://youtu.be/GfBH2Mb9ZSI', 5000);
})();
*/
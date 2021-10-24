"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const events_1 = __importDefault(require("../utils/events"));
const log_1 = __importDefault(require("../utils/log"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
class Bot {
    constructor() {
        this._botIsRunning = false;
        this._puppeteer = puppeteer_extra_1.default;
        this._page = null;
        this.browser = null;
    }
    get botIsRunning() {
        return this._botIsRunning;
    }
    async start() {
        this._botIsRunning = true;
        this._puppeteer.use((0, puppeteer_extra_plugin_stealth_1.default)());
        try {
            this.browser = await this._puppeteer.launch({
                args: ['--no-sandbox', '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"'],
                headless: true
            });
        }
        catch (e) {
            throw new Error('Erro ao abrir o browser');
        }
    }
    async spamResYotube(com, delay) {
        const res_com = com;
        try {
            await this._page.waitForSelector('tp-yt-paper-button#button.style-scope.ytd-button-renderer.style-text.size-default[aria-label="Responder"]');
            (0, log_1.default)('Comentarios carregados');
            await this._page.evaluate(() => {
                window.scrollBy(0, 800);
            });
            (0, log_1.default)('Carregando mais comentarios');
            await this._page.waitForTimeout(5000);
            await this._page.evaluate(() => {
                window.scrollBy(0, 1600);
            });
            (0, log_1.default)('Renderizando os comentarios');
            await this._page.waitForTimeout(5000);
            await this._page.evaluate((res_com, delay) => {
                async function sleep(delay) {
                    return new Promise((resolve) => setTimeout(() => {
                        resolve();
                    }, delay));
                }
                const comments = document.querySelectorAll('ytd-comment-renderer#comment');
                ;
                const c = [...comments];
                if (!c)
                    return (0, log_1.default)('Nao tem comentarios');
                console.log(c.length);
                async function spam() {
                    for (let index = 0; index < c.length; index++) {
                        console.log('+1 comentario');
                        await sleep(delay);
                        c[index].querySelector('div#toolbar').querySelector('tp-yt-paper-button#button.style-scope.ytd-button-renderer.style-text.size-default[aria-label="Responder"]').click();
                        c[index].querySelector('div#reply-dialog').querySelector('[aria-label="Adicione uma resposta pública..."]').innerText = res_com;
                        c[index].querySelector('div#reply-dialog').querySelector('[aria-label="Responder"]').parentElement.parentElement.removeAttribute('disabled');
                        c[index].querySelector('div#reply-dialog').querySelector('[aria-label="Responder"]').click();
                    }
                }
                spam().then(() => {
                    console.log('Spam finalizado');
                });
            }, res_com, delay);
        }
        catch (e) {
            this.close();
            throw new Error('Erro ao tentar comentar');
        }
    }
    async spam(id, comment, delay = 4000) {
        if (!this._page) {
            this.browser && this.browser.close();
            throw new Error('Login first');
        }
        try {
            await this._page.goto(`https://www.youtube.com/watch?v=${id}`, {
                waitUntil: 'networkidle0'
            });
            (0, log_1.default)('Entrou no youtube');
            await this._page.evaluate(() => {
                window.scrollBy(0, 400);
            });
            await this.spamResYotube(comment, delay);
        }
        catch (e) {
            this.close();
            throw new Error('Erro ao acessar o youtube');
        }
    }
    async close(event = 'close') {
        this._botIsRunning = false;
        events_1.default.emit(`bot_${event}`);
        this.browser && await this.browser.close();
    }
    async login(email, password) {
        try {
            this._page = await this.browser.newPage();
            await this._page.goto('https://accounts.google.com/', {
                waitUntil: 'networkidle0'
            });
            this._page.on('console', (c) => {
                if (c.type() === 'log' && c.text() === '+1 comentario') {
                    (0, log_1.default)(c.text());
                }
                if (c.type() === 'log' && c.text() === 'Spam finalizado') {
                    (0, log_1.default)('Spam finalizado');
                    this.close('finished');
                }
            });
            await this._page.setViewport({ width: 1366, height: 768 });
            (0, log_1.default)('Entrou no google');
            await this._page.type('[type="email"]', email);
            await this._page.click('#identifierNext');
            (0, log_1.default)('Email selecionado');
            await this._page.waitForNavigation();
            await this._page.waitForSelector('[type="password"]');
            await this._page.waitForTimeout(2000);
            await this._page.type('[type="password"]', password);
            await this._page.click('#passwordNext');
            (0, log_1.default)('Senha adicionada');
            await this._page.waitForNavigation({
                waitUntil: 'load'
            });
            (0, log_1.default)('Logado com sucesso no google');
        }
        catch (e) {
            this.close();
            throw new Error('Erro ao fazer o login');
        }
    }
}
exports.default = Bot;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const log_1 = __importDefault(require("../utils/log"));
const accounts_json_1 = __importDefault(require("../accounts.json"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
class CheckGoogleAccounts {
    constructor() {
        this._puppeteer = puppeteer_extra_1.default;
        this._page = null;
        this.browser = null;
    }
    async start() {
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
    async close() {
        this.browser && await this.browser.close();
    }
    async check(email, password, nameFile) {
        try {
            this._page = await this.browser.newPage();
            await this._page.goto('https://accounts.google.com/', {
                waitUntil: 'networkidle0'
            });
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
            await this._page.waitForTimeout(5000);
            await this._page.screenshot({ path: `${nameFile}` });
            (0, log_1.default)('Print efetuada');
        }
        catch (e) {
            this.close();
            throw new Error('Erro ao fazer o login');
        }
    }
}
exports.default = CheckGoogleAccounts;
(async function () {
    for (let i = 0; i < accounts_json_1.default.length; i++) {
        const checkGoogleAccounts = new CheckGoogleAccounts();
        await checkGoogleAccounts.start();
        await checkGoogleAccounts.check(accounts_json_1.default[i].email, accounts_json_1.default[i].password, `login_${i}.png`);
        await checkGoogleAccounts.close();
    }
})();

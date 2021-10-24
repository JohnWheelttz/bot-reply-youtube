"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const bot_1 = __importDefault(require("./lib/bot"));
const events_1 = __importDefault(require("./utils/events"));
const log_1 = __importDefault(require("./utils/log"));
const accounts_json_1 = __importDefault(require("./accounts.json"));
require('dotenv').config();
class Server {
    constructor() {
        this._bot = new bot_1.default();
        this._moment = 0;
        this._last_id = process.env.LAST_VIDEO;
        events_1.default.on('bot', async () => {
            try {
                try {
                    await this.startBot(accounts_json_1.default[0].email, accounts_json_1.default[0].password);
                }
                catch (e) {
                    (0, log_1.default)('[1] Erro no bot tentando novamente');
                    await this.startBot(accounts_json_1.default[0].email, accounts_json_1.default[0].password);
                }
            }
            catch (e) {
                (0, log_1.default)('[1] Erro no bot depois de duas tentavias');
            }
        });
        events_1.default.on('bot_finished', async () => {
            if (this._moment === 0) {
                this._moment = 1;
                (0, log_1.default)('Iniciando spam novamente com outra conta');
                try {
                    try {
                        await this.startBot(accounts_json_1.default[1].email, accounts_json_1.default[1].password);
                    }
                    catch (e) {
                        (0, log_1.default)('[2] Erro no bot tentando novamente');
                        await this.startBot(accounts_json_1.default[1].email, accounts_json_1.default[1].password);
                    }
                }
                catch (e) {
                    (0, log_1.default)('[2] Erro no bot depois de duas tentavias');
                }
            }
            else {
                this._moment = 0;
            }
        });
    }
    async startBot(email, password) {
        await this._bot.start();
        await this._bot.login(email, password);
        await this._bot.spam(this._last_id, process.env.MSG, 5000);
    }
    start() {
        setInterval(async () => {
            (0, log_1.default)('Verificando ultimo video');
            try {
                const { data } = await axios_1.default.get(`https://${process.env.BASE_URL}/youtube/v3/search?key=${process.env.API_KEY}&channelId=${process.env.CHANNEL}&part=snippet,id&order=date&maxResults=1`);
                if (data.items[0].id.videoId !== this._last_id) {
                    this._last_id = data.items[0].id.videoId;
                    (0, log_1.default)('Video novo!');
                    (0, log_1.default)('Spam setado');
                    setTimeout(() => {
                        (0, log_1.default)('Bot iniciado');
                        events_1.default.emit('bot');
                    }, 900000);
                }
                else {
                    (0, log_1.default)('Nenhum video novo encontrado');
                }
            }
            catch (e) {
                const error = e;
                (0, log_1.default)('Erro na solicitacao');
            }
        }, 600000);
    }
}
(function () {
    const server = new Server();
    server.start();
})();

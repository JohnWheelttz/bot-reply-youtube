import axios from 'axios';

import Bot from './lib/bot';

import events from './utils/events';
import log from './utils/log';

import accounts from './accounts.json'

require('dotenv').config();

class Server {
    private _bot = new Bot();
    private _moment: number = 0;
    private _last_id = process.env.LAST_VIDEO!;
    constructor() {
        events.on('bot', async () => {
            try {
                try {
                    await this.startBot(accounts[0].email, accounts[0].password);
                } catch(e) {
                    log('[1] Erro no bot tentando novamente');
                    await this.startBot(accounts[0].email, accounts[0].password);
                }
            } catch(e) {
                log('[1] Erro no bot depois de duas tentavias');
            }
        });
        
        events.on('bot_finished', async () => {
            if(this._moment === 0) {
                this._moment = 1;
                log('Iniciando spam novamente com outra conta');
                
                try {
                    try {
                        await this.startBot(accounts[1].email, accounts[1].password);
                    } catch(e) {
                        log('[2] Erro no bot tentando novamente');
                        await this.startBot(accounts[1].email, accounts[1].password);
                    }
                } catch(e) {
                    log('[2] Erro no bot depois de duas tentavias');
                }
            } else {
                this._moment = 0;
            }
        });
    }

    private async startBot(email: string, password: string): Promise<void> {
        await this._bot.start();
        await this._bot.login(email, password);
        await this._bot.spam(this._last_id, process.env.MSG!, 5000);
    }

    start() {
        setInterval(async () => {
            log('Verificando ultimo video');
            try {
                const { data }: { data: {
                    [key: string]: any;
                    items: [{
                        id: {
                            videoId: string;
                        }
                    }];
                }} = await axios.get(`https://${process.env.BASE_URL}/youtube/v3/search?key=${process.env.API_KEY}&channelId=${process.env.CHANNEL}&part=snippet,id&order=date&maxResults=1`);
        
                if(data.items[0].id.videoId !== this._last_id) {
                    this._last_id = data.items[0].id.videoId;
        
                    log('Video novo!');
                    log('Bot iniciado');

                    events.emit('bot');
                } else {
                    log('Nenhum video novo encontrado');
                }
        
            } catch(e) {
                const error = e as { response: {
                    data: any
                } };
        
                log('Erro na solicitacao');
            }
            
        }, 600000);
    }
}

(function() {
    const server = new Server();
    server.start();
})();
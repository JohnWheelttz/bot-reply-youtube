export default function log(text: string): void {
    const date = new Date();
    const hours = date.getHours().toString().length === 1 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes().toString().length === 1 ? `0${date.getMinutes()}` : date.getMinutes().toString();

    const day = date.toLocaleDateString('pt-br', {
        timeZone: 'America/Sao_Paulo'
    });

    console.log(`[${day}|${hours}:${minutes}] ${text}`);
}
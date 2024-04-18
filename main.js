const DiscordRPC = require('discord-rpc');

const clientId = '1207793663963562046'; // Replace 'your-client-id' with your actual client ID

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

DiscordRPC.register(clientId);

rpc.on('ready', () => {
    console.log('Ready!');
    rpc.setActivity({
        details: 'Listening to',
        state: 'Level 1',
        startTimestamp: new Date(),
        largeImageKey: 'game-logo',
        largeImageText: 'Game Name',
        smallImageKey: 'character-name',
        smallImageText: 'Character Name',
        buttons: [
            { label: 'Visit Website', url: 'https://example.com' },
            { label: 'Download Now', url: 'https://example.com/download' },
        ],
    });
});

rpc.login({ clientId: clientId }).catch(console.error);
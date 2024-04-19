const DiscordRPC = require('discord-rpc');
const fs = require('fs');

const clientId = '1207793663963562046'; // Replace 'your-client-id' with your actual client ID

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
DiscordRPC.register(clientId);

let details, state, largeImageKey, largeImageText, smallImageKey, smallImageText, buttons;

function updateActivity() {
    
    rpc.setActivity({
        details: details,
        state: state,
        startTimestamp: new Date(),
        largeImageKey: largeImageKey,
        largeImageText: largeImageText,
        smallImageKey: smallImageKey,
        smallImageText: smallImageText,
        buttons: buttons.map(button => ({ label: button.label, url: button.url })),
    }).catch(console.error);
}

function readJSONFile() {
    fs.readFile('./song.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
      
        // Parse JSON data
        const jsonData = JSON.parse(data);

        // Assign variables from JSON data
        details = jsonData.info.details;
        state = jsonData.info.state;
        largeImageKey = jsonData.info.largeImageKey;
        largeImageText = jsonData.info.largeImageText;
        smallImageKey = jsonData.info.smallImageKey;
        smallImageText = jsonData.info.smallImageText;
        buttons = jsonData.info.buttons;

        // Update activity
        updateActivity();
    });
}

// Initial read and setup
readJSONFile();

// Watch for changes in the JSON file
// Watch for changes in the JSON file
fs.watchFile('./song.json', (curr, prev) => {
    console.log('File changed:', './song.json');
    readJSONFile();
});


rpc.on('ready', () => {
    console.log('Ready!');
    updateActivity();
});

rpc.login({ clientId: clientId }).catch(console.error);

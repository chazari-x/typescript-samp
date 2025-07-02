require('dotenv').config();
const fs = require('fs');
const JSON5 = require('json5');

const CONFIG_FILE = './samp-conf.json5';

const configRaw = fs.readFileSync(CONFIG_FILE, 'utf8');
const config = JSON5.parse(configRaw);

// Список параметров, которые можно подставить из env
const paramsToUpdate = {
    port: 'PORT',
    hostName: 'HOSTNAME',
    gameModeText: 'GAMEMODETEXT',
    maxPlayers: 'MAXPLAYERS',
    rconPassword: 'RCONPASSWORD',
    lanmode: 'LANMODE',
    maxNpc: 'MAXNPC',
    webUrl: 'WEBURL',
    password: 'PASSWORD',
};

// Для каждого параметра: если есть env-переменная — обновляем конфиг
for (const [key, envVar] of Object.entries(paramsToUpdate)) {
    if (process.env[envVar] !== undefined) {
        let value = process.env[envVar];

        // Попытка привести к нужному типу (число, boolean)
        if (['port', 'maxPlayers', 'maxNpc'].includes(key)) {
            value = Number(value);
        } else if (['lanmode'].includes(key)) {
            value = value === 'true' || value === '1';
        }

        config[key] = value;
    }
}

// Записываем обратно в файл (с форматированием)
fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

console.log('Config updated with env variables:', Object.keys(paramsToUpdate).filter(k => process.env[paramsToUpdate[k]] !== undefined));

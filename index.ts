import WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

console.log('Starting!')
let isGlobalTickStarted = false
wss.on('connection', function (ws) {
    ws.on('message', (msg: string) => {
        ws.send(`Message Recieved: ${JSON.stringify(msg)}`)
        const data = JSON.parse(msg);
        const { wood, copperOre, copperBars, wallHp, user } = data;
        state.wood += wood;
        state.copperOre += copperOre;
        state.copperBars += copperBars;
        state.wallHp += wallHp

        wss.clients.forEach((client: any) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`User: ${user} made a contribution: ${JSON.stringify(state)}`)
            }
        })
    });
    ws.send('Connected');

    if (!isGlobalTickStarted) {
        isGlobalTickStarted = false;
        setInterval(() => {
            wss.clients.forEach( (client: any) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(`Global Tick`)
                }
            })
        }, 5000)
    }
});

const state = {
    wood: 0,
    copperOre: 0,
    copperBars: 0,
    wallHp: 100
};


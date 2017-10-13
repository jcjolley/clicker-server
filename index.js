"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const index_1 = require("./reducers/index");
const WebSocket = require("ws");
const R = require("ramda");
const store = redux_1.createStore(index_1.default);
const wss = new WebSocket.Server({ port: 3000 });
console.log('Starting!');
const welcome = {
    display: true,
    msg: 'Welcome to the clicker game',
    state: store.getState()
};
wss.on('connection', function (ws) {
    ws.send(JSON.stringify(welcome));
    startGlobalTick(ws);
    setupSubscription(ws, store);
    handleAction(ws);
    beginTheAttack(ws, store);
});
const setupSubscription = R.once((ws, store) => store.subscribe(broadcastOnUpdate(ws, store)));
const startGlobalTick = R.once((ws) => {
    const tick = {
        msg: 'Global Tick',
    };
    setInterval(() => broadcast(ws, tick), 5 * 1000);
});
function broadcast(ws, msg) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}
const handleAction = (ws) => {
    ws.on('message', (msg) => {
        const { user, action } = JSON.parse(msg);
        const response = {
            display: true,
            msg: `${user} contributed ${JSON.stringify(action)}`
        };
        broadcast(ws, response);
        store.dispatch(action);
    });
};
const broadcastOnUpdate = (ws, store) => () => {
    const response = {
        msg: 'State Updated',
        state: store.getState()
    };
    broadcast(ws, response);
};
const beginTheAttack = R.once((ws, store) => {
    setInterval(() => {
        const damage = getRandomInt(1, 20);
        store.dispatch({ type: 'DAMAGE WALL', payload: damage });
        const response = {
            display: true,
            msg: `An evil goblin has attacked the wall for ${damage} damage!!`
        };
        broadcast(ws, response);
    }, 2500);
});
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

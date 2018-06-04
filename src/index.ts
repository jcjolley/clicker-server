import { createStore, Store } from 'redux';
import reducer from './reducers/index'
import WebSocket = require('ws');
import * as R from 'ramda';

const store = createStore(reducer)
const wss = new WebSocket.Server({ port: 3000 });

console.log('Starting!')
const welcome = {
    display: true,
    msg: 'Welcome to the clicker game',
    state: store.getState()
}

wss.on('connection', function (ws) {
    ws.send(JSON.stringify(welcome));
    startGlobalTick(ws);
    setupSubscription(ws, store);
    handleAction(ws);
    beginTheAttack(ws, store);
});

const setupSubscription = R.once((ws, store: Store<any>) =>
   store.subscribe(broadcastOnUpdate(ws, store)) 
)

const startGlobalTick = R.once((ws) => {
    const tick = {
        msg: 'Global Tick',
        numPlayers: wss.clients.size
    }
    setInterval(() => broadcast(ws, tick), 5 * 1000);
});

function broadcast(ws: any, msg: any) {
    wss.clients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg))
        }
    })
}

function broadcastOthers(ws: any, msg: any) {
    wss.clients.forEach((client: any) => {
        if (client != ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg))
        }
    })
}


const handleAction = (ws) => {
    ws.on('message', (msg: string) => {
        const { user, action } = JSON.parse(msg);

        const response = {
            display: true,
            msg: translateAction(user, action)
        }
        broadcastOthers(ws, response);

        store.dispatch(action);
    });
};

const broadcastOnUpdate = (ws, store) => () => {
    const response = {
        msg: 'State Updated',
        state: store.getState()
    };
    broadcast(ws, response)
}

const beginTheAttack = R.once((ws, store) => {
    setInterval(() => {
        if (store.getState().materials.wallHp > 0) {
            const damage = getRandomInt(1, 20)
            store.dispatch({ type: 'DAMAGE WALL', payload: damage })
            const response = {
                display: true,
                msg: `An evil goblin has attacked the wall for ${damage} damage!!`
            }
            broadcast(ws, response)
        }
    }, 2500)
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function translateAction(user, {type, payload}) {
    switch(type) {
       case 'ADD WOOD':
        return `${user} contributed ${payload} wood to the cause.`
       case 'ADD COPPER':
        return `${user} contributed ${payload} copper to the cause.`
       case 'REPAIR WALL':
        return `${user} repaired the wall for ${payload} hp.`
    }
}
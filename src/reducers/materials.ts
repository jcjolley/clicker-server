import * as R from 'ramda'

const defaultState = {
    wood: 0,
    copper: 0,
    wallHp: 1000
}

export default function materials(state = defaultState, {type, payload}) {
    switch (type) {
        case 'ADD WOOD': 
            return R.evolve({wood: R.add(payload)}, state);
        case 'ADD COPPER': 
            return R.evolve({copper: R.add(payload)}, state);
        case 'REPAIR WALL':
            return repairWall(state);
        case 'DAMAGE WALL':
            return damageWall(state, payload);
        default:
            return state;
    }
}

function repairWall(state) {
    const {wood, copper, wallHp} = state
    if (wood >= 10 && copper >= 10 && wallHp <= 990) {
        return R.evolve({
            wood: R.subtract(R.__, 10),
            copper: R.subtract(R.__, 10),
            wallHp: R.add(10)
        }, state)
    }
    return state;
}

function damageWall(state, payload) {
    if (state.wallHp > payload)
        return R.evolve({wallHp: R.subtract(R.__, payload)}, state)
    else 
        return R.assoc('wallHp', 0, state);
}


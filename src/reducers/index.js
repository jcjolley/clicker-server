"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const materials_1 = require("./materials");
exports.default = redux_1.combineReducers({
    materials: materials_1.default
});

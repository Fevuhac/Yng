const EventEmitter = require('events').EventEmitter;
const util = require('util');

let id = 1;

class Entity extends EventEmitter{
    constructor(opts){
        super();
        this.entityId = id++;
        this._kindId = opts.kindId;
        this.kindName = opts.kindName;
    }

    get kindId(){
        return this._kindId;
    }

}

module.exports = Entity;


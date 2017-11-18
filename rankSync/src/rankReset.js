const REDISKEY = require('../../database/consts').REDISKEY;
const dbUtils = require('../../database/').dbUtils;
class RankReset{
    constructor(){

    }

    async handle(task){

        let cmds = [];
        for(let platform of Object.values(REDISKEY.PLATFORM_TYPE)){
            cmds.push(['del', `${task.redisKey}:${platform}`]);
            if(task.delete && task.delete.length > 0){
                task.delete.forEach(function (key) {
                    cmds.push(['del', key]);
                });
            }
        }
        await dbUtils.redisAccountSync.multiAsync(cmds);
    }
}

module.exports = RankReset;
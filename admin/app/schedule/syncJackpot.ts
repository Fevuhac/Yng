const Subscription1 = require('egg').Subscription;

class SyncJackpot extends Subscription1 {
  static get schedule() {
    return {
      interval: '1m',
      type: 'all',
    };
  }

  async subscribe() {
    console.log('>>>>Sync Jackpot Begin');
    await this.service.gameData.syncJackpot();
    console.log('<<<<Sync Jackpot Finish');
  }
}

module.exports = SyncJackpot;
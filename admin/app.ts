export default (app)=>{
    // curl -l -H "Content-type: application/json" -X POST -d '{"enc":false,"user":"admin","pwd":"123456"}'  "http://127.0.0.1:7001/admin/login"
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        // app.cities = await app.curl('http://example.com/city.json', {
        //   method: 'GET',

        //   dataType: 'json',
        // });

        // const mysqlConfig = await app.configCenter.curl('mysql');
        // app.database = app.mysql.createInstance(mysqlConfig);
        // app.model.sync({force: true});

      });

      //fishjoy:platformCatchRate; 平台捕获率
      //fishjoy：bonusPool; //奖金池（金币）
      //fishjoy:pump; //抽水（金币）
      //fishjoy:recharge; //平台充值总额度
      //fishjoy:cash; //平台兑现总额度
      //fishjoy:give; //平台赠送金币总量
      //pair:uid:playerCatchRate; //玩家捕获率
      //pair:uid:recharge; //玩家充值总额度
      //pair:uid:cash; //玩家兑现总额度

    
    app.config.coreMiddleware.unshift('report');


    app.on('error', (error)=>{
        console.log(error);
    });
}
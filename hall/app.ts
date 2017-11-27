export default (app)=>{

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

    app.config.coreMiddleware.unshift('report');
}
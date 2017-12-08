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


    app.config.coreMiddleware.unshift('report');


    app.on('error', (error)=>{
        console.log(error);
    });
}
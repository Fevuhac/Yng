const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);



  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker process ${worker.process.pid} exit`);
  });

  function messageHandler(msg) {
    console.log(msg);
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  for (const id in cluster.workers) {
    console.log('--------------------------cluster.workers:', id);
    cluster.workers[id].on('message', messageHandler);
  }

    console.log(`master ${process.pid} started`);
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('welcom to world\n');

    // 通知 master 进程接收到了请求
    process.send({ cmd: 'notifyRequest' });

  }).listen(7001);

  console.log(`worker process ${process.pid} started`);
}
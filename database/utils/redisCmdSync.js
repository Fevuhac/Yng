

exports.zremrangebyrank = (key, start, stop) => {
    return new Promise(function (resolve, reject) {
        redisConnector.cmd.zremrangebyrank(key, start, stop, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    })
}

exports.zcard = (key) => {
    return new Promise(function (resolve, reject) {
        redisConnector.cmd.zcard(key, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    })
}
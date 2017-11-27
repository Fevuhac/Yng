'use strict';

import * as moment from 'moment';
const crypto = require('crypto');
exports.relativeTime =(time)=>moment(new Date(time*1000)).fromNow();
exports.domain =(url)=>url && url.split('/')[2];
exports.encodePwd = (salt:string, pwd:string)=>{
    let sha = crypto.createHash('sha512');
    sha.update(salt);
    sha.update(pwd);

    let hv = sha.digest();
    let i;
    for (i = 0; i < 512; i++) {
        sha = crypto.createHash('sha512');
        sha.update(hv);
        hv = sha.digest();
    }

    return hv.toString('base64');
}

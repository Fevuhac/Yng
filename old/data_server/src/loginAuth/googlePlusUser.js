'use strict';

const https = require('https');
const User = require('./user');

class GooglePlusUser extends User {
  constructor() {
    super();
    this._baseInfo_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
  }

  //https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjQzOTcwYTA3OGFjODQ1YzYzNTJkODdmMDBkZWJkNjU1ZTM0NTA3M2UifQ.eyJhenAiOiI0OTMwNjU3MTU3NTEtbDBhYmhvZ2phbXV1MGs4Y3RzY2JqNzU5ZXRrMnZvbnMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0OTMwNjU3MTU3NTEtbDBhYmhvZ2phbXV1MGs4Y3RzY2JqNzU5ZXRrMnZvbnMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ1Njg0Mjg3MTQ3NzE4OTM3NTUiLCJlbWFpbCI6Imhzbm1nMDUyOUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Illva1J2RWRLOVZRM2psN2JJcWVDelEiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiMTMyMDM0NGIxYjBiNjIwMGJhZTQzZmY1NWZhYzdhMzBkMzhkYjg1MiIsImlhdCI6MTUxMzkzMDE0OSwiZXhwIjoxNTEzOTMzNzQ5LCJuYW1lIjoiU29uZ01pbmcgSGUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1sYmxEbW5Oa2RHcy9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BRmlZb2Ywdkp6R243MDRabERkQVZXdjJ4Zk04dXBXb1B3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJTb25nTWluZyIsImZhbWlseV9uYW1lIjoiSGUiLCJsb2NhbGUiOiJ6aC1DTiJ9.E0aVtmjI4q-cvYI_9r8IBT44e3qN3-Dj2uH_fsh0ygG3BJQhM4FyCHyOVhxBXBlWzAKisu_uxNLmJewR6up9tJ3hfNpOuCQsVbBWftOJ4E2hS1DPIYTtbsmET1mYdEpa1J7minUSGF6-9dHT9FV9r3OHtqZSiPbBwVowW1fjOrQASmUl7J2KXZdX0vN_dZtMu6nXVtyYIP5ZNtRm9hARmU6GQWf_lIJVmqVBT5CfYKqviRam8AcfadyH2TNbRVRr-xKjefziGMNs4U6fi5b2KU5ylmXOjK2t-HJXN3Qq7-lJI3kcCkhEVgP2LZOqh6PLlMtDVzzIYee5TuhzRYEQoQ

  getUserInfo(data) {
    console.log('----GooglePlusUser', data);
    return new Promise(function (resolve, reject) {
      https.get(`${this._baseInfo_url}?id_token=` + data.sdkAuthResponse.id_token, (res) => {
        console.log('状态码：', res.statusCode);
        console.log('请求头：', res.headers);

        res.on('data', (d) => {
          console.log('----GooglePlusUser d', d.toString());
          let sdk_user_info = JSON.parse(d.toString());

          console.log('----GooglePlusUser sdk_user_info', sdk_user_info);

          let info = {};
          if(sdk_user_info){
            info.nickname = sdk_user_info.name;
            info.sex = 'male' == sdk_user_info.gender ? 0 : 1;
            info.city = sdk_user_info.locale || 'secret';
            info.figure_url = sdk_user_info.picture;
            info.openid = sdk_user_info.sub;
            resolve(info);
          }
          else{
            console.error('----------------------sdk_user_info is empty');
            reject('错误');
          }

        });

      }).on('error', (err) => {
        console.error('google --------------------------', err);
        reject(err);
      });
    }.bind(this));

  }

}
module.exports = GooglePlusUser;
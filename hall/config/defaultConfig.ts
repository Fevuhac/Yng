export class DefaultConfig{
    login_platform = {
        facebook:0,
        wanba:1,
        qq:2,
        wechat:3
    };

    facebook:{
        serverUrl:''
    }
};

exports.middleware=[
    'uppercase'
];

exports.robot={
    ua:[
        /Baiduspider/i,
    ]
}

export default new DefaultConfig();

declare module 'egg'{
    export interface Application{
        config: EggAppConfig & DefaultConfig;
    }
}


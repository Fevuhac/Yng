import errorCode from './errorCode';

export class DefaultConfig{
    ErrorCode = errorCode;
};

export default new DefaultConfig;

declare module 'egg'{
    export interface Application{
        config: EggAppConfig & DefaultConfig;
    }
}


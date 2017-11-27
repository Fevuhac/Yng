import user from './user';
declare module 'egg'{
    export interface IService{
        user:User
    }
}
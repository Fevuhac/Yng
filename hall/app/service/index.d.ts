import user from './user';
import admin from './admin';
declare module 'egg'{
    export interface IService{
        user:User;
        admin:Admin;
    }
}
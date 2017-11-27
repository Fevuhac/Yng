import UserController from './user';

declare module 'egg' {
    export interface IController {
        user: UserController;
    }
}
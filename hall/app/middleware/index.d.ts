import AdminController from './admin';
import PlayerController from './players';
declare module 'egg' {
    export interface IController {
        admin: AdminController;
        players:PlayerController;
    }
}
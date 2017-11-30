import gameData from './game_data';
import admin from './admin';

declare module 'egg'{
    export interface IService{
        gameData:GameData;
        admin:Admin;
    }
}
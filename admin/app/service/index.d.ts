import gameData from './game_data';
import sysData from './sys_data';
import admin from './admin';
import page from './page';

declare module 'egg'{
    export interface IService{
        gameData:GameData;
        admin:Admin;
	page:Page;
        sysData:Sys_data;
    }
}
import import_def from '../util/import_def';
import WarningCoefficiency from './pojo/warningCoefficiencyPojo';

exports.getWarningCoefficiency =async (app)=>{
    try{
        let data=await app.redis.get(import_def.REDISKEY.WARNING_COEFFICIENCY.COEFFICIENCY);
        console.log("shuju:",data);
        if (null == data) {
            return {result:true,data:[],errCode:null};
        }
        let a = JSON.parse(data);
        if(typeof a =='object'){
            let wc = new WarningCoefficiency(a);
            return {result:true,data:wc,errCode:null};
        }else{
            //数据异常
            return {result:false,data:null,errCode:"json err"}
        }
    }
    catch(err){
        return {result:false,data:null,errCode:"dberror"}
    }  
}

exports.setWarningCoefficiency =async (app,phone,mail)=>{
    try{
        let data=await app.redis.get(import_def.REDISKEY.WARNING_COEFFICIENCY.COEFFICIENCY);
        let a = JSON.parse(data);
        console.log('a:', a);
        console.log('typeof a:', typeof a);
        if(typeof a =='object'){
            console.log('typeof mail:', typeof mail);
            let ret = {wc:null};
            if (!a) {
                let wc = new WarningCoefficiency({phone:phone, mail:mail});
                ret.wc = wc;
            }
            else {
                let wc = new WarningCoefficiency(a);
                mail && wc.addMail(mail);
                phone && wc.addPhone(phone);
                ret.wc = wc;
            }
            app.redis.set(import_def.REDISKEY.WARNING_COEFFICIENCY.COEFFICIENCY,JSON.stringify(ret.wc));
            return {result:true,data:ret.wc,errCode:null};
        }else{
            //数据异常
            console.log('数据异常');
            return {result:false,data:null,errCode:"json err"}
        }
    }
    catch(err){
        return {result:false,data:null,errCode:"dberror"}
    }  
}

exports.delWarningCoefficiency =async (app,phone,mail)=>{
    try{
        let data=await app.redis.get(import_def.REDISKEY.WARNING_COEFFICIENCY.COEFFICIENCY);
        let a = JSON.parse(data);
        if(typeof a =='object'){
            let wc = new WarningCoefficiency(a);
            mail && wc.delMail(mail);
            phone && wc.delPhone(phone);
            app.redis.set(import_def.REDISKEY.WARNING_COEFFICIENCY.COEFFICIENCY,JSON.stringify(wc));
            return {result:true,data:wc,errCode:null};
        }else{
            //数据异常
            return {result:false,data:null,errCode:"json err"}
        }
    }
    catch(err){
        return {result:false,data:null,errCode:"dberror"}
    }  
}
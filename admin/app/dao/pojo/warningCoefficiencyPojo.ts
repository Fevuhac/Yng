

export default class WarningCoefficiency implements warningCoefficiencyI{
    phone:string[];
    mail:string[];
    constructor(obj:warningCoefficiencyI){
        this.phone=obj.phone;
        this.mail=obj.mail;
    }

    addPhone(phone:string[]){
        for(let i in phone){
            let index=this.phone.indexOf(phone[i]);
            if(index==-1){
                this.phone.push(phone[i]);
            }
        }
        
    }

    delPhone(phone:string[]){
        for(let i in phone){
            let index=this.phone.indexOf(phone[i]);
            if(index!=-1){
                this.phone.splice(index,1);
            }
        }  
    }

    addMail(mail:string[]){
        for(let i in mail){
            let index=this.mail.indexOf(mail[i]);
            if(index==-1){
                this.mail.push(mail[i]);
            }
        }
    }

    delMail(mail:string[]){
        for(let i in mail){
            let index=this.mail.indexOf(mail[i]);
            if(index!=-1){
                this.mail.splice(index,1);
            }
        }
    }
}

interface warningCoefficiencyI{
    phone:string[];
    mail:string[];
}
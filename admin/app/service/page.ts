// import { Context, Service } from 'egg';
const Service = require('egg').Service;
const _ = require('underscore');

class Page extends Service {

    public async realtime() {
        return await this.makeRenderData(this.ctx, "TXT_ADMIN_REALTIME");
    }

    public async active() {
        return await this.makeRenderData(this.ctx, "TXT_ADMIN_ACTIVE");
    }

    public async online() {
        return await this.makeRenderData(this.ctx, "TXT_ADMIN_ONLINE");
    }

    public async register() {
        return await this.makeRenderData(this.ctx, "TXT_ADMIN_REGISTER");
    }

    public async retention() {
        return await this.makeRenderData(this.ctx, "TXT_ADMIN_RETENTION");
    }

    public async log() {
        return await this.makeRenderData(this.ctx, "TXT_SM_LOG");
    }

    public async payuser() {
        return await this.makeRenderData(this.ctx, "TXT_SM_PAYUSER");
    }

    // GM

    public async gmUpdate() {
        return await this.makeRenderData(this.ctx, "TXT_GM_UPDATE");
    }

    public async gmData() {
        return await this.makeRenderData(this.ctx, "TXT_GM_DATA");
    }

    public async gmBroadcast() {
        return await this.makeRenderData(this.ctx, "TXT_GM_BROADCAST");
    }

    public async gmMail() {
        return await this.makeRenderData(this.ctx, "TXT_GM_MAIL");
    }

    public async gmActive() {
        return await this.makeRenderData(this.ctx, "TXT_GM_ACTIVE");
    }

    public async gmMatch() {
        return await this.makeRenderData(this.ctx, "TXT_GM_MATCH");
    }

    // OM

    public async omCik() {
        return await this.makeRenderData(this.ctx, "TXT_OM_CIK");
    }

    public async omQuery() {
        return await this.makeRenderData(this.ctx, "TXT_OM_QUERY");
    }

    public async omControl() {
        return await this.makeRenderData(this.ctx, "TXT_OM_CONTROL");
    }

    public async omWarning() {
        return await this.makeRenderData(this.ctx, "TXT_OM_WARNING");
    }



    // AM

    public async amAuth() {
        let renderData = await this.makeRenderDataPageText(this.ctx, "TXT_AM_AUTH");
        let authList = await this.service.admin.getAuthList();
        renderData = _.extend(renderData, { auth_list: authList.data });
        return { result: true, data: renderData };
    }

    public async amRole() {
        let renderData = await this.makeRenderDataPageText(this.ctx, "TXT_AM_ROLE");
        let authList = await this.service.admin.getRoleList();
        renderData = _.extend(renderData, { role_list: authList.data });
        return { result: true, data: renderData };
    }

    public async amUser() {
        let renderData = await this.makeRenderDataPageText(this.ctx, "TXT_AM_USER");
        let authList = await this.service.admin.getUserList();
        renderData = _.extend(renderData, { user_list: authList.data });
        return { result: true, data: renderData };
    }

    public async amServer() {
        return await this.makeRenderData(this.ctx, "TXT_AM_SERVER");
    }

    public async amLog() {
        return await this.makeRenderData(this.ctx, "TXT_AM_LOG");
    }

    public async amBackdoor() {
        return await this.makeRenderData(this.ctx, "TXT_AM_BACKDOOR");
    }

    //=============================================================

    private async makeRenderData(ctx, key) {
        try {
            return { result: true, data: await this.makeRenderDataPageText(ctx, key) };
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

    private async makeRenderDataPageText(ctx, key) {
        try {
            let text = ctx.__(key);
            return JSON.parse(text);
        } catch (err) {
            console.log('err:', err);
            return { result: false, errorCode: this.app.config.ErrorCode.DB_ERROR };
        }
    }

}

export default Page;
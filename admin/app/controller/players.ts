import { Controller } from 'egg';

export default class PlayerController extends Controller {
  public async index() {
    this.ctx.body = `/players index`;
  }

  public async new() {
    this.ctx.body = `/players/new new`;
  }

  public async show(){
    this.ctx.body = `/players/:id show`;
  }

  public async edit() {
    this.ctx.body = `/players/:id/edit edit`;
    
  }

  public async create() {
    this.ctx.body = `/players create`;
    
  }

  public async update() {
    this.ctx.body = `/players/:id update`;
    
  }

  public async destroy() {
    this.ctx.body = `/players/:id destroy`;
  }

  
  
}
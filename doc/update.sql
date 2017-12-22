ALTER TABLE `tbl_account` ADD `vip_daily_reward` smallint(6) NOT NULL DEFAULT '0' COMMENT 'vip每日领取,0-未领,1-已领';
alter table tbl_account add recharge bigint;
alter table tbl_account add cash bigint;
alter table tbl_account add cost bigint;
alter table tbl_account add bonus_pool double;
alter table tbl_account add pump_pool double;
alter table tbl_account add gain_loss double;
ALTER TABLE tbl_account ADD phone VARCHAR (24) COMMENT '绑定手机号';







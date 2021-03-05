alter table steam_id rename to "user";

alter table "user" rename constraint steam_id_pk TO user_id_pk;

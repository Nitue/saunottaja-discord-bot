create table steam_id
(
	id bigserial not null
		constraint steam_id_pk
			primary key,
	discord_user_id varchar(255) not null,
	steam_id varchar(255) not null
);

create unique index steam_id_discord_user_id_uindex
	on steam_id (discord_user_id);


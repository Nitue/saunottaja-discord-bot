create table if not exists message_page
(
    id bigserial not null
        constraint message_page_pk
            primary key,
    discord_message_id varchar(255) not null,
    page_index int not null,
    message_content json not null
);

create unique index if not exists message_page_discord_message_id_page_index_uindex
    on message_page (discord_message_id, page_index);

create table if not exists message_page_position
(
    id bigserial not null
        constraint message_page_position_pk
            primary key,
    discord_message_id varchar(255) not null,
    current_page_index int not null
);

create unique index if not exists message_page_position_discord_message_id_uindex
    on message_page_position (discord_message_id);

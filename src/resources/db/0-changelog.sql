create table if not exists migration
(
    id bigserial not null
        constraint migration_id_pk
            primary key,
    file varchar(255) not null
);

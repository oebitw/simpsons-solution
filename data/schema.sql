DROP TABLE IF EXISTS table1;

create table table1(
    id SERIAL primary key not null,
    quote VARCHAR(255),
    character VARCHAR(255),
    image VARCHAR(255)
);
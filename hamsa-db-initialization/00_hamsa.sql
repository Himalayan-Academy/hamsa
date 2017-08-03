
--
-- Holds image data
--
CREATE TABLE image (
    image_id serial PRIMARY KEY,
    path text NOT NULL,
    width smallint,
    height smallint,
    metadata jsonb NOT NULL,
    checksum text,
    date_modified timestamp without time zone NOT NULL,
    file_missing boolean NOT NULL,
    mime character varying(50)
);

--
-- holds collection data
--
CREATE TABLE collection (
    collection_id serial PRIMARY KEY,
    name character varying(50),
    description text,
    date_modified timestamp without time zone NOT NULL
);

--
-- Holds tag data
--
CREATE TABLE tag (
    tag_id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    description text
);

--
-- Holds artist
--
CREATE TABLE artist (
    artist_id serial PRIMARY KEY,
    name varchar(255),
    metadata jsonb,
    date_modified timestamp without time zone NOT NULL
);

-- 
-- Holds users
--
CREATE TABLE account (
    user_id serial PRIMARY KEY,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL
);
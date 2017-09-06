
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

--
-- image tag
--
CREATE TABLE tag_image (
  image_id int REFERENCES image (image_id) ON UPDATE CASCADE ON DELETE CASCADE ,
  tag_id int REFERENCES tag (tag_id) ON UPDATE CASCADE ,
  CONSTRAINT tag_image_pkey PRIMARY KEY (tag_id, image_id)
);


--
-- collection tag
--
CREATE TABLE tag_collection (
  collection_id int REFERENCES collection (collection_id) ON UPDATE CASCADE ON DELETE CASCADE ,
  tag_id int REFERENCES tag (tag_id) ON UPDATE CASCADE ,
  CONSTRAINT tag_collection_pkey PRIMARY KEY (tag_id, collection_id)
);


--
-- artist tag
--
CREATE TABLE tag_artist (
  artist_id int REFERENCES artist (artist_id) ON UPDATE CASCADE ON DELETE CASCADE ,
  tag_id int REFERENCES tag (tag_id) ON UPDATE CASCADE ,
  CONSTRAINT tag_artist_pkey PRIMARY KEY (tag_id, artist_id)
);
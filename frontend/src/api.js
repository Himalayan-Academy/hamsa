import gql from "nanographql";

const API_URL = "http://dev.himalayanacademy.com/hamsa/api/index.php";


export const count = async (artist, keyword) => {
    let query = gql`
      query {
        count(
            artist: $artist
            keyword: $keyword
        )
      }
    `;

    return executeQuery(query, { artist, keyword });
};


export const getSelectors = async () => {
    let query = gql`
      query {
        collections
        artists
        keywords
      }
    `;

    return executeQuery(query);
};

export const getCollection = async (payload) => {
    let query = gql`
    query($limit: Int!, $offset: Int!, $keyword: String, $artist: String, $query: String) { 
        images( limit: $limit offset: $offset keyword: $keyword artist: $artist query: $query  ) { 
          thumbnail, 
          checksum 
        } } 
    `;

    return executeQuery(query, payload);
};

export const getImage = async (payload) => {
  let query = gql`
  query($checksum: String!) { 
      image( checksum: $checksum) { 
        path, 
        medpath,
        width,
        height,
        metadata {
          artist,
          description,
          more,
          keywords
        } 
      } } 
  `;

  return executeQuery(query, payload);
};

const executeQuery = async (query, payload) => {
    try {
        const res = await fetch(API_URL, {
            body: query(payload),
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const json = await res.json();
        return (json.data);
    } catch (err) {
        console.error(`GraphQL Error`, err);
        throw err;
    }
};
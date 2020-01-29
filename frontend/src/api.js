import gql from "nanographql";

const API_URL = "https://dev.himalayanacademy.com/hamsa/api/index.php";


export const count = async(artist, keyword) => {
    let query = gql `
      query {
        count(
            artist: $artist
            keyword: $keyword
        )
      }
    `;

    return executeQuery(query, { artist, keyword });
};

export const login = async(email, password) => {
    let query = gql `
    query($email: String, $password: String) {
      login(
        email: $email
        password: $password
      )
    }
  `;
    let res = await executeQuery(query, { email, password });
    return res && res.login === "ok";
}

export const removeImageTag = async(email, password, checksum, tag) => {
    let mutation = gql `
  mutation($email: String, $password: String, $checksum: String, $tag: String) {
    removeImageTag(
      email: $email
      password: $password
      checksum: $checksum
      tag: $tag
    ) { 
      checksum,
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
    }
  }
`;
    return executeQuery(mutation, { email, password, checksum, tag });
}


export const addImageTag = async(email, password, checksum, tag) => {
    let mutation = gql `
mutation($email: String, $password: String, $checksum: String, $tag: String) {
  addImageTag(
    email: $email
    password: $password
    checksum: $checksum
    tag: $tag
  ) { 
    checksum,
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
  }
}
`;
    return executeQuery(mutation, { email, password, checksum, tag });
}


export const getSelectors = async() => {
    let query = gql `
      query {
        collections
        artists
        keywords
      }
    `;

    return executeQuery(query);
};

export const getCollection = async(payload) => {
    let query = gql `
    query($limit: Int!, $offset: Int!, $keyword: String, $artist: String, $query: String) { 
        images( limit: $limit offset: $offset keyword: $keyword artist: $artist query: $query  ) { 
          thumbnail, 
          checksum 
        } } 
    `;

    return executeQuery(query, payload);
};

export const getImage = async(payload) => {
    let query = gql `
  query($checksum: String!) { 
      image( checksum: $checksum) { 
        checksum,
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

const executeQuery = async(query, payload) => {
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
        if (json.data) {
            return json.data;
        } else {
            console.error(`GraphQL Error`, json.errors);
            throw json.errors;
        }
    } catch (err) {
        console.error(`GraphQL Error`, err);
        throw err;
    }
};
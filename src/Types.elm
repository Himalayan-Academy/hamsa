module Types exposing (..)

import GraphQL.Client.Http as GraphQLClient
import Navigation exposing (Location)
import RemoteData exposing (RemoteData, WebData)


localDevelopment : Bool
localDevelopment =
    False


apiURL : String
apiURL =
    if localDevelopment then
        "http://localhost:8080"
    else
        "http://dev.himalayanacademy.com:8080"


type alias Model =
    { route : Route
    , artists : List KeyValue
    , categories : List KeyValue
    , collections : List KeyValue
    , query : Maybe String
    , collection : WebData CollectionModel
    , image : Maybe Image
    , error : Maybe String
    }


type alias KeyValue =
    { key : String
    , value : String
    }


toKeyValues : List ( String, String ) -> List KeyValue
toKeyValues list =
    List.map (\( k, v ) -> KeyValue k v) list


type alias CollectionModel =
    { images : List Image
    , name : String
    , description : String
    }


type alias ArtistModel =
    { images : List Image
    , name : String
    , description : String
    }


type alias CategoriesModel =
    { images : List Image
    , name : String
    , description : String
    }


type Route
    = HomeRoute
    | CollectionsRoute String
    | ArtistsRoute String
    | CategoriesRoute String
    | SingleImageRoute String
    | SearchRoute String
    | NotFoundRoute
    | ErrorRoute String


type Msg
    = NoOp
    | OnLocationChange Location
    | ReceiveQueryResponse (Response (List Image))
    | ReceiveImageResponse (Response Image)
    | Search String
    | SetRoute String


type alias Response a =
    Result GraphQLClient.Error a


type alias Image =
    { checksum : String
    , path : String
    , thumbnail : String
    , metadata : Metadata
    }


type alias Metadata =
    { artist : Maybe String
    , description : Maybe String
    }

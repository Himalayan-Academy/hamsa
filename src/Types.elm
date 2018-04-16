module Types exposing (..)

import GraphQL.Client.Http as GraphQLClient
import Navigation exposing (Location)
import RemoteData exposing (RemoteData, WebData)


type alias Model =
    { currentRoute : Route
    , collection : WebData CollectionModel
    , filters : Maybe (List Filter)
    , error : Maybe String
    }


type alias CollectionModel =
    List Image


type alias Filter =
    { key : String
    , value : String
    }


type Route
    = HomeRoute
    | CollectionsRoute
    | ArtistsRoute
    | CategoriesRoute
    | SingleImageRoute String
    | NotFoundRoute


type Msg
    = NoOp
    | OnLocationChange Location
    | ReceiveQueryResponse (Response CollectionModel)


type alias Response a =
    Result GraphQLClient.Error a


type alias Image =
    { path : String
    , thumbnail : String
    , metadata : Metadata
    }


type alias Metadata =
    { artist : Maybe String
    , description : Maybe String
    }

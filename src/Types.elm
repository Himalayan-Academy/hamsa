module Types exposing (..)

import Css exposing (..)
import GraphQL.Client.Http as GraphQLClient
import Navigation exposing (Location)
import RemoteData exposing (RemoteData, WebData)


colors =
    { purple = hex "#8181bd"
    , ocre = hex "#a76b73"
    , orange = hex "#ee9f7e"
    , green = hex "#b7bb6e"
    , gray = hex "#919191"
    }


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
    , artists : List String
    , categories : List String
    , collections : List String
    , query : Maybe String
    , collection : WebData CollectionModel
    , image : Maybe Image
    , error : Maybe String
    , limit : Int
    , offset : Int
    , artist : Maybe String
    , category : Maybe String
    , selectedCollection : Maybe String
    , activePageDescription : WebData String
    , openDropdown : OpenDropdown
    , busy : Bool
    , paginationTotal : Int
    }


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
    | ArtistRoute String
    | CategoriesRoute String
    | SingleImageRoute String
    | SearchRoute String
    | NotFoundRoute
    | ErrorRoute String


type OpenDropdown
    = AllClosed
    | ArtistDropdown
    | CategoryDropdown
    | CollectionDropdown


type alias SelectorConfiguration =
    { artists : List String
    , keywords : List String
    , collections : List String
    }


type Msg
    = OnLocationChange Location
    | ReceiveQueryResponse (Response (List Image))
    | ReceiveImageResponse (Response Image)
    | ReceiveSelectorConfiguration (Response SelectorConfiguration)
    | SetRoute String
    | GoBack
    | Toggle OpenDropdown
    | Blur
    | DescriptionReceived (WebData String)
    | LoadMore
    | ReceivedPaginationTotal (Response Int)


type alias Response a =
    Result GraphQLClient.Error a


type alias Image =
    { checksum : String
    , path : String
    , thumbnail : String
    , metadata : Metadata
    }


type alias Metadata =
    { artist : String
    , description : String
    , keywords : List String
    , more : List String
    }

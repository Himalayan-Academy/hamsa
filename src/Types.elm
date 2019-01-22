module Types exposing (ArtistModel, StyledDocument, CategoriesModel, CollectionModel, Image, Metadata, Model, Msg(..), OpenDropdown(..), Response, Route(..), SelectorConfiguration, apiURL, colors, hapImageURL, localDevelopment)

import Css exposing (..)
import GraphQL.Client.Http as GraphQLClient
import InfiniteScroll as IS
import Url
import Browser
import Browser.Navigation as Navigation
import RemoteData exposing (RemoteData, WebData)
import Html.Styled exposing (..)



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
        "https://www.himalayanacademy.com/hamsa-api"


hapImageURL : String -> String
hapImageURL url =
    let
        fixedURL =
            String.replace "/images" "" url
    in
    "https://www.himalayanacademy.com/hamsa-images" ++ fixedURL


type alias Model =
    { key : Navigation.Key
    , route : Route
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
    , infScroll : IS.Model Msg
    }
    

type alias StyledDocument msg =
    { title : String
    , body : List (Html msg)
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
    | MobileMenuRoute String
    | InfoRoute


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
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url.Url
    | ReceiveQueryResponse (Response (List Image))
    | ReceiveImageResponse (Response Image)
    | ReceiveSelectorConfiguration (Response SelectorConfiguration)
    | SetRoute String
    | GoBack
    | Toggle OpenDropdown
    | Blur
    | DescriptionReceived (WebData String)
    | ReceivedPaginationTotal (Response Int)
    | ChangeQuery String
    | Search
    | InfiniteScrollMsg IS.Msg


type alias Response a =
    Result GraphQLClient.Error a


type alias Image =
    { checksum : String
    , path : String
    , thumbnail : String
    , medpath : String
    , metadata : Metadata
    }


type alias Metadata =
    { artist : String
    , description : String
    , keywords : List String
    , more : List String
    }

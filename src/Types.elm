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

lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque viverra faucibus fermentum. Praesent sagittis mollis porttitor. Duis tristique eros at tempor suscipit. Cras vitae rutrum leo, non porta turpis. Curabitur gravida molestie urna non sollicitudin. Integer gravida non erat eget varius. Donec nec lacinia neque. Duis non mi ultricies, congue magna eget, congue risus. Donec congue viverra mi quis imperdiet. Nulla bibendum scelerisque posuere. In consequat, arcu eget commodo porta, dolor lorem semper massa, non venenatis diam velit a erat. Fusce maximus suscipit mi a vestibulum. Suspendisse tincidunt lorem vel augue dignissim, a pulvinar arcu ornare. Sed maximus urna vitae suscipit mollis. Morbi pretium commodo interdum. Nulla nec sem non eros tincidunt ultrices. "


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
    , limit : Int
    , offset : Int
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
    | ArtistRoute String
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
    | GoBack


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

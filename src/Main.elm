module Main exposing (artistQueryRequest, categoryQueryRequest, collectionQuery, collectionQueryRequest, getDescription, getPaginationTotal, imageQuery, imageQueryRequest, init, loadFirstUrl, main, selectorQuery, sendArtistRequest, sendCategoryRequest, sendHomeRequest, sendImageRequest, sendQueryRequest, sendSearchRequest, sendSelectorConfigurationRequest, subscriptions, update, updateInfiniteScrollCmd, view)

import Basics exposing ((>>))
import Browser exposing (Document)
import Browser.Events as Events
import Browser.Navigation as Navigation
import Css exposing (..)
import Elements.Header
import Elements.Hero
import Elements.Loading as Loading
import Elements.Selector as Selector
import Elements.SlimHeader
import GraphQL.Client.Http as GraphQLClient
import GraphQL.Request.Builder as B exposing (..)
import GraphQL.Request.Builder.Arg as Arg
import GraphQL.Request.Builder.Variable as Var
import Html.Styled exposing (..)
import Html.Styled.Attributes as SA exposing (css, style)
import Http
import InfiniteScroll as IS
import Json.Decode
import RemoteData
import Routing exposing (..)
import String.Extra as Extra
import Task exposing (Task)
import Types exposing (..)
import Url
import Views.Artist as Artist
import Views.Collection as Collection
import Views.Info as Info
import Views.MobileMenu as MobileMenu
import Views.SingleImage as SingleImage



---- MODEL ----


init : String -> Url.Url -> Navigation.Key -> ( Model, Cmd Msg )
init firstUrl location key =
    ( { route = HomeRoute
      , collection = RemoteData.NotAsked
      , artists = []
      , key = key
      , collections = []
      , categories = []
      , query = Nothing
      , image = Nothing
      , error = Nothing
      , limit = 20
      , offset = 0
      , artist = Nothing
      , category = Nothing
      , selectedCollection = Nothing
      , openDropdown = AllClosed
      , activePageDescription = RemoteData.NotAsked
      , busy = False
      , paginationTotal = 0
      , infScroll = IS.init (\dir -> Cmd.none) |> IS.offset 50 |> IS.direction IS.Bottom
      }
    , loadFirstUrl key firstUrl
    )



---- UPDATE ----


getDescription : String -> Cmd Msg
getDescription what =
    let
        file =
            Url.percentDecode what
                |> Maybe.withDefault ""
                |> Extra.clean
                |> String.toLower
                |> String.replace "." ""
                |> Extra.dasherize

        url =
            apiURL ++ "/images/_texts/" ++ file ++ ".txt"
    in
    Http.getString url
        |> RemoteData.sendRequest
        |> Cmd.map DescriptionReceived


getPaginationTotal : String -> String -> Cmd Msg
getPaginationTotal what query =
    let
        requestObject =
            if what == "artist" then
                { artist = Url.percentDecode query, keyword = Nothing }

            else if what == "keyword" then
                { keyword = Url.percentDecode query, artist = Nothing }

            else
                { keyword = Nothing, artist = Nothing }

        paginationQuery =
            let
                artistVar =
                    Var.optional "artist" .artist Var.string ""

                keywordVar =
                    Var.optional "keyword" .keyword Var.string ""

                queryRoot =
                    extract
                        (field "count"
                            [ ( "artist", Arg.variable artistVar )
                            , ( "keyword", Arg.variable keywordVar )
                            ]
                            B.int
                        )
            in
            queryDocument queryRoot

        paginationTotalQueryRequest =
            paginationQuery
                |> request requestObject
    in
    sendQueryRequest
        paginationTotalQueryRequest
        |> Task.attempt ReceivedPaginationTotal


extractGraphQLError : GraphQLClient.Error -> String
extractGraphQLError error =
    case error of
        GraphQLClient.HttpError _ ->
            "HTTP Error"

        GraphQLClient.GraphQLError _ ->
            "GraphQLError"


sendQueryRequest : Request Query a -> Task GraphQLClient.Error a
sendQueryRequest request =
    GraphQLClient.sendQuery (apiURL ++ "/graphql") request


sendImageRequest : String -> Cmd Msg
sendImageRequest checksum =
    sendQueryRequest
        (imageQueryRequest checksum)
        |> Task.attempt ReceiveImageResponse


sendArtistRequest : Int -> Int -> String -> Cmd Msg
sendArtistRequest offset limit artist =
    sendQueryRequest
        (artistQueryRequest offset limit artist)
        |> Task.attempt ReceiveQueryResponse


sendCategoryRequest : Int -> Int -> String -> Cmd Msg
sendCategoryRequest offset limit keyword =
    sendQueryRequest
        (categoryQueryRequest offset limit keyword)
        |> Task.attempt ReceiveQueryResponse


sendSearchRequest : String -> Cmd Msg
sendSearchRequest query =
    let
        searchRequest =
            collectionQuery
                |> request
                    { artist = Nothing
                    , keyword = Nothing
                    , query = Just query
                    , limit = 100000
                    , offset = 0
                    }
    in
    sendQueryRequest
        searchRequest
        |> Task.attempt ReceiveQueryResponse


loadFirstUrl : Navigation.Key -> String -> Cmd Msg
loadFirstUrl key firstUrl =
    Navigation.pushUrl key firstUrl


sendHomeRequest : Int -> Int -> Cmd Msg
sendHomeRequest offset limit =
    sendQueryRequest (collectionQueryRequest offset limit)
        |> Task.attempt ReceiveQueryResponse


selectorQuery : B.Document Query SelectorConfiguration {}
selectorQuery =
    let
        conf =
            B.object SelectorConfiguration
                |> with (field "artists" [] (list string))
                |> with (field "keywords" [] (list string))
                |> with (field "collections" [] (list string))
    in
    queryDocument conf


sendSelectorConfigurationRequest : Cmd Msg
sendSelectorConfigurationRequest =
    let
        selectorConfigurationRequest =
            selectorQuery |> request {}
    in
    sendQueryRequest selectorConfigurationRequest
        |> Task.attempt ReceiveSelectorConfiguration


categoryQueryRequest : Int -> Int -> String -> Request Query (List Image)
categoryQueryRequest offset limit keyword =
    collectionQuery
        |> request { artist = Nothing, keyword = Just keyword, query = Nothing, limit = limit, offset = offset }


collectionQueryRequest : Int -> Int -> Request Query (List Image)
collectionQueryRequest offset limit =
    collectionQuery
        |> request { artist = Nothing, keyword = Nothing, query = Nothing, limit = limit, offset = offset }


artistQueryRequest : Int -> Int -> String -> Request Query (List Image)
artistQueryRequest offset limit artist =
    collectionQuery
        |> request { artist = Just artist, keyword = Nothing, query = Nothing, limit = limit, offset = offset }


imageQueryRequest : String -> Request Query Image
imageQueryRequest checksum =
    imageQuery
        |> request { checksum = checksum }


imageQuery : B.Document Query Image { vars | checksum : String }
imageQuery =
    let
        checksumVar =
            Var.required "checksum" .checksum Var.string

        metadata =
            B.object Metadata
                |> with (field "artist" [] string)
                |> with (field "description" [] string)
                |> with (field "keywords" [] (list string))
                |> with (field "more" [] (list string))

        image =
            B.object Image
                |> with (field "checksum" [] string)
                |> with (field "path" [] string)
                |> with (field "thumbnail" [] string)
                |> with (field "medpath" [] string)
                |> with (field "metadata" [] metadata)

        queryRoot =
            extract
                (field "image"
                    [ ( "checksum", Arg.variable checksumVar ) ]
                    image
                )
    in
    queryDocument queryRoot


collectionQuery :
    B.Document Query
        (List Image)
        { vars
            | artist : Maybe String
            , keyword : Maybe String
            , limit : Int
            , offset : Int
            , query : Maybe String
        }
collectionQuery =
    let
        limitVar =
            Var.required "limit" .limit Var.int

        offsetVar =
            Var.required "offset" .offset Var.int

        artistVar =
            Var.optional "artist" .artist Var.string ""

        keywordVar =
            Var.optional "keyword" .keyword Var.string ""

        queryVar =
            Var.optional "query" .query Var.string ""

        metadata =
            B.object Metadata
                |> with (field "artist" [] string)
                |> with (field "description" [] string)
                |> with (field "keywords" [] (list string))
                |> with (field "more" [] (list string))

        image =
            B.object Image
                |> with (field "checksum" [] string)
                |> with (field "path" [] string)
                |> with (field "thumbnail" [] string)
                |> with (field "medpath" [] string)
                |> with (field "metadata" [] metadata)

        queryRoot =
            extract
                (field "images"
                    [ ( "limit", Arg.variable limitVar )
                    , ( "offset", Arg.variable offsetVar )
                    , ( "artist", Arg.variable artistVar )
                    , ( "keyword", Arg.variable keywordVar )
                    , ( "query", Arg.variable queryVar )
                    ]
                    (list image)
                )
    in
    queryDocument queryRoot


updateInfiniteScrollCmd : Model -> IS.Model Msg -> IS.Model Msg
updateInfiniteScrollCmd model ismodel =
    let
        newOffset =
            model.offset + model.limit
    in
    if newOffset > model.paginationTotal then
        ismodel |> IS.loadMoreCmd (\dir -> Cmd.none)

    else
        case model.route of
            HomeRoute ->
                ismodel |> IS.loadMoreCmd (\dir -> sendHomeRequest newOffset model.limit)

            CategoriesRoute category ->
                let
                    categoryString =
                        Maybe.withDefault "" <| Url.percentDecode category
                in
                ismodel |> IS.loadMoreCmd (\dir -> sendCategoryRequest newOffset model.limit categoryString)

            ArtistRoute artist ->
                let
                    artistString =
                        Maybe.withDefault "" <| Url.percentDecode artist
                in
                ismodel |> IS.loadMoreCmd (\dir -> sendArtistRequest newOffset model.limit artistString)

            _ ->
                ismodel |> IS.loadMoreCmd (\dir -> Cmd.none)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        nextCmd =
            if List.isEmpty model.artists || List.isEmpty model.categories then
                sendSelectorConfigurationRequest

            else
                Cmd.none
    in
    case msg of
        InfiniteScrollMsg msg_ ->
            let
                ( infScroll, cmd ) =
                    IS.update InfiniteScrollMsg msg_ model.infScroll
            in
            ( { model | infScroll = infScroll }, cmd )

        DescriptionReceived response ->
            ( { model | activePageDescription = response }, Cmd.none )

        Toggle dropdown ->
            let
                newOpenDropdown =
                    if model.openDropdown == dropdown then
                        AllClosed

                    else
                        dropdown
            in
            ( { model
                | openDropdown = newOpenDropdown
              }
            , Cmd.none
            )

        GoBack ->
            ( { model
                | openDropdown = AllClosed
              }
            , Navigation.back model.key 1
            )

        SetRoute url ->
            ( { model
                | openDropdown = AllClosed
                , busy = False
                , offset = 0
                , paginationTotal = 0
              }
            , Navigation.pushUrl model.key url
            )

        Blur ->
            ( { model
                | openDropdown = AllClosed
              }
            , Cmd.none
            )

        UrlRequested _ ->
            ( model, Cmd.none )

        UrlChanged location ->
            let
                newRoute =
                    extractRoute location

                newOffset =
                    model.offset + model.limit
            in
            case newRoute of
                MobileMenuRoute selector ->
                    let
                        selectorCmd =
                            case selector of
                                "" ->
                                    sendSelectorConfigurationRequest

                                _ ->
                                    Cmd.none
                    in
                    ( { model | route = newRoute }, selectorCmd )

                HomeRoute ->
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , offset = 0
                        , activePageDescription = RemoteData.NotAsked
                      }
                    , Cmd.batch
                        [ nextCmd
                        , sendHomeRequest model.offset model.limit
                        , getPaginationTotal "home" ""
                        ]
                    )

                InfoRoute ->
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , image = Nothing
                      }
                    , Cmd.none
                    )

                SingleImageRoute id ->
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , image = Nothing
                      }
                    , sendImageRequest id
                    )

                ArtistRoute artist ->
                    let
                        artistString =
                            Maybe.withDefault "" <| Url.percentDecode artist
                    in
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , collection = RemoteData.NotAsked
                        , offset = 0
                      }
                    , Cmd.batch
                        [ sendArtistRequest model.offset model.limit artistString
                        , getDescription artist
                        , getPaginationTotal "artist" artist
                        ]
                    )

                CategoriesRoute category ->
                    let
                        categoryString =
                            Maybe.withDefault "" <| Url.percentDecode category
                    in
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , collection = RemoteData.NotAsked
                        , offset = 0
                        , infScroll = model.infScroll |> IS.loadMoreCmd (\dir -> sendCategoryRequest newOffset model.limit categoryString)
                      }
                    , Cmd.batch
                        [ sendCategoryRequest model.offset model.limit categoryString
                        , getDescription category
                        , getPaginationTotal "keyword" categoryString
                        ]
                    )

                _ ->
                    ( model, Cmd.none )

        --dangerous
        ReceiveQueryResponse response ->
            case response of
                Ok data ->
                    let
                        currImages =
                            case model.collection of
                                RemoteData.Success c ->
                                    c.images

                                _ ->
                                    []

                        newImages =
                            List.concat [ currImages, data ]

                        countd =
                            List.length newImages
                    in
                    ( { model
                        | collection = RemoteData.succeed <| CollectionModel newImages "" ""
                        , error = Nothing
                        , offset = model.offset + model.limit
                        , infScroll = IS.stopLoading model.infScroll |> updateInfiniteScrollCmd model
                      }
                    , nextCmd
                    )

                Err error ->
                    ( { model | error = Just <| extractGraphQLError error, busy = False }, nextCmd )

        ReceiveImageResponse response ->
            case response of
                Ok data ->
                    ( { model | image = Just data, error = Nothing }, nextCmd )

                Err error ->
                    ( { model | image = Nothing, error = Just <| extractGraphQLError error }, nextCmd )

        ReceivedPaginationTotal response ->
            case response of
                Ok data ->
                    ( { model | paginationTotal = data }, nextCmd )

                Err error ->
                    ( { model | paginationTotal = 0, error = Just <| extractGraphQLError error }, nextCmd )

        ReceiveSelectorConfiguration response ->
            case response of
                Ok data ->
                    ( { model
                        | artists = data.artists
                        , categories = data.keywords
                        , collections = data.collections
                      }
                    , Cmd.none
                    )

                Err error ->
                    ( { model | error = Just <| extractGraphQLError error }, Cmd.none )

        ChangeQuery query ->
            ( { model | query = Just query }, Cmd.none )

        Search ->
            let
                ( route, searchCmd ) =
                    case model.query of
                        Nothing ->
                            ( model.route, Cmd.none )

                        Just query ->
                            ( CollectionsRoute query, sendSearchRequest query )
            in
            ( { model
                | route = route
                , openDropdown = AllClosed
                , collection = RemoteData.NotAsked
                , offset = 0
                , activePageDescription = RemoteData.NotAsked
              }
            , searchCmd
            )



---- VIEW ----


view : Model -> StyledDocument Msg
view model =
    let
        emptyElement =
            div [] []

        ( headerElement, heroElement, subView ) =
            case model.route of
                HomeRoute ->
                    ( Elements.Header.view model.route, Elements.Hero.view, Collection.view "Home" model )

                CategoriesRoute category ->
                    ( Elements.SlimHeader.view model.route, emptyElement, Collection.view (Maybe.withDefault "" <| Url.percentDecode category) model )

                CollectionsRoute collection ->
                    ( Elements.SlimHeader.view model.route, emptyElement, Collection.view (Maybe.withDefault "" <| Url.percentDecode collection) model )

                ArtistRoute artist ->
                    ( Elements.SlimHeader.view model.route, emptyElement, Artist.view artist model )

                SingleImageRoute imageId ->
                    ( Elements.SlimHeader.view model.route, emptyElement, SingleImage.view imageId model.image )

                MobileMenuRoute selector ->
                    ( Elements.SlimHeader.view model.route, emptyElement, MobileMenu.view model selector )

                InfoRoute ->
                    ( Elements.SlimHeader.view model.route, emptyElement, Info.view )

                _ ->
                    ( Elements.SlimHeader.view model.route, emptyElement, Loading.view )

        errorElement =
            case model.error of
                Just err ->
                    div [] []

                Nothing ->
                    div [] []

        errorDisplay =
            if localDevelopment then
                errorElement

            else
                div [] []

        infiniteAttribute =
            IS.infiniteScroll InfiniteScrollMsg
    in
    { title = "HAMSA"
    , body =
        [ div
            [ SA.fromUnstyled infiniteAttribute
            , style "height" "100vh"
            , style "overflow" "scroll"
            ]
            [ headerElement
            , heroElement
            , errorDisplay
            , Selector.view model
            , subView
            ]
        ]
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.openDropdown of
        AllClosed ->
            Sub.none

        _ ->
            Events.onClick (Json.Decode.succeed Blur)



---- PROGRAM ----


toUnstyledDocument : StyledDocument Msg -> Browser.Document Msg
toUnstyledDocument doc =
    { title = doc.title
    , body = List.map toUnstyled doc.body
    }


main : Program String Model Msg
main =
    Browser.application
        { init = init
        , update = update
        , view = view >> toUnstyledDocument
        , subscriptions = subscriptions
        , onUrlRequest = UrlRequested
        , onUrlChange = UrlChanged
        }

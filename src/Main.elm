module Main exposing (..)

import Css exposing (..)
import Elements.Header
import Elements.Hero
import Elements.Loading as Loading
import Elements.Selector as Selector
import GraphQL.Client.Http as GraphQLClient
import GraphQL.Request.Builder as B exposing (..)
import GraphQL.Request.Builder.Arg as Arg
import GraphQL.Request.Builder.Variable as Var
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (css)
import Http exposing (decodeUri)
import Json.Decode
import Mouse
import Navigation exposing (Location)
import RemoteData
import Routing exposing (..)
import String.Extra as Extra
import Task exposing (Task)
import Types exposing (..)
import Views.Artist as Artist
import Views.Collection as Collection
import Views.SingleImage as SingleImage


---- MODEL ----


init : String -> Location -> ( Model, Cmd Msg )
init firstUrl location =
    ( { route = HomeRoute
      , collection = RemoteData.NotAsked
      , artists = []
      , categories = []
      , collections = []
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
      }
    , loadFirstUrl firstUrl
    )



---- UPDATE ----


getDescription : String -> Cmd Msg
getDescription what =
    let
        file =
            Http.decodeUri what
                |> Maybe.withDefault ""
                |> Extra.clean
                |> String.toLower
                |> Extra.dasherize

        url =
            apiURL ++ "/images/_texts/" ++ file ++ ".txt"
    in
    Http.getString url
        |> RemoteData.sendRequest
        |> Cmd.map DescriptionReceived


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


loadFirstUrl : String -> Cmd Msg
loadFirstUrl firstUrl =
    Navigation.newUrl firstUrl


sendHomeRequest : Cmd Msg
sendHomeRequest =
    sendQueryRequest collectionQueryRequest
        |> Task.attempt ReceiveQueryResponse


selectorQuery : Document Query SelectorConfiguration {}
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
        |> request { artist = Nothing, keyword = Just keyword, limit = limit, offset = offset }


collectionQueryRequest : Request Query (List Image)
collectionQueryRequest =
    collectionQuery
        |> request { artist = Nothing, keyword = Nothing, limit = 30, offset = 0 }


artistQueryRequest : Int -> Int -> String -> Request Query (List Image)
artistQueryRequest offset limit artist =
    collectionQuery
        |> request { artist = Just artist, keyword = Nothing, limit = limit, offset = offset }


imageQueryRequest : String -> Request Query Image
imageQueryRequest checksum =
    imageQuery
        |> request { checksum = checksum }


imageQuery : Document Query Image { vars | checksum : String }
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
    Document Query
        (List Image)
        { vars
            | artist : Maybe String
            , keyword : Maybe String
            , limit : Int
            , offset : Int
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
                |> with (field "metadata" [] metadata)

        queryRoot =
            extract
                (field "images"
                    [ ( "limit", Arg.variable limitVar )
                    , ( "offset", Arg.variable offsetVar )
                    , ( "artist", Arg.variable artistVar )
                    , ( "keyword", Arg.variable keywordVar )
                    ]
                    (list image)
                )
    in
    queryDocument queryRoot


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
            { model
                | openDropdown = newOpenDropdown
            }
                ! []

        GoBack ->
            ( { model
                | openDropdown = AllClosed
              }
            , Navigation.back 1
            )

        SetRoute url ->
            ( { model
                | openDropdown = AllClosed
              }
            , Navigation.newUrl url
            )

        Blur ->
            ( { model
                | openDropdown = AllClosed
              }
            , Cmd.none
            )

        OnLocationChange location ->
            let
                newRoute =
                    extractRoute location

                d =
                    Debug.log "new route" newRoute
            in
            case newRoute of
                HomeRoute ->
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                      }
                    , sendHomeRequest
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
                            Maybe.withDefault "" <| decodeUri artist
                    in
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , collection = RemoteData.NotAsked
                      }
                    , Cmd.batch
                        [ sendArtistRequest model.offset model.limit artistString
                        , getDescription artist
                        ]
                    )

                CategoriesRoute category ->
                    let
                        categoryString =
                            Maybe.withDefault "" <| decodeUri category
                    in
                    ( { model
                        | route = newRoute
                        , openDropdown = AllClosed
                        , collection = RemoteData.NotAsked
                      }
                    , Cmd.batch
                        [ sendCategoryRequest model.offset model.limit categoryString
                        , getDescription category
                        ]
                    )

                _ ->
                    ( model, Cmd.none )

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

                        d =
                            Debug.log "collection lenght" countd
                    in
                    ( { model
                        | collection = RemoteData.succeed <| CollectionModel newImages "" ""
                        , error = Nothing
                      }
                    , nextCmd
                    )

                Err error ->
                    ( { model | error = Just <| toString <| error }, nextCmd )

        ReceiveImageResponse response ->
            let
                a =
                    Debug.log "image result" response
            in
            case response of
                Ok data ->
                    ( { model | image = Just data, error = Nothing }, nextCmd )

                Err error ->
                    ( { model | image = Nothing, error = Just <| toString <| error }, nextCmd )

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
                    ( { model | image = Nothing, error = Just <| toString <| error }, Cmd.none )

        LoadMore ->
            let
                newOffset =
                    model.offset + model.limit

                nextCmd =
                    case model.route of
                        ArtistRoute a ->
                            let
                                artistString =
                                    Maybe.withDefault "" <| decodeUri a
                            in
                            sendArtistRequest newOffset model.limit artistString

                        CategoriesRoute c ->
                            let
                                categoryString =
                                    Maybe.withDefault "" <| decodeUri c
                            in
                            sendCategoryRequest newOffset model.limit categoryString

                        _ ->
                            Cmd.none
            in
            ( { model
                | offset = newOffset
              }
            , nextCmd
            )



---- VIEW ----


view : Model -> Html Msg
view model =
    let
        subView =
            case model.route of
                HomeRoute ->
                    Collection.view "Home" model

                CategoriesRoute category ->
                    Collection.view (Maybe.withDefault "" <| Http.decodeUri category) model

                CollectionsRoute collection ->
                    Collection.view (Maybe.withDefault "" <| Http.decodeUri collection) model

                ArtistRoute artist ->
                    Artist.view artist model

                SingleImageRoute imageId ->
                    SingleImage.view imageId model.image

                _ ->
                    Loading.view

        errorElement =
            case model.error of
                Just err ->
                    p
                        [ css
                            [ backgroundColor (rgb 255 220 0) ]
                        ]
                        [ text err ]

                Nothing ->
                    div [] []

        errorDisplay =
            if localDevelopment then
                errorElement
            else
                div [] []
    in
    div []
        [ Elements.Header.view
        , Elements.Hero.view
        , errorDisplay
        , Selector.view model
        , subView
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.openDropdown of
        AllClosed ->
            Sub.none

        _ ->
            Mouse.clicks (always Blur)



---- PROGRAM ----


main : Program String Model Msg
main =
    Navigation.programWithFlags OnLocationChange
        { view = view >> toUnstyled
        , init = init
        , update = update
        , subscriptions = subscriptions
        }

module Main exposing (..) 

import Elements.Header
import Elements.Hero
import Elements.Loading as Loading
import Elements.Selector as Selector
import GraphQL.Client.Http as GraphQLClient
import GraphQL.Request.Builder as B exposing (..)
import GraphQL.Request.Builder.Arg as Arg
import GraphQL.Request.Builder.Variable as Var
import Html.Styled exposing (..)
import Http exposing (decodeUri)
import Navigation exposing (Location)
import RemoteData
import Routing exposing (..)
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
      }
    , loadFirstUrl firstUrl
    )



---- UPDATE ----


sendQueryRequest : Request Query a -> Task GraphQLClient.Error a
sendQueryRequest request =
    GraphQLClient.sendQuery (apiURL ++ "/graphql") request


sendImageRequest : String -> Cmd Msg
sendImageRequest checksum =
    sendQueryRequest
        (imageQueryRequest checksum)
        |> Task.attempt ReceiveImageResponse


sendArtistRequest : String -> Cmd Msg
sendArtistRequest artist =
    sendQueryRequest
        (artistQueryRequest artist)
        |> Task.attempt ReceiveQueryResponse


loadFirstUrl : String -> Cmd Msg
loadFirstUrl firstUrl =
    Navigation.newUrl firstUrl


sendHomeRequest : Cmd Msg
sendHomeRequest =
    sendQueryRequest collectionQueryRequest
        |> Task.attempt ReceiveQueryResponse


collectionQueryRequest : Request Query (List Image)
collectionQueryRequest =
    collectionQuery
        |> request { artist = Nothing, limit = 30, offset = 0 }


artistQueryRequest : String -> Request Query (List Image)
artistQueryRequest artist =
    collectionQuery
        |> request { artist = Just artist, limit = 30, offset = 0 }


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


collectionQuery : Document Query (List Image) { vars | artist : Maybe String, limit : Int, offset : Int }
collectionQuery =
    let
        limitVar =
            Var.required "limit" .limit Var.int

        offsetVar =
            Var.required "offset" .offset Var.int

        artistVar =
            Var.optional "artist" .artist Var.string ""

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
                    ]
                    (list image)
                )
    in
    queryDocument queryRoot


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GoBack ->
            (model, Navigation.back 1)
            
        SetRoute url ->
            ( model, Navigation.newUrl url )

        OnLocationChange location ->
            let
                newRoute =
                    extractRoute location

                d =
                    Debug.log "new route" newRoute
            in
            case newRoute of
                HomeRoute ->
                    ( { model | route = newRoute }, sendHomeRequest )

                SingleImageRoute id ->
                    ( { model | route = newRoute, image = Nothing }, sendImageRequest id )

                ArtistRoute artist ->
                    ( { model | route = newRoute, collection = RemoteData.NotAsked }, sendArtistRequest <| Maybe.withDefault "" <| decodeUri artist )

                _ ->
                    ( model, Cmd.none )

        ReceiveQueryResponse response ->
            let
                a =
                    Debug.log "result" response
            in
            case response of
                Ok data ->
                    ( { model | collection = RemoteData.succeed <| CollectionModel data "" "" }, Cmd.none )

                Err error ->
                    ( { model | error = Just <| toString <| error }, Cmd.none )

        ReceiveImageResponse response ->
            let
                a =
                    Debug.log "image result" response
            in
            case response of
                Ok data ->
                    ( { model | image = Just data, error = Nothing }, Cmd.none )

                Err error ->
                    ( { model | image = Nothing, error = Just <| toString <| error }, Cmd.none )

        _ ->
            ( model, Cmd.none )



---- VIEW ----


view : Model -> Html Msg
view model =
    let
        subView =
            case model.route of
                HomeRoute ->
                    Collection.view model

                CategoriesRoute _ ->
                    Collection.view model

                CollectionsRoute _ ->
                    Collection.view model

                ArtistRoute artist ->
                    Artist.view artist model

                SingleImageRoute imageId ->
                    SingleImage.view imageId model.image

                _ ->
                    Loading.view
    in
    div []
        [ Elements.Header.view
        , Elements.Hero.view
        , Selector.view model
        , subView
        ]



---- PROGRAM ----


main : Program String Model Msg
main =
    Navigation.programWithFlags OnLocationChange
        { view = view >> toUnstyled
        , init = init
        , update = update
        , subscriptions = always Sub.none
        }

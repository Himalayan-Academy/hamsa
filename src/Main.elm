module Main exposing (..)

import GraphQL.Client.Http as GraphQLClient
import GraphQL.Request.Builder exposing (..)
import GraphQL.Request.Builder.Arg as Arg
import GraphQL.Request.Builder.Variable as Var
import Html exposing (Html, div, h1, img, text)
import Html.Attributes exposing (src)
import Navigation exposing (Location)
import RemoteData
import Routing exposing (..)
import Task exposing (Task)
import Types exposing (..)
import Views.Artists as Artists
import Views.Collection as Collection


---- MODEL ----


init : Location -> ( Model, Cmd Msg )
init location =
    ( { currentRoute = HomeRoute
      , collection = RemoteData.Loading
      , filters = Nothing
      , error = Nothing
      }
    , sendCollectionRequest
    )



---- UPDATE ----
-- todo: fix problem with changing URL to GraphQL server


sendQueryRequest : Request Query a -> Task GraphQLClient.Error a
sendQueryRequest request =
    GraphQLClient.sendQuery "http://dev.himalayanacademy.com:8080/graphql" request


sendCollectionRequest : Cmd Msg
sendCollectionRequest =
    sendQueryRequest collectionQueryRequest
        |> Task.attempt ReceiveQueryResponse


collectionQueryRequest : Request Query CollectionModel
collectionQueryRequest =
    collectionQuery
        |> request { limit = 100, offset = 0 }


collectionQuery : Document Query CollectionModel { vars | limit : Int, offset : Int }
collectionQuery =
    let
        limitVar =
            Var.required "limit" .limit Var.int

        offsetVar =
            Var.required "offset" .offset Var.int

        metadata =
            object Metadata
                |> with (field "artist" [] (nullable string))
                |> with (field "description" [] (nullable string))

        image =
            object Image
                |> with (field "path" [] string)
                |> with (field "thumbnail" [] string)
                |> with (field "metadata" [] metadata)

        queryRoot =
            extract
                (field "images"
                    [ ( "limit", Arg.variable limitVar )
                    , ( "offset", Arg.variable offsetVar )
                    ]
                    (list image)
                )
    in
    queryDocument queryRoot


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnLocationChange location ->
            let
                newRoute =
                    extractRoute location

                cmd =
                    case newRoute of
                        HomeRoute ->
                            sendCollectionRequest

                        SingleImageRoute _ ->
                            Cmd.none

                        _ ->
                            Cmd.none
            in
            ( { model | currentRoute = newRoute }, cmd )

        ReceiveQueryResponse response ->
            let
                a =
                    Debug.log "result" response
            in
            case response of
                Ok data ->
                    ( { model | collection = RemoteData.succeed data }, Cmd.none )

                Err error ->
                    ( { model | error = Just <| toString <| error }, Cmd.none )

        _ ->
            ( model, Cmd.none )



---- VIEW ----


notDone : Html Msg
notDone =
    div []
        [ img [ src "/logo.svg" ] []
        , h1 [] [ text "This is not done!" ]
        ]


view : Model -> Html Msg
view model =
    case model.currentRoute of
        HomeRoute ->
            Collection.view model

        ArtistsRoute ->
            Artists.view model

        SingleImageRoute imageId ->
            notDone

        _ ->
            notDone



---- PROGRAM ----


main : Program Never Model Msg
main =
    Navigation.program OnLocationChange
        { view = view
        , init = init
        , update = update
        , subscriptions = always Sub.none
        }

module Views.Collection exposing (view)

import Elements.Header
import Elements.Hero
import Elements.Image as Image
import Elements.Selector as Selector
import Html exposing (..)
import Html.Attributes exposing (..)
import RemoteData
import Types exposing (..)
import Views.Loading as Loading


tileView : Image -> Html Msg
tileView image =
    Image.masonryTile image.thumbnail "hello"


masonryView : CollectionModel -> Html Msg
masonryView collection =
    div [ class "collection" ]
        [ section [ class "masonry" ]
            (List.map
                tileView
                collection
            )
        ]


view : Model -> Html Msg
view model =
    let
        collection =
            model.collection
    in
    case collection of
        RemoteData.NotAsked ->
            Loading.view model

        RemoteData.Loading ->
            Loading.view model

        RemoteData.Success collection ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , Selector.view model
                , masonryView collection
                , h1 [] [ text "successfuly loaded" ]
                ]

        RemoteData.Failure _ ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , h1 [] [ text "failure loading" ]
                ]

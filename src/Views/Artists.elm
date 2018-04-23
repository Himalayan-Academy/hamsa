module Views.Artists exposing (view)

import Elements.Header
import Elements.Hero
import Elements.Image as Image
import Elements.Selector as Selector
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import RemoteData
import Types exposing (..)


tileView : Image -> Html Msg
tileView image =
    Image.masonryTile image.thumbnail "hello" image.checksum


masonryView : CollectionModel -> Html Msg
masonryView collection =
    div [ class "collection" ]
        [ section [ class "masonry" ]
            (List.map
                tileView
                collection.images
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
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , h1 [] [ text "not asked" ]
                ]

        RemoteData.Loading ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , h1 [] [ text "loading" ]
                ]

        RemoteData.Success collection ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , Selector.view model
                , masonryView collection
                ]

        RemoteData.Failure _ ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , h1 [] [ text "fail" ]
                ]

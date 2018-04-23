module Views.Collection exposing (view)

import Elements.Image as Image
import Elements.Loading as Loading
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
            Loading.view

        RemoteData.Loading ->
            Loading.view

        RemoteData.Success c ->
            masonryView c

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

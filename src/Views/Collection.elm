module Views.Collection exposing (view)

import Elements.Header
import Elements.Hero
import Elements.Image as Image
import Elements.Selector as Selector
import Html exposing (..)
import Html.Attributes exposing (..)
import List.Extra exposing (uniqueBy)
import RemoteData
import Types exposing (..)


selectorView : CollectionModel -> Html Msg
selectorView collection =
    let
        emptyArtistFilter artist =
            case artist of
                Just a ->
                    a

                Nothing ->
                    ""

        artistList =
            case List.length collection of
                0 ->
                    [ ( "", "" ) ]

                _ ->
                    collection
                        |> List.map .metadata
                        |> List.map .artist
                        |> List.map emptyArtistFilter
                        |> List.filter (\i -> not <| String.isEmpty i)
                        |> uniqueBy toString
                        |> List.map (\i -> ( i, i ))
                        |> Debug.log "Artist list"
    in
    div [ class "selector-controls" ]
        [ Selector.round "Categories" []
        , Selector.round "Artists" artistList
        , Selector.round "Collections" []
        ]


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
                , selectorView collection
                , masonryView collection
                , h1 [] [ text "successfuly loaded" ]
                ]

        RemoteData.Failure _ ->
            div []
                [ Elements.Header.view
                , Elements.Hero.view
                , h1 [] [ text "failure loading" ]
                ]

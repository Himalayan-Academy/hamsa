module Elements.Selector exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import List.Extra exposing (uniqueBy)
import RemoteData exposing (RemoteData, WebData)
import Types exposing (..)


round : String -> String -> List ( String, String ) -> Html Msg
round selectorClass title listOfOptions =
    let
        makeOption ( label, v ) =
            case String.length v of
                0 ->
                    option
                        [ disabled True, selected True ]
                        [ text title ]

                _ ->
                    option [ value v ] [ text label ]

        listWithTitle =
            ( title, "" ) :: listOfOptions
    in
    div [ classList [ ( "round-wrapper", True ), ( selectorClass, True ) ] ]
        [ span [ class "title" ] [ text title ]
        , i [ class "fa fa-caret-down" ] []
        , select []
            (List.map makeOption listWithTitle)
        ]


search : Html Msg
search =
    div [ classList [ ( "round-wrapper", True ), ( "is-search-box", True ) ] ]
        [ input [ class "title", placeholder "Search" ] []
        , i [ class "fa fa-search" ] []
        ]


oldRound : String -> List ( String, String ) -> Html Msg
oldRound title listOfOptions =
    let
        makeOption ( label, v ) =
            case String.length v of
                0 ->
                    option
                        [ disabled True, selected True ]
                        [ text title ]

                _ ->
                    option [ value v ] [ text label ]

        listWithTitle =
            ( title, "" ) :: listOfOptions
    in
    div [ class "selectWrapper" ]
        [ select
            [ class "selectBox"
            ]
            (List.map makeOption listWithTitle)
        ]


view : Model -> Html Msg
view model =
    let
        collection =
            case model.collection of
                RemoteData.Success c ->
                    c

                _ ->
                    []

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
        [ round "is-selector-categories" "Categories" []
        , round "is-selector-artists" "Artists" artistList
        , round "is-selector-collections" "Collections" []
        , search
        ]

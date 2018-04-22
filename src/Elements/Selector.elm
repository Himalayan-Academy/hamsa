module Elements.Selector exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import List.Extra exposing (uniqueBy)
import Types exposing (..)


round : String -> List ( String, String ) -> Html Msg
round title listOfOptions =
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
    div [ class "round-wrapper" ]
        [ span [ class "title" ] [ text title ]
        , i [ class "fa fa-arrow-down" ] []
        , select []
            (List.map makeOption listWithTitle)
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
        [ round "Categories" []
        , round "Artists" artistList
        , round "Collections" []
        ]

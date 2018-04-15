module Elements.Selector exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
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
    div [ class "selectWrapper" ]
        [ select
            [ class "selectBox"
            ]
            (List.map makeOption listWithTitle)
        ]

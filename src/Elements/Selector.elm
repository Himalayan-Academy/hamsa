module Elements.Selector exposing (..)

import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
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


view : Model -> Html Msg
view model =
    div [ class "selector-controls" ]
        [ round "is-selector-categories" "Categories" []
        , round "is-selector-artists" "Artists" []
        , round "is-selector-collections" "Collections" []
        , search
        ]

module Elements.Image exposing (..)

import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


imageWithLabel : String -> String -> Html Msg
imageWithLabel image label =
    figure []
        [ img
            [ class "hero"
            , src image
            ]
            []
        , span [ class "label" ] [ text label ]
        ]


masonryTile : String -> String -> String -> Html Msg
masonryTile image label checksum =
    div
        [ class "tile"
        , onClick (SetRoute ("#/item/" ++ checksum))
        ]
        [ figure []
            [ img [ src (apiURL ++ image) ] []
            , p [] [ text label ]
            ]
        ]

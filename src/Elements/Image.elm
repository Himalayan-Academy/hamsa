module Elements.Image exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
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


masonryTile : String -> String -> Html Msg
masonryTile image label =
    div [ class "tile" ]
        [ figure []
            [ img [ src ("http://localhost:8080"++ image) ] []
            , p [] [ text label ]
            ]
        ]

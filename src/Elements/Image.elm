module Elements.Image exposing (imageWithLabel, masonryTile, toImageUrl)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


toImageUrl : String -> String
toImageUrl path =
    if localDevelopment then
        apiURL ++ path

    else
        hapImageURL path


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
        , css [ cursor pointer ]
        , onClick (SetRoute ("#/item/" ++ checksum))
        ]
        [ figure []
            [ img [ src <| toImageUrl image ] []

            --, p [] [ text label ]
            ]
        ]

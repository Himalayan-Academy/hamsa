module Elements.Header exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Types exposing (..)


logo : Html Msg
logo =
    img
        [ class "hamsa-logo"
        , src "images/hamsa-logo.jpg"
        ]
        []


monasteryLogo : Html Msg
monasteryLogo =
    img
        [ class "monastery-logo"
        , src "images/monastery-logo.png"
        ]
        []


view : Html Msg
view =
    header []
        [ logo
        , div [ class "monastery-header-text" ]
            [ h1 [ class "title" ] [ text "Himalayan Academy" ]
            , h2 [ class "subtitle" ] [ text "Art & Photo Collection" ]
            ]
        , monasteryLogo
        ]

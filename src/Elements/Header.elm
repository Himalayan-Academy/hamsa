module Elements.Header exposing (view)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


logo : Html Msg
logo =
    img
        [ class "hamsa-logo"
        , src "images/hamsa-logo.png"
        ]
        []


monasteryLogo : Html Msg
monasteryLogo =
    a
        [ class "monastery-logo"
        , href "https://www.himalayanacademy.com"
        ]
        [ img
            [ src "images/monastery-logo.png"
            ]
            []
        ]


view : Html Msg
view =
    header
        [ onClick (SetRoute "#/")
        , css
            [ cursor pointer
            ]
        ]
        [ logo
        , div [ class "monastery-header-text" ]
            [ h1 [ class "title" ] [ text "Himalayan Academy" ]
            , h2 [ class "subtitle" ] [ text "Museum Of Spiritual Art" ]
            ]
        , monasteryLogo
        ]

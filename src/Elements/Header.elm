module Elements.Header exposing (view)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


logo : Html Msg
logo =
    a
        [ class "hamsa-logo"
        , href "/hamsa"
        , css
            [ displayFlex
            , justifyContent center
            , alignItems center
            , verticalAlign middle
            , color (rgb 255 255 255)
            , textDecoration none
            , zIndex (int 999)
            ]
        ]
        [ img
            [ class "hamsa-logo"
            , src "images/hamsa-logo.png"
            ]
            []
        ]


monasteryLogo : Html Msg
monasteryLogo =
    a
        [ class "monastery-logo"
        , href "https://www.himalayanacademy.com"
        , css
            [ marginRight (px 120)
            , zIndex (int 9999)
            , Css.height (px 100)
            ]
        ]
        [ img
            [ src "images/monastery-logo.png"
            , css [ maxWidth (pct 100) ]
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
            , div [ css [ flex auto ] ] []
            ]
        , monasteryLogo
        ]

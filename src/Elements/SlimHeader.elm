module Elements.SlimHeader exposing (view)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


logo : Html Msg
logo =
    a
        [ class "monastery-logo"
        , href "https://www.himalayanacademy.com"
        , css
            [ displayFlex
            , justifyContent center
            , alignItems center
            , backgroundColor (rgb 18 191 18)
            , verticalAlign middle
            , padding (px 10)
            , border3 (px 4) solid (rgb 255 255 255)
            , Css.height (pct 100)
            , color (rgb 255 255 255)
            , textDecoration none
            ]
        ]
        [ h1
            [ css [ fontWeight (int 100) ]
            ]
            [ text "HAMSA" ]
        ]


monasteryLogo : Html Msg
monasteryLogo =
    a
        [ class "monastery-logo"
        , href "https://www.himalayanacademy.com"
        , css
            [ displayFlex
            , justifyContent center
            , alignItems center

            -- , overflow Css.hidden
            ]
        ]
        [ img
            [ src "images/monastery-logo-slim.png"
            , css
                [ flexShrink (num 0)
                , minHeight (px 60)
                , maxHeight (px 60)
                , marginRight (px 120)
                ]
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

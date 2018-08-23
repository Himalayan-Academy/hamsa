module Elements.Hero exposing (view)

-- import Elements.Image exposing (imageWithLabel)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


view : Html Msg
view =
    div
        [ class "hero"
        , onClick (SetRoute "#/")
        , css
            [ position relative
            , Css.height (px 370)
            ]
        ]
        [ figure
            [ css
                [ position absolute
                , left (px 0)
                , Css.height (px 370)
                , backgroundColor (hex "#000")
                ]
            ]
            [ img
                [ class "hero"
                , src "images/hero2.jpg"
                , css
                    [ Css.width (pct 100)
                    , Css.maxWidth (pct 100)
                    , overflow Css.hidden
                    ]
                ]
                []
            ]
        , figure
            [ css
                [ position absolute
                , left (px 0)
                , Css.height (px 370)
                , backgroundColor (hex "#005aa0")
                ]
            , class "fade"
            ]
            [ img
                [ class "hero"
                , src "images/hero1.jpg"
                ]
                []
            , span [ class "label" ] [ text "" ]
            ]
        ]

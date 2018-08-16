module Elements.SlimHeader exposing (view)

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
            , backgroundColor (hex "#73af01")
            , verticalAlign middle
            , padding (px 10)
            , border3 (px 2) solid (rgb 255 255 255)
            , Css.height (pct 100)
            , color (rgb 255 255 255)
            , textDecoration none
            , marginLeft (px 120)
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
            [ justifyContent center
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


desktopView : Html Msg
desktopView =
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


mobileView : Html Msg
mobileView =
    let
        mobileLogo =
            img
                [ onClick (SetRoute "#/")
                , src "images/monastery-logo-small.svg"
                , css
                    [ maxWidth (px 42)
                    , cursor pointer
                    ]
                ]
                []

        backLink =
            img
                [ onClick GoBack
                , src "images/chevron-left.svg"
                , css
                    [ maxWidth (px 36)
                    , cursor pointer
                    ]
                ]
                []
    in
    div
        [ css
            [ flexDirection row
            , alignItems center
            , justifyContent center
            , backgroundColor (hex "#783441")
            , fontFamily sansSerif
            , paddingLeft (px 5)
            , paddingRight (px 5)
            ]
        , class "mobile-header"
        ]
        [ backLink
        , h3
            [ css
                [ flex auto
                , textAlign center
                , color (hex "#FFFFFF")
                ]
            ]
            [ text "Museum Of Spiritual Art" ]
        , mobileLogo
        ]


view : Html Msg
view =
    div []
        [ mobileView
        , desktopView
        ]

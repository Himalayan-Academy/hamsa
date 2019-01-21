module Elements.SlimHeader exposing (view)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


logo : Html Msg
logo =
    div
        [ class "hamsa-logo"
        , css
            [ displayFlex
            , justifyContent center
            , alignItems center
            , verticalAlign middle
            , padding (px 8)
            , marginLeft (px 120)
            , Css.height (pct 100)
            ]
        ]
        [ a
            [ href "/hamsa"
            , css
                [ backgroundColor (hex "#73af01")
                , border3 (px 2) solid (rgb 255 255 255)
                , color (rgb 255 255 255)
                , textDecoration none
                , Css.height (pct 100)
                , maxHeight (pct 100)
                , displayFlex
                , verticalAlign middle
                , alignItems center
                ]
            ]
            [ span
                [ css
                    [ fontWeight (int 100)
                    , padding (px 5)
                    ]
                ]
                [ text "HAMSA" ]
            ]
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
                , padding (px 8)
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
            , h2 [ class "subtitle" ] [ text "Museum of Spiritual Art" ]
            , div [ css [ flex auto ] ] []
            ]
        , monasteryLogo
        ]


mobileView : Bool -> Html Msg
mobileView isMenuRoute =
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

        menuLink =
            img
                [ onClick (SetRoute "#/menu")
                , src "images/menu-white.svg"
                , css
                    [ maxWidth (px 36)
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

        navLink =
            if isMenuRoute then
                menuLink

            else
                backLink
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
        [ navLink
        , h3
            [ css
                [ flex auto
                , textAlign center
                , color (hex "#FFFFFF")
                ]
            ]
            [ text "Museum of Spiritual Art" ]
        , mobileLogo
        ]


view : Route -> Html Msg
view currentRoute =
    let
        isMenuRoute =
            case currentRoute of
                MobileMenuRoute _ ->
                    False

                _ ->
                    True
    in
    div []
        [ mobileView isMenuRoute
        , desktopView
        ]

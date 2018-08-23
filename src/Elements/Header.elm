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
        [ menuLink
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

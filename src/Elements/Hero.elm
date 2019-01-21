module Elements.Hero exposing (view)

-- import Elements.Image exposing (imageWithLabel)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Json.Decode as Json
import Types exposing (..)


onEnter : Msg -> Attribute Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.succeed msg

            else
                Json.fail "not ENTER"
    in
    on "keydown" (Json.andThen isEnter keyCode)


search : Html Msg
search =
    div [ classList [ ( "round-wrapper", True ), ( "is-search-box", True ) ] ]
        [ input
            [ class "search"
            , placeholder "Search"
            , onInput ChangeQuery
            , onEnter Search
            ]
            []
        , i [ class "fa fa-search", onClick Search ] []
        ]


view : Html Msg
view =
    div []
        [ div
            [ class "hero"
            , onClick (SetRoute "#/")
            , css
                [ position relative
                , Css.height (px 370)
                , maxHeight (px 370)
                , overflow Css.hidden
                ]
            ]
            [ figure
                [ css
                    [ position absolute
                    , left (px 0)
                    , backgroundColor (hex "#000")
                    , overflow Css.hidden
                    , Css.width (pct 100)
                    , Css.maxWidth (pct 100)
                    ]
                ]
                [ img
                    [ class "hero"
                    , src "images/hero2.jpg"
                    , css
                        [ Css.width (pct 100) ]
                    ]
                    []
                ]
            , figure
                [ css
                    [ position absolute
                    , left (px 0)
                    , backgroundColor (hex "#005aa0")
                    , Css.width (pct 100)
                    , Css.maxWidth (pct 100)
                    ]
                , class "fade"
                ]
                [ img
                    [ class "hero"
                    , src "images/hero1.jpg"
                    , css
                        []
                    ]
                    []
                , span [ class "label" ] [ text "" ]
                ]
            ]
        , div
            [ css
                [ displayFlex
                , alignItems center
                , justifyContent center
                , backgroundColor (hex "#783441")
                , padding (px 10)
                ]
            , class "hide-in-desktop"
            ]
            [ search ]
        ]

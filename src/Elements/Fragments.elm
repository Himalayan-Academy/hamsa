module Elements.Fragments exposing (goBack)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, src, style)
import Html.Styled.Events exposing (onClick)
import Types exposing (..)


goBack : Html Msg
goBack =
    div
        [ onClick GoBack
        , css
            [ displayFlex
            , flexDirection row
            , verticalAlign middle
            , marginBottom (px 20)
            ]
        ]
        [ i [ class "far fa-2x fa-arrow-alt-circle-left" ] []
        , span
            [ css
                [ fontSize (px 20)
                , fontFamilies [ "sans-serif" ]
                , paddingLeft (px 10)
                ]
            ]
            [ text "Go Back" ]
        ]

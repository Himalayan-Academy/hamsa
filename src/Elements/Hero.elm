module Elements.Hero exposing (view)

import Elements.Image exposing (imageWithLabel)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Types exposing (..)


view : Html Msg
view =
    div
        [ class "hero"
        , onClick (SetRoute "#/")
        ]
        [ imageWithLabel "images/sacredness2.jpg" "" ]

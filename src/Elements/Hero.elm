module Elements.Hero exposing (view)

import Elements.Image exposing (imageWithLabel)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Types exposing (..)


view : Html Msg
view =
    div [ class "hero" ]
        [ imageWithLabel "images/MWS00SelfGod.jpg" "Self God" ]

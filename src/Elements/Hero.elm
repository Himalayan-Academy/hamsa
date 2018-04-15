module Elements.Hero exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Types exposing (..)
import Elements.Image exposing (imageWithLabel)

view : Html Msg
view =
    div [class "hero"]
      [imageWithLabel "images/MWS00SelfGod.jpg" "Self God"]

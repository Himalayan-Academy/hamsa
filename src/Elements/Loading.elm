module Elements.Loading exposing (view)

import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Types exposing (..)


view : Html Msg
view =
    div [ class "loading-wrapper" ]
        [ i [ class "fa fa-spinner fa-spin fa-3x" ] []
        ]

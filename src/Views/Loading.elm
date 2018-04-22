module Views.Loading exposing (loadingSpinner, view)

import Elements.Header
import Elements.Hero
import Elements.Selector
import Html exposing (..)
import Html.Attributes exposing (..)
import Types exposing (..)


loadingSpinner : Html Msg
loadingSpinner =
    div [ class "loading-wrapper" ]
        [ i [ class "fa fa-spinner fa-spin fa-3x" ] []
        ]


view : Model -> Html Msg
view model =
    div []
        [ Elements.Header.view
        , Elements.Hero.view
        , Elements.Selector.view model
        , loadingSpinner
        ]

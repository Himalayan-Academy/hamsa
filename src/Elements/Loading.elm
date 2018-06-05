module Elements.Loading exposing (loadMore, view)

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Types exposing (..)


view : Html Msg
view =
    div [ class "loading-wrapper" ]
        [ i [ class "fa fa-spinner fa-spin fa-3x" ] []
        ]


loadMore : Bool -> Html Msg
loadMore busy =
    if not busy then
        div
            [ css
                [ border3 (px 1) solid (hex "d3d3d3")
                , textAlign center
                , color (rgb 127 127 231)
                , padding (px 10)
                , marginBottom (px 10)
                ]
            ]
            [ span
                [ css
                    [ cursor pointer
                    , fontSize (px 20)
                    ]
                , onClick LoadMore
                ]
                [ text "Load More" ]
            ]
    else
        div
            [ css
                [ textAlign center
                , color (rgb 127 127 231)
                , padding (px 10)
                , marginBottom (px 10)
                ]
            ]
            [ i [ class "fa fa-spinner fa-spin fa-3x" ] []
            ]

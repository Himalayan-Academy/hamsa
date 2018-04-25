module Views.Artist exposing (view)

import Css exposing (..)
import Elements.Image as Image
import Elements.Loading as Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, src)
import Html.Styled.Events exposing (onClick)
import Http exposing (decodeUri)
import Navigation
import RemoteData
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


tileView : Image -> Html Msg
tileView image =
    Image.masonryTile image.thumbnail "hello" image.checksum


masonryView : String -> CollectionModel -> Html Msg
masonryView artist collection =
    div [ class "collection" ]
        [ goBack
        , div
            [ css
                [ textAlign center
                , fontFamilies [ "sans-serif" ]
                , displayFlex
                , flexDirection column
                ]
            ]
            [ div
                [ css
                    [ textAlign center ]
                ]
                [ h3
                    [ css
                        [ color colors.ocre
                        , borderBottom3 (px 1) solid colors.gray
                        , paddingBottom (px 10)
                        , display inline
                        ]
                    ]
                    [ text "Artist" ]
                ]
            , h2
                [ css
                    [ color colors.gray
                    ]
                ]
                [ text artist ]
            ]
        , div
            [ css
                [ textAlign center
                , fontFamilies [ "sans-serif" ]
                , displayFlex
                , flexDirection row
                , marginBottom (px 30)
                ]
            ]
            [ div
                [ css
                    [ width (px 300)
                    , height (px 200)
                    , backgroundColor colors.gray
                    ]
                ]
                []
            , p
                [ css
                    [ color colors.gray
                    , textAlign left
                    , paddingLeft (px 15)
                    ]
                ]
                [ text lorem ]
            ]
        , section [ class "masonry" ]
            (List.map
                tileView
                collection.images
            )
        ]


view : String -> Model -> Html Msg
view a model =
    let
        collection =
            model.collection

        artist =
            Maybe.withDefault "" <| decodeUri a
    in
    case collection of
        RemoteData.NotAsked ->
            Loading.view

        RemoteData.Loading ->
            Loading.view

        RemoteData.Success c ->
            masonryView artist c

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

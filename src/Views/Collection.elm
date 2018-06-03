module Views.Collection exposing (view)

import Css exposing (..)
import Elements.Image as Image
import Elements.Loading as Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Markdown
import RemoteData exposing (..)
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


masonryView : String -> CollectionModel -> WebData String -> Html Msg
masonryView name collection potentialDescription =
    let
        description =
            case potentialDescription of
                NotAsked ->
                    div [] []

                Loading ->
                    p [] [ text "Loading..." ]

                Failure err ->
                    p [] [ text ("Error: " ++ toString err) ]

                Success content ->
                    Html.Styled.fromUnstyled <| Markdown.toHtml [] content
    in
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
                        , display inlineBlock
                        ]
                    ]
                    [ text name ]
                ]
            , div
                [ css
                    [ color colors.gray
                    , textAlign left
                    , paddingLeft (px 15)
                    ]
                ]
                [ description ]
            ]
        , section [ class "masonry" ]
            (List.map
                tileView
                collection.images
            )
        , div
            [ css
                [ border3 (px 1) solid (rgb 100 100 100)
                , textAlign center
                , color (rgb 127 127 231)
                , padding (px 10)
                , marginBottom (px 10)
                ]
            ]
            [ span
                [ css [ cursor pointer ]
                , onClick LoadMore
                ]
                [ text "Load More" ]
            ]
        ]


view : String -> Model -> Html Msg
view name model =
    let
        collection =
            model.collection
    in
    case collection of
        RemoteData.NotAsked ->
            Loading.view

        RemoteData.Loading ->
            Loading.view

        RemoteData.Success c ->
            masonryView name c model.activePageDescription

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

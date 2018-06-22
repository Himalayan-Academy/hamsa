module Views.Collection exposing (view)

import Css exposing (..)
import Elements.Image as Image
import Elements.Loading as Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, style)
import Html.Styled.Events exposing (onClick)
import Markdown
import RemoteData exposing (..)
import Types exposing (..)
import InfiniteScroll as IS



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


masonryView : String -> CollectionModel -> Model -> Html Msg
masonryView name collection model =
    let
        potentialDescription =
            model.activePageDescription

        description =
            case potentialDescription of
                Success content ->
                    Html.Styled.fromUnstyled <| Markdown.toHtml [] content

                _ ->
                    div [] []

        bottom =
            if IS.isLoading model.infScroll then
                 div
                    [ style
                        [ ( "color", "red" )
                        , ( "font-weight", "bold" )
                        , ( "text-align", "center" )
                        ]
                    ]
                    [ text "Loading ..." ]
                
            else
                div [][]
    in
    div [ class "collection"
        ]
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
        , section 
            [ class "masonry" 
            ]
            (List.map
                tileView
                collection.images
            )
        , bottom
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
            masonryView name c model

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

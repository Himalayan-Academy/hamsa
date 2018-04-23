module Views.SingleImage exposing (view)

import Css exposing (..)
import Elements.Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, src)
import Html.Styled.Events exposing (onClick)
import Types exposing (..)


toImageUrl : String -> String
toImageUrl path =
    "http://dev.himalayanacademy.com:8080" ++ path


goBack : Html Msg
goBack =
    div
        [ onClick (SetRoute "#/")
        , css
            [ color (hex "#757575")
            , displayFlex
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


view : String -> Maybe Image -> Html Msg
view imageId image =
    case image of
        Nothing ->
            Elements.Loading.view

        Just i ->
            let
                description =
                    case i.metadata.description of
                        Just d ->
                            d

                        Nothing ->
                            ""

                artist =
                    case i.metadata.artist of
                        Just d ->
                            d

                        Nothing ->
                            ""
            in
            div
                [ css
                    [ margin auto
                    , width (pct 90)
                    ]
                ]
                [ goBack
                , div
                    [ class "single-image-wrapper" ]
                    [ div
                        []
                        [ img
                            [ css [ maxWidth (pct 100) ]
                            , src (toImageUrl i.path)
                            ]
                            []
                        
                        ]
                    , div
                        [ class "metadata" ]
                        [ div [ class "divider" ] []
                        , h1 [] [ text "image title" ]
                        , div [ class "author" ]
                            [ Html.Styled.i [ class "far fa-user fa-lg" ] []
                            , h2 [] [ text artist ]
                            ]
                        , p
                            [ css
                                [ fontFamilies [ "sans-serif" ]
                                , fontSize (px 20)
                                ]
                            ]
                            [ text description ]
                        , div [ class "dotted" ] []
                        , div [ class "categories" ]
                            [ Html.Styled.i [ class "far fa-folder-open fa-lg" ] []
                            , h2 [] [ text "Categories" ]
                            ]
                        , div [ class "collections" ]
                            [ Html.Styled.i [ class "far fa-star fa-lg" ] []
                            , h2 [] [ text "Collection" ]
                            ]
                        , div [ class "keywords" ]
                            [ Html.Styled.i [ class "far fa-bookmark fa-lg" ] []
                            , h2 [] [ text "Keywords" ]
                            ]
                        , div [ class "dotted" ] []
                        , h3 [] [ text "More by the same artist" ]
                        ]
                    ]
                ]

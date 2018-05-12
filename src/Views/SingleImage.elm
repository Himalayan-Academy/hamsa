module Views.SingleImage exposing (view)

import Css exposing (..)
import Elements.Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, src)
import Html.Styled.Events exposing (onClick)
import Types exposing (..)


toImageUrl : String -> String
toImageUrl path =
    apiURL ++ path


thumbnailFromChecksum : String -> String
thumbnailFromChecksum checksum =
    apiURL ++ "/images/_cache/" ++ checksum ++ ".thumb.jpg"


makeThumb : String -> Html Msg
makeThumb checksum =
    img
        [ src (thumbnailFromChecksum checksum)
        , class "more-images"
        , css [ cursor pointer ]
        , onClick (SetRoute ("#/item/" ++ checksum))
        ]
        []


goBack : Html Msg
goBack =
    div
        [ onClick GoBack
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
                    i.metadata.description

                isArtistKeyword k =
                    if String.contains "Artist" k then
                        Just k
                    else
                        Nothing

                foundArtists =
                    List.filterMap isArtistKeyword i.metadata.keywords

                artist =
                    if String.length i.metadata.artist > 0 then
                        i.metadata.artist
                    else
                        case List.head foundArtists of
                            Just h ->
                                h

                            Nothing ->
                                "Unknown Artist"

                imageTitle =
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
                        , p
                            [ css
                                [ fontFamilies [ "sans-serif" ]
                                , fontSize (px 20)
                                ]
                            ]
                            [ text description ]
                        ]
                    , div
                        [ class "metadata" ]
                        [ div [ class "divider" ] []
                        , h1 [] [ text imageTitle ]
                        , div
                            [ class "author"
                            , css [ cursor pointer ]
                            , onClick (SetRoute <| "#/artists/" ++ artist)
                            ]
                            [ Html.Styled.i [ class "far fa-user fa-lg" ] []
                            , h2 [] [ text artist ]
                            ]
                        , div [ class "dotted" ] []
                        , div [ class "categories" ]
                            [ Html.Styled.i [ class "far fa-folder-open fa-lg" ] []
                            , h2 [] [ text "Categories" ]
                            ]
                        , div [ class "collections" ]
                            [ Html.Styled.i [ class "far fa-star fa-lg" ] []
                            , h2 [] [ text "Collections" ]
                            ]
                        , div [ class "keywords" ]
                            [ Html.Styled.i [ class "far fa-bookmark fa-lg" ] []
                            , h2 []
                                (List.map (\k -> span [ css [ cursor pointer ], onClick (SetRoute <| "#/categories/" ++ k) ] [ text (k ++ ", ") ]) i.metadata.keywords)
                            ]
                        , div [ class "dotted" ] []
                        , h3 [] [ text "More by the same artist" ]
                        , div []
                            (List.map makeThumb i.metadata.more)
                        ]
                    ]
                ]

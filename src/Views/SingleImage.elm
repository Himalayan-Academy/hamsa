module Views.SingleImage exposing (view)

import Css exposing (..)
import Elements.Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src, target)
import Html.Styled.Events exposing (onClick)
import String.Extra as SE
import Types exposing (..)


toImageUrl : String -> String
toImageUrl path =
    if localDevelopment then
        apiURL ++ path
    else
        hapImageURL path


toFilename : String -> String
toFilename path =
    SE.replace "/" "-" path |> SE.camelize


thumbnailFromChecksum : String -> String
thumbnailFromChecksum checksum =
    if localDevelopment then
        apiURL ++ "/images/_cache/" ++ checksum ++ ".thumb.jpg"
    else
        hapImageURL <| "/_cache/" ++ checksum ++ ".thumb.jpg"


makeThumb : String -> Html Msg
makeThumb checksum =
    img
        [ src (thumbnailFromChecksum checksum)
        , class "more-images"
        , css [ cursor pointer ]
        , onClick (SetRoute ("#/item/" ++ checksum))
        ]
        []



-- goBack : Html Msg
-- goBack =
--     div
--         [ onClick GoBack
--         , css
--             [ color (hex "#757575")
--             , displayFlex
--             , flexDirection row
--             , verticalAlign middle
--             , marginBottom (px 20)
--             ]
--         ]
--         [ i [ class "far fa-2x fa-arrow-alt-circle-left" ] []
--         , span
--             [ css
--                 [ fontSize (px 20)
--                 , fontFamilies [ "sans-serif" ]
--                 , paddingLeft (px 10)
--                 ]
--             ]
--             [ text "Go Back" ]
-- ]


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

                tags =
                    List.map tag i.metadata.keywords

                tag k =
                    span
                        [ css
                            [ cursor pointer
                            , backgroundColor (hex "f1f6fffc")
                            , borderRadius (px 8)
                            , border3 (px 1) solid (hex "9a9a9a")
                            , marginLeft (px 3)
                            , marginRight (px 3)
                            , padding (px 5)
                            , display inlineBlock
                            , color (hex "#444")
                            , fontSize (px 12)
                            ]
                        , onClick (SetRoute <| "#/categories/" ++ k)
                        ]
                        [ text k ]
            in
            div
                [ css
                    [ margin auto
                    , width (pct 90)
                    ]
                ]
                [ div
                    [ class "single-image-wrapper"
                    ]
                    [ div
                        [ class "single-image" ]
                        [ img
                            [ src (toImageUrl i.medpath)
                            ]
                            []
                        , a
                            [ css
                                [ borderBottom3 (px 1) solid (hex "#b7872b")
                                , textDecoration none
                                , color (hex "#FFF")
                                , backgroundColor (hex "#649800")
                                , borderRadius (px 8)
                                , marginLeft (px 3)
                                , marginRight (px 3)
                                , padding (px 5)
                                , fontSize (px 12)
                                ]
                            , href (toImageUrl i.path)
                            , Html.Styled.Attributes.target "_blank"
                            , Html.Styled.Attributes.downloadAs <| toFilename i.path
                            ]
                            [ text "Download this image" ]
                        , p
                            [ css
                                [ fontFamilies [ "sans-serif" ]
                                , fontSize (px 20)
                                , color (hex "#333333")
                                ]
                            ]
                            [ text description ]
                        ]
                    , div
                        [ class "metadata"
                        ]
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
                        , div [ class "Tags" ]
                            -- [ Html.Styled.i [ class "far fa-bookmark fa-lg" ] []
                            [ h2 []
                                tags
                            ]
                        , div [ class "dotted" ] []
                        , h3 [] [ text "More by the same artist" ]
                        , div []
                            (List.map makeThumb i.metadata.more)
                        ]
                    ]
                ]

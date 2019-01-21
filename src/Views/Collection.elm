module Views.Collection exposing (view)

import Css exposing (..)
import Elements.Image as Image
import Elements.Loading as Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, style)
import Html.Styled.Events exposing (onClick)
import InfiniteScroll as IS
import Markdown
import RemoteData exposing (..)
import Types exposing (..)



-- goBack : Html Msg
-- goBack =
--     div
--         [ onClick GoBack
--         , css
--             [ displayFlex
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
--         ]


tileView : Image -> Html Msg
tileView image =
    Image.masonryTile image.thumbnail "hello" image.checksum


emptyCollectionView : String -> Html Msg
emptyCollectionView name =
    p
        [ css
            [ textAlign center
            , fontSize (Css.em 1.6)
            , color (hex "a76b73")
            ]
        ]
        [ text <| "Sorry but we couldn't find images related to " ++ name ++ "." ]


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
                    [ css
                        [ color colors.ocre
                        , fontWeight bold
                        , textAlign center
                        ]
                    ]
                    [ text "Loading ..." ]

            else
                div [] []

        collectionName =
            let
                classForTitle =
                    if String.toLower name == "home" then
                        "hide-in-desktop"

                    else
                        "meleca"
            in
            div
                [ css
                    [ textAlign center ]
                , class classForTitle
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
    in
    div
        [ class "collection"
        ]
        [ div
            [ css
                [ textAlign center
                , fontFamilies [ "sans-serif" ]
                , displayFlex
                , flexDirection column
                ]
            ]
            [ collectionName
            , div
                [ css
                    [ color (hex "#333")
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
            if List.isEmpty c.images then
                emptyCollectionView name

            else
                masonryView name c model

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

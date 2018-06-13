module Views.Artist exposing (view)

import Css exposing (..)
import Elements.Image as Image
import Elements.Loading as Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, src)
import Html.Styled.Events exposing (onClick)
import Http exposing (decodeUri)
import Markdown
import RemoteData exposing (..)
import String.Extra
import Types exposing (..)


artistImageURL : String -> String
artistImageURL artist =
    let
        artistDown =
            String.toLower artist

        a =
            String.Extra.replace " " "-" artistDown
                |> String.Extra.replace "." ""
                |> String.Extra.dasherize
    in
    apiURL ++ "/images/_artists/" ++ a ++ ".jpg"


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
masonryView artist collection model =
    let
        potentialDescription =
            model.activePageDescription

        description =
            case potentialDescription of
                Success content ->
                    descriptionView <| Html.Styled.fromUnstyled <| Markdown.toHtml [] content

                _ ->
                    div [] []

        bottom =
            if (model.offset + model.limit) >= model.paginationTotal then
                div [] []
            else
                Loading.loadMore model.busy

        descriptionView content =
            div []
                [ div
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
                        , color colors.gray
                        , textAlign left
                        , paddingLeft (px 15)
                        ]
                    ]
                    [ div
                        [ css
                            [ display block ]
                        ]
                        [ img
                            [ css
                                [ maxWidth (px 300)
                                , margin (px 10)
                                ]
                            , src <| artistImageURL artist
                            ]
                            []
                        ]
                    , content
                    ]
                ]
    in
    div [ class "collection" ]
        [ goBack
        , description
        , section [ class "masonry" ]
            (List.map
                tileView
                collection.images
            )
        , bottom
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
            masonryView artist c model

        RemoteData.Failure _ ->
            h1 [] [ text "failure loading" ]

module Views.MobileMenu exposing (view)

import Css exposing (..)
import Elements.Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src)
import Html.Styled.Events exposing (onClick)
import Types exposing (..)


makeSelector : String -> String -> Html Msg
makeSelector label url =
    div
        [ css
            [ displayFlex
            , flexDirection row
            , borderBottom3 (px 1) solid (hex "#c9c9c9")
            , width (pct 100)
            , flex3 (int 0) (int 0) (px 60)
            , alignItems center
            , justifyContent center
            , paddingLeft (px 10)
            , paddingRight (px 10)
            , cursor pointer
            , fontFamily sansSerif
            , fontSize (px 24)
            , backgroundColor (hex "#FFF")
            ]
        , onClick (SetRoute url)
        ]
        [ span [ css [ flex auto ] ]
            [ text label ]
        , img
            [ src "images/chevron-right.svg"
            , css
                [ height (px 32)
                , backgroundColor (hex "#c3c3c3")
                ]
            ]
            []
        ]


miniLabel : String -> Html Msg
miniLabel label =
    div
        [ css
            [ backgroundColor (hex "#c3c3c3")
            ]
        ]
        [ h4
            [ css
                [ fontSize (px 20)
                , padding (px 0)
                , margin (px 0)
                , textAlign center
                , fontFamily sansSerif
                , color (hex "#111")
                ]
            ]
            [ text label ]
        ]


menuMenu : Html Msg
menuMenu =
    div
        [ css
            [ displayFlex
            , flexDirection column
            ]
        ]
        [ makeSelector "Home" "#/"
        , makeSelector "Tags" "#/menu/tags"
        , makeSelector "Artists" "#/menu/artists"
        , makeSelector "Collections" "#/menu/collections"
        , makeSelector "About Us" "#/info"
        ]


makeItem : String -> String -> Html Msg
makeItem urlPrefix item =
    makeSelector item (urlPrefix ++ item)


artistsMenu : List String -> Html Msg
artistsMenu artists =
    let
        itemList =
            List.map (makeItem "#/artists/") <| List.sort artists
    in
    div
        [ css
            [ displayFlex
            , flexDirection column
            , overflowY scroll
            , height (calc (vh 100) minus (px 60))
            ]
        ]
        (List.concat
            [ [ miniLabel "Artists" ]
            , [ makeSelector "Home" "#/" ]
            , itemList
            ]
        )


collectionsMenu : List String -> Html Msg
collectionsMenu collections =
    let
        itemList =
            List.map (makeItem "#/categories/Collection ") <| List.sort collections
    in
    div
        [ css
            [ displayFlex
            , flexDirection column
            , overflowY scroll
            , height (calc (vh 100) minus (px 60))
            ]
        ]
        (List.concat
            [ [ miniLabel "Collections" ]
            , [ makeSelector "Home" "#/" ]
            , itemList
            ]
        )


tagsMenu : List String -> Html Msg
tagsMenu categories =
    let
        itemList =
            List.map (makeItem "#/categories/") <| List.sort categories
    in
    div
        [ css
            [ displayFlex
            , flexDirection column
            , overflowY scroll
            , height (calc (vh 100) minus (px 60))
            ]
        ]
        (List.concat
            [ [ miniLabel "Tags" ]
            , [ makeSelector "Home" "#/" ]
            , itemList
            ]
        )


view : Model -> String -> Html Msg
view model selector =
    case selector of
        "tags" ->
            tagsMenu model.categories

        "artists" ->
            artistsMenu model.artists

        "collections" ->
            collectionsMenu model.collections

        _ ->
            menuMenu

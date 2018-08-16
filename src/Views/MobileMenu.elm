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
            ]
        , onClick (SetRoute url)
        ]
        [ span [ css [ flex auto ] ]
            [ text label ]
        , img
            [ src "/images/chevron-right.svg"
            , css
                [ height (px 32)
                , backgroundColor (hex "#c3c3c3")
                ]
            ]
            []
        ]


menuMenu =
    div
        [ css
            [ displayFlex
            , flexDirection column
            ]
        ]
        [ makeSelector "Tags" "#/menu/tags"
        , makeSelector "Artists" "#/menu/artists"
        , makeSelector "Collections" "#/menu/collections"
        ]


makeItem urlPrefix item =
    makeSelector item (urlPrefix ++ item)


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
        itemList


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
        itemList


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
        itemList


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

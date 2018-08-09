module Elements.Selector exposing (..)

import Elements.Dropdown as Dropdown
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (keyCode, on, onInput, onSubmit, onWithOptions)
import Json.Decode as Json
import Types exposing (..)


-- Helper --


onEnter : Msg -> Attribute Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.succeed msg
            else
                Json.fail "not ENTER"
    in
    on "keydown" (Json.andThen isEnter keyCode)



-- routines --


round : String -> String -> List ( String, String ) -> Html Msg
round selectorClass title listOfOptions =
    let
        makeOption ( label, v ) =
            case String.length v of
                0 ->
                    option
                        [ disabled True, selected True ]
                        [ text title ]

                _ ->
                    option [ value v ] [ text label ]

        listWithTitle =
            ( title, "" ) :: listOfOptions
    in
    div [ classList [ ( "round-wrapper", True ), ( selectorClass, True ) ] ]
        [ span [ class "title" ] [ text title ]
        , i [ class "fa fa-caret-down" ] []
        , select []
            (List.map makeOption listWithTitle)
        ]


search : Html Msg
search =
    div [ classList [ ( "round-wrapper", True ), ( "is-search-box", True ) ] ]
        [ input
            [ class "title"
            , placeholder "Search"
            , onInput ChangeQuery
            , onEnter Search
            ]
            []
        , i [ class "fa fa-search" ] []
        ]


view : Model -> Html Msg
view model =
    let
        artistContext =
            { selectedItem = model.artist
            , isOpen = model.openDropdown == ArtistDropdown
            }

        categoriesContext =
            { selectedItem = model.category
            , isOpen = model.openDropdown == CategoryDropdown
            }

        collectionsContext =
            { selectedItem = model.selectedCollection
            , isOpen = model.openDropdown == CollectionDropdown
            }
    in
    div [ class "selector-controls" ]
        [ Dropdown.view categoriesConfig categoriesContext <| categoriesRoutesListFromCategoriesName model.categories
        , Dropdown.view artistConfig artistContext <| artistRoutesListFromArtistName model.artists
        , Dropdown.view collectionsConfig collectionsContext <| collectionsRoutesListFromcollectionsName model.collections
        , search
        ]


artistConfig : Dropdown.Config Msg
artistConfig =
    { defaultText = "Artist"
    , clickedMsg = Toggle ArtistDropdown
    , itemPickedMsg = SetRoute
    , selectorClass = "is-selector-artists"
    }


artistRoutesListFromArtistName : List String -> List ( String, String )
artistRoutesListFromArtistName list =
    List.sortBy Tuple.first <| List.map (\i -> ( i, "#/artists/" ++ i )) list


categoriesConfig : Dropdown.Config Msg
categoriesConfig =
    { defaultText = "Tags"
    , clickedMsg = Toggle CategoryDropdown
    , itemPickedMsg = SetRoute
    , selectorClass = "is-selector-categories"
    }


collectionsConfig : Dropdown.Config Msg
collectionsConfig =
    { defaultText = "Collections"
    , clickedMsg = Toggle CollectionDropdown
    , itemPickedMsg = SetRoute
    , selectorClass = "is-selector-collections"
    }


categoriesRoutesListFromCategoriesName : List String -> List ( String, String )
categoriesRoutesListFromCategoriesName list =
    List.sortBy Tuple.first <| List.map (\i -> ( i, "#/categories/" ++ i )) list


collectionsRoutesListFromcollectionsName : List String -> List ( String, String )
collectionsRoutesListFromcollectionsName list =
    List.sortBy Tuple.first <| List.map (\i -> ( i, "#/categories/Collection" ++ i )) list


onClick : msg -> Attribute msg
onClick message =
    onWithOptions
        "click"
        { stopPropagation = True
        , preventDefault = False
        }
        (Json.succeed message)

module Elements.Dropdown exposing (Config, Context, view)

{- a stateless Dropdown component -}

import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onWithOptions)
import Json.Decode as Json


-- MODEL
{- Context type alias
   this is dynamic stuff - may change in each update cycle
   this is not managed by the dropdown, but passed in from parent
   kind of like props (including callbacks) in react
-}


type alias Context =
    { selectedItem : Maybe String
    , isOpen : Bool
    }



{- Config is the static stuff, that won't change during life cycle
   Like functions and message constructors
   Also transparent, because this is also owned by parent
-}


type alias Config msg =
    { defaultText : String
    , clickedMsg : msg
    , itemPickedMsg : String -> msg
    , selectorClass : String
    }



-- VIEW
-- styles for list container


dropdownList : Style
dropdownList =
    Css.batch
        [ position absolute
        , borderRadius (px 4)
        , boxShadow4 (px 0) (px 1) (px 2) (rgba 0 0 0 0.24)
        , padding2 (px 4) (px 8)
        , margin (px 0)
        , Css.width (px 200)
        , backgroundColor (hex "FFFF")
        ]



-- styles for list items


dropdownListItem : Style
dropdownListItem =
    Css.batch
        [ display block
        , padding2 (px 8) (px 8)
        , cursor pointer
        ]


dropdownDisabled : Style
dropdownDisabled =
    Css.batch
        [ color (rgba 0 0 0 0.54) ]


view : Config msg -> Context -> List ( String, String ) -> Html msg
view config context data =
    let
        mainText =
            context.selectedItem
                |> Maybe.withDefault config.defaultText

        displayStyle =
            if context.isOpen then
                Css.batch
                    [ display block
                    , maxHeight (px 400)
                    , overflowY scroll
                    , zIndex (int 9999)
                    ]
            else
                Css.batch [ display none ]

        caretStyle =
            if context.isOpen then
                "fa fa-caret-up"
            else
                "fa fa-caret-down"

        mainAttr =
            case data of
                [] ->
                    [ css [ dropdownDisabled ] ]

                _ ->
                    [ onClick config.clickedMsg
                    ]
    in
    div
        [ classList [ ( "round-wrapper", True ), ( config.selectorClass, True ) ] ]
        [ div
            mainAttr
            [ span [ class "title" ] [ text mainText ]
            , i [ class caretStyle ] []
            ]
        , ul
            [ css [ displayStyle, dropdownList ] ]
            (List.map (viewItem config) data)
        ]


viewItem : Config msg -> ( String, String ) -> Html msg
viewItem config item =
    let
        ( label, value ) =
            item
    in
    li
        [ css [ dropdownListItem ]
        , onClick <| config.itemPickedMsg value
        ]
        [ text label ]



-- helper to cancel click anywhere


onClick : msg -> Attribute msg
onClick message =
    onWithOptions
        "click"
        { stopPropagation = True
        , preventDefault = False
        }
        (Json.succeed message)

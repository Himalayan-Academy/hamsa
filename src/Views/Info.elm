module Views.Info exposing (view)

import Css exposing (..)
import Elements.Loading
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src)
import Html.Styled.Events exposing (onClick)
import Markdown
import Types exposing (..)


blurb =
    """
# Welcome to HAMSA

Indian spiritual art has no equal in the world, either in scope or sheer quantity. For five decades the monks at Kauai’s Hindu Monastery in Hawaii have been commissioning and collecting original works of art for our many publications, apps and web projects. Among the thousands of images you will find rare masterpieces, educational depictions of Hindu culture, legend, deities and philosophy, sacred religious symbols, illustrated alphabets, children’s stories and decorative borders. For decades this treasure trove was hidden in the binary recesses of our server (even we could barely find things). Now the entire collection is available to you through the Himalayan Academy Museum of Spiritual Art. In Sanskrit hamsa is the word for the Indian Goose (Anser indicus) or a swan, and represents the Ultimate Reality and the spiritually pure soul. The flight of the hamsa symbolizes moksha, the release from the cycle of samsara.

You can search by key word, artist or collection. The download button will save the highest available resolution file to your computer. You may use these images freely in service to dharma. However, if your use is commercial, you must get written permission from the copyright holder, Himalayan Academy, by writing to: [contact@hindu.org](mailto:contact@hindu.org).
"""


blurbHtml =
    Html.Styled.fromUnstyled <| Markdown.toHtml [] blurb


goBack =
    button
        [ css
            [ borderBottom3 (px 1) solid (hex "#b7872b")
            , textDecoration none
            , color (hex "#FFF")
            , backgroundColor (hex "#649800")
            , borderRadius (px 8)
            , marginLeft (px 3)
            , marginRight (px 3)
            , padding (px 5)
            , fontSize (Css.em 1.1)
            ]
        , onClick GoBack
        ]
        [ text "Go back" ]


view : Html Msg
view =
    div
        [ css
            [ width (pct 90)
            , margin auto
            ]
        , class "info-blurb"
        ]
        [ blurbHtml
        , goBack
        ]

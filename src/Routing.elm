module Routing exposing (..)

import Navigation exposing (Location)
import Types exposing (..)
import UrlParser exposing (..)


extractRoute : Location -> Route
extractRoute location =
    case parsePath matchRoute location of
        Just route ->
            route

        Nothing ->
            NotFoundRoute



{-
   The HAMSA App has the following routes:

   /           => Home
   /item/<id>  => Single Image
-}


matchRoute : Parser (Route -> a) a
matchRoute =
    oneOf
        [ map HomeRoute top
        , map SingleImageRoute (s "item" </> string)
        ]

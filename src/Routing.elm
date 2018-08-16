module Routing exposing (..)

import Navigation exposing (Location)
import Types exposing (..)
import UrlParser exposing (..)


extractRoute : Location -> Route
extractRoute location =
    case parseHash matchRoute location of
        Just route ->
            route

        Nothing ->
            NotFoundRoute


matchRoute : Parser (Route -> a) a
matchRoute =
    oneOf
        [ map HomeRoute top
        , map ArtistRoute (s "artists" </> string)
        , map CollectionsRoute (s "collections" </> string)
        , map CategoriesRoute (s "categories" </> string)
        , map SearchRoute (s "search" </> string)
        , map SingleImageRoute (s "item" </> string)
        , map (MobileMenuRoute "") (s "menu")
        , map MobileMenuRoute (s "menu" </> string)
        ]

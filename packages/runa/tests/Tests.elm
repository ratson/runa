module Tests exposing (..)

import Test exposing (..)
import Expect


-- import Main
-- Check out http://package.elm-lang.org/packages/elm-community/elm-test/latest to learn more about testing in Elm!


all : Test
all =
    describe "Decode"
        [ test "decodeStatus" <|
            \_ ->
                -- Expect.equal (Main.decodeStatus "{tasks: []}") (3 + 7)
                Expect.equal 10 (3 + 7)
        ]

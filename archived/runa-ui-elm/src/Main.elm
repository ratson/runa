module Main exposing (..)

import Html exposing (Html, text, div, h1, img, li, ul, table, tr, td, th, button)
import Html.Attributes exposing (src)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode


-- GET JSON


fetchStatus : Http.Request Status
fetchStatus =
    Http.request
        { method = "GET"
        , url = "/status"
        , headers =
            [ Http.header "Accept" "application/json"
            , Http.header "Content-Type" "application/json"
            ]
        , expect = Http.expectJson decodeStatus
        , withCredentials = False
        , body = Http.emptyBody
        , timeout = Nothing
        }


startTask : String -> Http.Request Status
startTask name =
    Http.request
        { method = "POST"
        , url = "/start/" ++ name
        , headers =
            [ Http.header "Accept" "application/json"
            , Http.header "Content-Type" "application/json"
            ]
        , expect = Http.expectJson decodeStatus
        , withCredentials = False
        , body = Http.emptyBody
        , timeout = Nothing
        }


stopTask : String -> Http.Request Status
stopTask name =
    Http.request
        { method = "POST"
        , url = "/stop/" ++ name
        , headers =
            [ Http.header "Accept" "application/json"
            , Http.header "Content-Type" "application/json"
            ]
        , expect = Http.expectJson decodeStatus
        , withCredentials = False
        , body = Http.emptyBody
        , timeout = Nothing
        }


type alias Status =
    { tasks : List Task
    }


decodeTask : Decode.Decoder Task
decodeTask =
    Decode.map2 Task
        (Decode.field "name" Decode.string)
        (Decode.field "status" Decode.string)


decodeTasks : Decode.Decoder (List Task)
decodeTasks =
    Decode.list decodeTask


decodeStatus : Decode.Decoder Status
decodeStatus =
    Decode.map Status
        (Decode.field "tasks" decodeTasks)



---- MODEL ----


type alias Task =
    { name : String
    , status : String
    }


type alias Model =
    { tasks : List Task
    }


init : ( Model, Cmd Msg )
init =
    ( { tasks = [] }
    , Http.send FetchStatus fetchStatus
    )



---- UPDATE ----


type Msg
    = FetchStatus (Result Http.Error Status)
    | RefreshStatus
    | StartTask String
    | StopTask String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FetchStatus (Ok status) ->
            ( { model | tasks = status.tasks }, Cmd.none )

        FetchStatus (Err _) ->
            ( { model | tasks = [] }, Cmd.none )

        RefreshStatus ->
            ( model, Http.send FetchStatus fetchStatus )

        StartTask name ->
            ( model, Http.send FetchStatus (startTask name) )

        StopTask name ->
            ( model, Http.send FetchStatus (stopTask name) )



---- VIEW ----


toggleButton : Task -> Html Msg
toggleButton task =
    case task.status of
        "running" ->
            button [ onClick (StopTask task.name) ] [ text "stop" ]

        "stopped" ->
            button [ onClick (StartTask task.name) ] [ text "start" ]

        _ ->
            text "-"


view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "Runa Tasks" ]
        , table []
            (tr []
                [ td [] [ text "Name" ]
                , td [] [ text "Status" ]
                , td [] [ text "Action" ]
                ]
                :: (List.map
                        (\l ->
                            tr []
                                [ td [] [ text l.name ]
                                , td [] [ text l.status ]
                                , td [] [ toggleButton l ]
                                ]
                        )
                        model.tasks
                   )
            )
        ]



---- PROGRAM ----


main : Program Never Model Msg
main =
    Html.program
        { view = view
        , init = init
        , update = update
        , subscriptions = always Sub.none
        }

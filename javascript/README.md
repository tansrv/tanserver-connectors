## Install

Copy `Tanserver.js` directory into your project and include it.

### Requirements

| Browser         | Version
| :---------------| :---------------
| Chrome          | 5+
| Edge            | 12+
| Firefox         | 11+
| Safari          | 5.1+
| Chrome Android  | 18+
| Firefox Android | 14+
| Safari iOS      | 6+


## Example

```javascript
soon...
```

### getJSON()

| Declaration               | `void` getJSON(String userApi, String jsonString, `optional` Function successCallback, `optional` failureCallback)
| :------                   | :------
| Description               | Get JSON answer from the server.
| Param `userApi`           | API provided by the server.
| Param `jsonString`        | The JSON string that will be sent to the server.
| Param `successCallback`   | Function to be called if getJSON can send the packet and receives answer form server.
| Param `failureCallback`   | Function to be called if something fails I.e cannot connect through WebSocket, cannot send package or cannot receive answer.

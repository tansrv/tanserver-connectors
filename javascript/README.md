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
<script src="Tanserver.js"></script>
<script defer>
    tan = new Tanserver("tanserver.org", 2579);

    tan.getJSON("API", "{}", function(jsonString, err) {
        if (err != null) {
            alert(err);
            return;
        }

        alert(jsonString);
    });
</script>
```

### getJSON()

| Declaration                           | `void` getJSON(String userApi, String jsonString, Function successCallback, `optional` failureCallback)
| :------                               | :------
| Description                           | Get JSON answer from the server.
| Param `userApi`                       | API provided by the server.
| Param `jsonString`                    | The JSON string that will be sent to the server.
| Param `successCallback(JSON value)`   | Function to be called if getJSON can send the packet and receives answer form server, getJSON takes a parameter `value` that will contain the response from tanserver
| Param `failureCallback` [`optional`]  | Function to be called if something fails I.e cannot connect through WebSocket, cannot send package or cannot receive answer.

### Common causes of errors

1. The client is offline or the server is not started.

2. SSL handshake failed.

3. API does not exist.

4. `jsonString` is an invalid JSON string.

5. `jsonString` is too large and exceeds `client_max_json_size`.

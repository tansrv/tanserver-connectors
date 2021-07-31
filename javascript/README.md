## Install

Copy `tanserver.js` into your project and include it.

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
<script src="./tanserver.js"></script>
<script defer>
    /* Initialize connection information.  */
    var tan = new Tanserver("tanserver.org", 2579);

    /* Get JSON string from the server.  */
    tan.getJSON('API', '{}', function(jsonData, err) {
        if (err != null) {
            alert(err);  /* An error has occurred, notify the user of network failure.  */
            return;
        }

        /* Got a JSON string, parse it here.  */
        var json = JSON.parse(jsonData);
        ...
    });
</script>
```

### getJSON()

| Declaration                       | getJSON(userApi: string, jsonString: string, completion(jsonData, err): function)
| :------                           | :------
| Description                       | Get JSON answer from the server.
| Param `userApi`                   | API provided by the server.
| Param `jsonString`                | The JSON string that will be sent to the server.
| Param `completion(jsonData, err)` | `jsonData` will contain JSON answer from tanserver. If an error occurs, `err` will not be null.

### Common causes of errors

1. The client is offline or the server is not started.

2. SSL handshake failed.

3. API does not exist.

4. `jsonString` is an invalid JSON string.

/**
 * @param {String}  host Hostname of tanserver
 * @param {Integer} port Port of tanserver 
 */
function Tanserver(host, port){
    let worker;
    let _this = this;

    /**
     * @param  {Function} func Function that must run in background thread
     * @return {Worker}        Return a Worker instance executing func
     */
    let createWorker = (func) => {
        var blob = new Blob(['self.onmessage = ', func.toString()], { type: 'text/javascript' });
        var url = URL.createObjectURL(blob);
        return new Worker(url);
    }

    /**
     * @param  {String} userApi    API name
     * @param  {String} jsonString Parameter of API as json 
     * @return {String} return header {"user_api":"...","json_length":"..."}\r\n
     */
    let makeHeader = (userApi, jsonString) => {
        return `{"user_api":"${userApi}","json_length":"${jsonString}"}\r\n`;
    }

    /**
     * @param  {String} userApi    API name
     * @param  {String} jsonString Parameter of API as json 
     * @return {String} return packet using custom protocol
     */    
    let makePacket = (userApi, jsonString) => {
        return makeHeader(userApi, jsonString.length) + jsonString;
    }

    let WorkerActions = (e) => {
        if(e.data.action == "run")
        {
            //self.postMessage("success") if json is obtained successfully
            //self.postMessage("failure") otherwise
            const ws = undefined;

            try 
            {
                ws = new WebSocket(`wss://${e.data.host}:${e.data.port}`);
            }
            catch(err) 
            {
                console.log(err);
                self.postMessage("failure");
                return;
            }
            
            ws.addEventListener("open", function(e){
                ws.send(makePacket(userApi, jsonString));
            });

            ws.addEventListener('message', function (e) {
                ws.close(1000);
                console.log('Message from tanserver: ', e.data);
                self.postMessage("success");
            });

            ws.addEventListener('error', function(e){
                if(ws != undefined)
                {
                    ws.close(e.data);
                }

                console.log(e.data);
                self.postMessage("failure");
            });
            
        }
    }

    /**
     * @param {String}   userApi         API name
     * @param {String}   jsonString      Parameter of API as json  
     * @param {Function} successCallback (Optional) Function executed if json is obtained successfully 
     * @param {Function} failureCallback (Optional) Function executed if getJSON fails
     */
     _this.getJSON = (userApi, jsonString, successCallback = undefined, failureCallback = undefined) =>{
        if(typeof(worker) == "undefined")
        {
            worker = createWorker(WorkerActions);
        }

        // handle answer from worker
        worker.onmessage = function (e){
            if(e.data == "success")
            {
                if(successCallback != undefined)
                {
                    successCallback();
                }
            }
            else if(e.data == "failure"){
                if(failureCallback != undefined)
                {
                    failureCallback();
                }
            }
        }

        // send a message to worker
        worker.postMessage({'action':'run',
                            'host':host,
                            'port':port});
    }
}

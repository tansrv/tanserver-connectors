class Tanserver
{
    #host;
    #port;
    #worker;

    /**
     * @param {String}  host Hostname of tanserver
     * @param {Integer} port Port of tanserver 
     */
    constructor(host, port)
    {
        this.#host = host;
        this.#port = port;
    }

    /**
     * @param  {Function} func Function that must run in background thread
     * @return {Worker}        Return a Worker instance executing func
     */
    #createWorker(func)
    {
        var blob = new Blob(['self.onmessage = ', func.toString()], { type: 'text/javascript' });
        var url = URL.createObjectURL(blob);
        return new Worker(url);
    }

    /**
     * @param {String}   userApi         API name
     * @param {String}   jsonString      Parameter of API as json  
     * @param {Function} successCallback (Optional) Function executed if json is obtained successfully 
     * @param {Function} failureCallback (Optional) Function executed if getJSON fails
     */
    getJSON(userApi, jsonString, successCallback = undefined, failureCallback = undefined)
    {    
        if(typeof(this.#worker) == "undefined") 
        {
            this.#worker = this.#createWorker(
                function (e){
                    if(e.data.action == "run")
                    {
                        //self.postMessage("success") if json is obtained successfully
                        //self.postMessage("failure") otherwise
                        
                        //TODO: throw connection error and return failure
                        //TODO: add SSL
                        const ws = new WebSocket(`ws://${e.data.host}:${e.data.port}`);

                        //TODO: hostname verify (?)
                        
                        ws.addEventListener("open", function(e){
                            ws.send(this.makePacket(userApi, jsonString));
                        });

                        ws.addEventListener('message', function (e) {
                            console.log('Message from tanserver: ', e.data);
                        });
                        
                    }
                }
            );
        }

        // handle answer from worker
        this.#worker.onmessage = function (e){
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
        this.#worker.postMessage({'action':'run',
                                  'host':this.#host,
                                  'port':this.#port});

    }

    /**
     * @param  {String} userApi    API name
     * @param  {String} jsonString Parameter of API as json 
     * @return {String} return packet using custom protocol
     */    
    makePacket(userApi, jsonString){
        //TODO
        return "hello world";
    }

}

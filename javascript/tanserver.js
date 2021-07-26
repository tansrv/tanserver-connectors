/*
 * Copyright (C) tanserver.org
 * Copyright (C) Daniele Affinita
 * Copyright (C) Chen Daye
 */


/**
 * @param {String}  host Hostname of tanserver
 * @param {Integer} port Port of tanserver 
 */
function Tanserver(host, port) {
    let worker;
    let _this = this;

    /**
     * @param  {Function} func Function that must run in background thread
     * @return {Worker}        Return a Worker instance executing func
     */
    let createWorker = (func) => {
        var blob = new Blob(['self.onmessage = ', func.toString()],
                            {type: 'text/javascript'});

        return new Worker(URL.createObjectURL(blob));
    }

    /* Contains all worker code.  */ 
    let WorkerActions = async(e) => {

        /**
         * @param  {String} userApi    API name
         * @param  {String} jsonString Parameter of API as json 
         * @return {String} return header {"user_api":"...","json_length":"..."}\r\n
         */
        let makeHeader = (userApi, jsonLength) => {
            return `{"user_api":"${userApi}","json_length":${jsonLength}}\r\n`;
        }

        /**
         * @param  {String} userApi    API name
         * @param  {String} jsonString Parameter of API as json 
         * @return {String} return packet using custom protocol
         */
        let makePacket = (userApi, jsonString) => {
            return makeHeader(userApi, jsonString.length) + jsonString;
        }

        if (e.data.action == "run") {
            var ws = new WebSocket(`wss://${e.data.host}:${e.data.port}`);

            ws.onopen = function() {
                ws.send(makePacket(e.data.userApi, e.data.jsonString));
            }

            ws.onmessage = function(e) {
                ws.close();

                self.postMessage({
                    'error': null,
                    'jsonString': e.data.toString()
                });
            }

            ws.onclose = function(e) {

                /* 1000: Normal closure  */
                if (e.code != 1000) {
                    self.postMessage({
                        'error': "Network Error",
                        'jsonString': null
                    });
                }
            }
        }
    }

    /**
     * @param {String}   userApi                   API name
     * @param {String}   jsonString                Parameter of API as json  
     * @param {Function} completion(jsonData, err) Function executed if json is obtained successfully, it take 'value' as parameter that will contain the response from tanserver
     */
    _this.getJSON = (userApi, jsonString, completion) => {

        if (typeof(worker) == "undefined") {
            worker = createWorker(WorkerActions);
        }

        /* Handle answer from worker.  */
        worker.onmessage = function(e) {
            completion(e.data.jsonString, e.data.error);
        }

        /* Send a message to worker.  */
        worker.postMessage({'action': 'run',
                            'host': host,
                            'port': port,
                            'userApi': userApi,
                            'jsonString': jsonString
        });
    }
}

/*
 * Copyright (C) tanserver.org
 * Copyright (C) Chen Daye
 *
 * Feedback: tanserver@outlook.com
 */


package tan;


import java.io.IOException;
import java.io.UnsupportedEncodingException;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocketFactory;


public class Tanserver
{
    private String  host;
    private int     port;


    public Tanserver(String host, int port)
    {
        this.host = host;
        this.port = port;
    }


    public interface Callback
    {
        public void onSuccess(String jsonString);
        public void onFailure(IOException err);
    }


    public void getJSON(String userApi, String jsonString, Callback callback)
    {
        String host = this.host;
        int port    = this.port;

        new Thread(new Runnable() {

            @Override
            public void run() {

                SSLSocket socket = null;

                try {
                    socket = (SSLSocket)(SSLSocketFactory.getDefault()).createSocket(host, port);
                    setHostnameVerifier(socket);

                    socket.startHandshake();

                    sendPacket(socket, makePacket(userApi, jsonString));
                    callback.onSuccess(recvJsonString(socket));

                } catch (IOException err) {
                    callback.onFailure(err);
                }

                if (socket != null) {

                    try {
                        socket.close();
                    } catch (IOException err) {
                        /* ignore  */
                    }
                }
            }
        }).start();
    }


    private void setHostnameVerifier(SSLSocket socket)
    {
        SSLParameters params = new SSLParameters();

        /* Java 7+, Android 7.0+  */
        params.setEndpointIdentificationAlgorithm("HTTPS");

        socket.setSSLParameters(params);
    }


    private String makePacket(String userApi, String jsonString)
    throws UnsupportedEncodingException
    {
        return makeHeader(userApi, jsonString.getBytes("UTF-8").length) + jsonString;
    }


    private String makeHeader(String userApi, int jsonLength)
    {
        return String.format("{\"user_api\":\"%s\",\"json_length\":%d}%s",
                             userApi, jsonLength, "\r\n");
    }


    private void sendPacket(SSLSocket socket, String packet)
    throws IOException
    {
        socket.getOutputStream().write(packet.getBytes("UTF-8"));
    }


    private String recvJsonString(SSLSocket socket)
    throws IOException
    {
        String jsonString = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8")).readLine();
        if (jsonString == null)
            throw new IOException("Disconnected by server.");

        return jsonString;
    }
}

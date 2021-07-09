/*
 * Copyright (C) tanserver.org
 * Copyright (C) Chen Daye
 *
 * Feedback: tanserver@outlook.com
 */


import Foundation
import Network


final class CRLFProtocol: NWProtocolFramerImplementation
{
    static let label      = "CRLF"
    private var data      = Data()
    static let definition = NWProtocolFramer.Definition(implementation: CRLFProtocol.self)


    init(framer: NWProtocolFramer.Instance) {}
    func start(framer: NWProtocolFramer.Instance) -> NWProtocolFramer.StartResult {return .ready}
    func stop(framer: NWProtocolFramer.Instance) -> Bool {return true}
    func wakeup(framer: NWProtocolFramer.Instance) {}
    func cleanup(framer: NWProtocolFramer.Instance) {}


    func handleInput(framer: NWProtocolFramer.Instance) -> Int
    {
        while true {

            let res = framer.parseInput(minimumIncompleteLength: 1,
                                        maximumLength: 16384,
                                        parse: { buffer, _ in

                guard let buffer = buffer else {
                    return 0
                }

                self.data.append(Data(buffer))
                return buffer.count
            })

            /* 10: \n  */
            guard res, self.data.contains(10) else {
                return 0  /* need more data...  */
            }

            /* remove \r\n  */
            for _ in 0...1 {
                self.data.removeLast()
            }

            framer.deliverInput(data: self.data,
                                message: NWProtocolFramer.Message(instance: framer),
                                isComplete: true)
        }
    }


    func handleOutput(framer: NWProtocolFramer.Instance,
                      message: NWProtocolFramer.Message,
                      messageLength: Int,
                      isComplete: Bool)
    {
        try! framer.writeOutputNoCopy(length: messageLength)
    }
}


class Tanserver
{
    private let host: NWEndpoint.Host
    private let port: NWEndpoint.Port
    private let queue = DispatchQueue.global()
    private let params = NWParameters(tls: .init())


    init(host: NWEndpoint.Host, port: NWEndpoint.Port)
    {
        params.defaultProtocolStack
              .applicationProtocols
              .insert(NWProtocolFramer
              .Options(definition: CRLFProtocol.definition), at: 0)

        self.host = host
        self.port = port
    }


    public func getJSON(userApi: String,
                        jsonString: String,
                        completion: @escaping (Data?, NWError?) -> Void)
    {
        let conn = NWConnection(host: self.host,
                                port: self.port,
                                using: self.params)

        conn.stateUpdateHandler = { state in

            switch state {

            case .waiting(let err):
                completion(nil, err)

            case .failed(let err):
                completion(nil, err)
                conn.cancel()

            default:
                break
            }
        }

        conn.start(queue: self.queue)

        sendPacket(conn: conn,
                   packet: makePacket(userApi: userApi, jsonString: jsonString),
                   completion: completion)

        recvJsonString(conn: conn,
                       completion: completion)
    }


    private func sendPacket(conn: NWConnection,
                            packet: String,
                            completion: @escaping (Data?, NWError?) -> Void)
    {
        conn.send(content: packet.data(using: .utf8),
                  completion: .contentProcessed({ err in

            if err != nil {
                completion(nil, err)
                conn.cancel()
            }
        }))
    }


    private func makePacket(userApi: String,
                            jsonString: String) -> String
    {
        return makeHeader(userApi: userApi,
                          jsonLength: jsonString.utf8.count) + jsonString
    }


    private func makeHeader(userApi: String,
                            jsonLength: Int) -> String
    {
        return String(format: "{\"user_api\":\"%@\",\"json_length\":%d}%@",
                      userApi, jsonLength, "\r\n")
    }


    private func recvJsonString(conn: NWConnection,
                                completion: @escaping (Data?, NWError?) -> Void)
    {
        conn.receiveMessage(completion: { data, _, _, _ in

            if data == nil {  /* Disconnected by server.  */
                completion(nil, NWError.posix(POSIXErrorCode(rawValue: ECONNRESET)!))
            } else {
                completion(data, nil)
            }

            conn.cancel()
        })
    }
}

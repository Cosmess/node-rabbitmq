import { Channel,connect } from "amqplib";
import { config } from "dotenv";
import { Server } from "socket.io";
import CandleController from "../controllers/CandleController";
import * as http from 'http';
import { Candle } from "../models/CandleModel";

config()

export default class CandleMessageChannel{

    private _channel: Channel
    private _chandleCtrl: CandleController
    private _io: Server

    constructor(server: http.Server){
        this._chandleCtrl = new CandleController()
        this._io = new Server(server, {
            cors:{
                origin: process.env.SOCKET_CLIENT_SERVER,
                methods: ["GET","POST"]
            }
        })
        this._io.on('connection',()=> console.log("web socket coneciton created"))

    }

    private async _createMessageChannel(){
        try {
            const connection = await connect(process.env.AMQP_SERVER)
            this._channel = await connection.createChannel()
            this._channel.assertQueue(process.env.QUEUE_NAME)
        } catch (error) {
            console.log('connection to Rabbitmq error')
            console.log(error)
        }
    }

    async consumeMessage(){
        await this._createMessageChannel()
        if(this._channel){
        this._channel.consume(process.env.QUEUE_NAME, async msg=>{
            const candleObj = JSON.parse(msg.content.toString())
            console.log('message received')
            console.log(candleObj)
            this._channel.ack(msg)

            const candle: Candle = candleObj
            await this._chandleCtrl.save(candle)
            console.log('Candle saved to database')
            this._io.emit(process.env.SOCKET_EVENT_NAME,candle)
            console.log('New Candle emited by web socket.')
        })
        
        console.log('Candle Cosumer Started')
    }
    }
}
import { config } from 'dotenv'
import { Connection, connection } from 'mongoose'
import {app} from './app'
import { connectToMongoDB } from './config/db'
import CandleMessageChannel from './messages/CandleMessageChannel'

const createServer = async () => {
    config()
    await connectToMongoDB()
    const PORT = process.env.PORT;
    const server = app.listen(PORT, () => console.log(`app running on ${PORT}`))
    
    const candleMsgChannel = new CandleMessageChannel(server)
    candleMsgChannel.consumeMessage()

    
    process.on('SIGINT', async ()=>{
        await connection.close()
        server.close()
        console.log('App Server and connection mongo closed')
    })
}

createServer()
    
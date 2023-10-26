import { promises } from "dns";
import { Candle, CandleModel } from "../models/CandleModel";

export default class CandleController{

    async save(Candle: Candle): Promise<Candle> {
        const newCandle = await CandleModel.create(Candle)
        return newCandle
    }

    async findLastCandles(quantity: number): Promise<Candle[]>{
        const n = quantity > 0 ? quantity : 10
        const lastCandles : Candle[] =
         await CandleModel
         .find()
         .sort({_id: -1})
         .limit(n)

      return lastCandles
    }
}
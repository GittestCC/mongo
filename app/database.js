import mongoose from 'mongoose'

export default async () => {
  try {
    console.log('MONGODB:', process.env.MONGO_CONNECTION_STRING)
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
      useNewUrlParser: true
    })
    console.log('Connection with database succeeded.')
    return mongoose.connection
  } catch (e) {
    console.log('Connection errored with database: ', e)
    throw e
  }
}

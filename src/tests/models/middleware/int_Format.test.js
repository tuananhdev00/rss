const FormatModel = require('../../../models/Format.js').model
const mongoose = require('mongoose')
// Require to register the model for middleware
require('../../../models/Feed.js')

const dbName = 'test_int_middleware_format'
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

describe('Int::models/middleware/Format', function () {
  beforeAll(async function () {
    await mongoose.connect(`mongodb://localhost:27017/${dbName}`, CON_OPTIONS)
    await mongoose.connection.db.dropDatabase()
  })
  it(`throws an error if the feed does not exist`, async function () {
    const format = new FormatModel({
      text: 'ase',
      feed: new mongoose.Types.ObjectId().toHexString()
    })

    await expect(format.save())
      .rejects.toThrowError(/specified feed/)
  })
  it('throws an error if format tries to change feed', async function () {
    const formatId = new mongoose.Types.ObjectId()
    const feedId = new mongoose.Types.ObjectId()
    const newFeedId = new mongoose.Types.ObjectId()
    await Promise.all([
      mongoose.connection.db.collection('formats').insertOne({
        _id: formatId,
        text: 'abc',
        feed: feedId
      }),
      mongoose.connection.db.collection('feeds').insertOne({
        _id: feedId
      }),
      mongoose.connection.db.collection('feeds').insertOne({
        _id: newFeedId
      })
    ])

    const doc = await FormatModel.findOne({ _id: formatId })
    const format = new FormatModel(doc, true)
    format.feed = newFeedId.toHexString()
    await expect(format.save())
      .rejects.toThrow('Feed cannot be changed')
  })
  afterAll(async function () {
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })
})

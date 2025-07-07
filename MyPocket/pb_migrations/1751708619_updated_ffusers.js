/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3897911288")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_4q0uDmooKw` ON `ffusers` (`userid`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3897911288")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})

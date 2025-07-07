/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // update collection data
  unmarshal({
    "passwordAuth": {
      "identityFields": [
        "familyid"
      ]
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // update collection data
  unmarshal({
    "passwordAuth": {
      "identityFields": [
        "email"
      ]
    }
  }, collection)

  return app.save(collection)
})

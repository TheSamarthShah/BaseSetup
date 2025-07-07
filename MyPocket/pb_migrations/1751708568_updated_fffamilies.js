/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_2769582405` ON `fffamilies` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_2769582405` ON `fffamilies` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_suJH3hg9e7` ON `fffamilies` (`familyid`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_pbc_2769582405` ON `fffamilies` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_2769582405` ON `fffamilies` (`email`) WHERE `email` != ''"
    ]
  }, collection)

  return app.save(collection)
})

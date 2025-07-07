/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3867682221",
    "max": 0,
    "min": 0,
    "name": "selletcd",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "geoPoint1268815524",
    "name": "soldplace",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "geoPoint"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number783054703",
    "max": null,
    "min": null,
    "name": "pincode",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769582405")

  // remove field
  collection.fields.removeById("text3867682221")

  // remove field
  collection.fields.removeById("geoPoint1268815524")

  // remove field
  collection.fields.removeById("number783054703")

  return app.save(collection)
})

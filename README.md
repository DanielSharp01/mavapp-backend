# About this project

Node.js backend that transforms the Hungarian Railway Company (MÁV)'s data into a usable and reliable JSON API.

## A word about MAV

[MAV (the Hungarian Railway Company)](https://www.mavcsoport.hu/) does not know about the existense of this project (for all I know) and **DID NOT** grant access to their data. Use this backend with caution in production, you may break some data protection laws.

I do not and will not distribute any database snapshots.

## A word about OpenStreetMap

This project uses [OpenStreetMap](https://www.openstreetmap.org) for train station positions.

The code allows you to call the [Overpass API](http://overpass-api.de/) to fill your station database. This is automatic can be changed in the `./model/Station.js` file (remove the `seedWithData()` function call).

I'm not distributing any OpenStreetMap data, but the backend will, once put in production. Please note that you have to make the station database queryable in some way if you wish to comply with the OpenStreetMap license.

The derived `distance` data in the `TrainStation` entity should also be considered derived from OpenStreetMap and the same license applies.

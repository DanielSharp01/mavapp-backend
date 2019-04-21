# About this project

Node.js backend that transforms the Hungarian Railway Company (MÁV)'s data into a usable and reliable JSON API.

# TODO

- [ ] Query dispatcher (information expiry, requery etc.)
- [ ] Implement API endpoints

# API endpoints

## /train/number/:number or /train/elviraId/:elviraId

Returns a single train by number or elviraId.

### Parameters

`:number` - Number of the train. This number is publically known.

`:elviraId` - Elvira Id of the train. These are slightly longer numbers identifying a train in MAV databases.

### Response

Train stations are in order from-to.

`train-stations[].distance` means distance from the beginning of the `encoded-polyline` in meters.  
`train-stations[].arrival` can be null if the train departs from here  
`train-stations[].departure` can be null if the train arrives to here


`instance-today` is the instance of this train that runs today.

`instance-today.status` possible values:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

`instance-today.delay` is in minutes.

```json
{
  "result": {
    "number": 2628,
    "elvira-id": 5609125,
    "name": null,
    "visz-number": "S50",
    "type": "local",
    "encoded-polyline": "{j~`HebisBkP...",
    "train-stations": [
      {
        "name": "Budapest-Nyugati",
        "distance": 21.4586951863004,
        "platform": "17",
        "position": {
            "latitude" : 47.5105828,
            "longitude" : 19.0572624
        },
        "arrival": null,
        "departure": "2019-03-16 20:03:00Z"
      },
      ...
    ],
    "instance-today": {
      "status": "running",
      "date": "2019-03-16",
      "position": {
        "latitude": 47.5116349,
        "longitude": 19.1010078
      },
      "delay": 3,
    }
  },
  "status-code": 200
}
```

## /station/:name

Returns a single station by name.

### Parameters

`:name` - Will be normalized, which roughly means all accented characters will be replaced by their non accented counterpart and redundant information such as "train station", "railway station" will be removed. Will also be converted to lowercase.

### Response

`norm-name` is the normalized (unaccented, lowered etc.) name.

`trains[].distance` can be null if not known.  
`trains[].arrival` can be null if the train departs from here in this case `previous-station` will also be null.  
`trains[].departure` can be null if the train arrives to here in this case `next-station` will also be null.

All times are in UTC.

`trains[].full-knowledge: false` indicates that we don't know all the stations of this train. Which means that the `previous-station` or `next-station` may be null because we don't know them yet.

`trains[].instance-today` is the instance of the train that runs today.

`trains[].instance-today.status` possible values:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

`trains[].instance-today.delay` is in minutes.


```json
{
  "result": {
    "display-name": "Budapest-nyugati",
    "norm-name": "budapest nyugati",
    "position": {
      "latitude" : 47.5105828,
      "longitude" : 19.0572624
    },
    "trains": [
      { 
        "number": 2628,
        "elvira-id": 5609125,
        "name": null,
        "visz-number": "S50",
        "type": "local",
        "previous-station": null,
        "next-station": "zuglo",
        "distance": null,
        "arrival": null,
        "departure": "2019-03-16 20:03:00Z",
        "full-knowledge": false,
        "instance-today": {
          "status": "running",
          "date": "2019-03-16",
          "position": {
            "latitude": 47.5116349,
            "longitude": 19.1010078
          },
          "delay": 3,
        }
      },
      ...
    ]
  },
  "status-code": 200
}
```

## /direct-route/:fromname/:toname

Returns all trains going from A to B without change.

### Parameters

Both names will still be normalized, which roughly means all accented characters will be replaced by their non accented counterpart and redundant information such as "train station", "railway station" will be removed. Will also be converted to lowercase.

`:fromname` - trains will show up that start from here

`:toname` - trains will show up that go to here

### Response

`norm-name` is the normalized (unaccented, lowered etc.) name.

`[].distance` can be null if not known.  
`[].arrival` can be null if the train departs from here in this case `previous-station` will also be null.  
`[].departure` can be null if the train arrives to here in this case `next-station` will also be null.

All times are in UTC.

`[].full-knowledge: false` indicates that we don't know all the stations of this train.

`[].instance-today` is the instance of the train that runs today.

`[].instance-today.status` possible values:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

`[].instance-today.delay` is in minutes.


```json
{
  "result": [
    { 
      "number": 2628,
      "elvira-id": 5609125,
      "name": null,
      "visz-number": "S50",
      "type": "local",
      "previous-station": null,
      "next-station": "zuglo",
      "distance": null,
      "arrival": null,
      "departure": "2019-03-16 20:03:00Z",
      "full-knowledge": false,
      "instance-today": {
        "status": "running",
        "date": "2019-03-16",
        "position": {
          "latitude": 47.5116349,
          "longitude": 19.1010078
        },
        "delay": 3,
      }
    },
    ...
  ],
  "status-code": 200
}
```

## /stations-near?position=:lat,:lon&distance=:distance

Returns stations near a specific point. This endpoint does not return the trains passing through each station for that information use the `/station` endpoint.

### Parameters

`:lat` - Latitude of position

`:lon` - Longitude of position

`:distance` - Distance of search radius in meters

### Response

`norm-name` is the normalized (unaccented, lowered etc.) name.

```json
{
  "result": [
    {
      "display-name": "Budapest-nyugati",
      "norm-name": "budapest nyugati",
      "position": {
        "latitude" : 47.5105828,
        "longitude" : 19.0572624
      }
    },
    ...
  ],
  "status-code": 200
}
```

## /train-instances/[:status-filter]

Returns all train instances matching a specific status filter (filter is optional). This endpoint does not return train stations and other misc information about the train. For those use one of the `/train` endpoints.

### Parameters

`[:status-filter]` - optionally you can filter to train instances with status:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

### Response

`status` possible values:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

`delay` is in minutes.

```json
{
  "result": [
    {
      "number": 2628,
      "elvira-id": 5609125,
      "date": "2019-03-16",
      "status": "running",
      "position": {
        "latitude": 47.5116349,
        "longitude": 19.1010078
      },
      "delay": 3
    },
    ...
  ],
  "status-code": 200
}
```

## /train-instance/:elviradateid

Returns a single train instance identified with its elviradateid.

### Parameters

`:elviradateid` - `:elviraId`_`date in YYMMDD` format.  
Example: Train with id `5609125` @ 2019 March 16 would become `5609125_190316`.

### Response

`train-stations[].distance` means distance from the beginning of the `encoded-polyline` in meters.  
`train-stations[].arrival` can be null if the train departs from here  
`train-stations[].departure` can be null if the train arrives to here

`status` possible values:
- `running` (currently running)
- `stopped` (it arrived at its destination)
- `disappeared` (which means it was running and never arrived but no data is available)
- `unknown` (we have no data, usually means the train has not started yet)

`delay` is in minutes.

```json
{
  "result": {
    "number": 2628,
    "elvira-id": 5609125,
    "date": "2019-03-16",
    "name": null,
    "visz-number": "S50",
    "type": "local",
    "encoded-polyline": "{j~`HebisBkP...",
    "train-stations": [
      {
        "name": "Budapest-Nyugati",
        "distance": 21.4586951863004,
        "platform": "17",
        "position": {
            "latitude" : 47.5105828,
            "longitude" : 19.0572624
        },
        "arrival": null,
        "departure": "2019-03-16 20:03:00Z"
      },
      ...
    ],
    "status": "running",
    "position": {
      "latitude": 47.5116349,
      "longitude": 19.1010078
    },
    "delay": 3
  },
  "status-code": 200
}
```

# A word about MÁV

[MÁV (the Hungarian Railway Company)](https://www.mavcsoport.hu/) does not know about the existense of this project (for all I know) and **DID NOT** grant access to their data. Use this backend with caution in production, you may break some data protection laws.

I do not and will not distribute any database snapshots.

# A word about OpenStreetMap

This project uses [OpenStreetMap](https://www.openstreetmap.org) for train station positions.

The code allows you to call the [Overpass API](http://overpass-api.de/) to fill your station database. This is automatic can be changed in the `./src/app.js` file (remove the `require("./model/stationSeed")();` function call).

I'm not distributing any OpenStreetMap data, but the backend will, once put in production. Please note that you have to make the station database queryable in some way if you wish to comply with the OpenStreetMap license.

The derived `distance` data in the `TrainStation` entity should also be considered derived from OpenStreetMap and the same license applies.

# API v1

## I. Firestorm Collections  

### 1. Raw data  

Fetch the entire content of a firestorm-db collection:

```get
GET /v1/raw/{collection}
```

#### Parameters:
| Name       | Type   | In   | Description               | Values                              |
|------------|--------|------|---------------------------|-------------------------------------|
| collection | string | path | Firestorm Collection name | collections in `./firestorm/all.js` |

### 2. Firestorm Texture

Get basic information about a texture:

```get
GET /v1/texture/{id}/{attribute?}
```

#### Parameters:
| Name      | Type    | In   | Description       | Values                                  |
|-----------|---------|------|-------------------|-----------------------------------------|
| id        | integer | path | Texture ID        | `>= 0`                                  |
| attribute | string  | path | Texture attribute | `all`, `uses`, `paths`, `contributions` |

#### Response
```jsonc
// GET /v1/texture/1305
{
  "name": "apple",
  "id": "1305",
  "tags": [
    "Java",
    "Bedrock",
    "Item"
  ]
}
```
```jsonc
// GET /v1/texture/1305/all
{
  "name": "apple",
  "id": "1305",
  "tags": ["Java", "Bedrock", "Item"],
  "uses": {
    "1305a": {...},
    "1305b": {...}
  },
  "contributions": {
    "60f2210f83571": {...},
    "617c72698490e": {...}
  },
  "paths": {
    "6096bcd98b0d3": {...},
    "6096bcd98b110": {...},
    "6096bcd9ad3e3": {...}
  }
}
```
```jsonc
// GET /v1/texture/1305/uses
{
  "1305a": {
    "texture": 1305,
    "name": "",
    "edition": "java",
    "assets": "minecraft"
  },
  "1305b": {
    "texture": 1305,
    "name": "",
    "edition": "bedrock",
    "assets": null
  }
}
```
```jsonc
// GET /v1/textures/1305/paths
{
  "6096bcd98b0d3": {
    "use": "1305a",
    "name": "textures/item/apple.png",
    "versions": ["1.18", ...],
    "mcmeta": false
  },
  "6096bcd98b110": {
    "use": "1305a",
    "name": "textures/items/apple.png",
    "versions": ["1.12.2", ...],
    "mcmeta": false
  },
  "6096bcd9ad3e3": {
    "use": "1305b",
    "name": "textures/items/apple.png",
    "versions": ["bedrock-latest"],
    "mcmeta": false
  }
}
```
```jsonc
// GET /v1/texture/1305/contributions
{
  "60f2210f83571": {
    "date": 1626480007382,
    "resolution": "32x",
    "texture": 1305,
    "contributors": ["369259215996583936"]
  },
  "617c72698490e": {
    "date": 1635544811483,
    "resolution": "64x",
    "texture": 1305,
    "contributors": ["340497757410295808"]
  }
}
```
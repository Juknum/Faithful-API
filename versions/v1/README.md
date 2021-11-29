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

### 2. Firestorm Textures

Get basic information about a unique texture:

```get
GET /v1/texture/{id}/{attribute?}
```

Get info about one or more texture at once:

```get
GET /v1/textures/{id1,id2,id3}/{attribute?}
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
  "uses": {...},
  "contributions": {...},
  "paths": {...}
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

### 3. Firestorm Contributions

Get basic information about a unique contribution:

```get
GET /v1/contribution/{id}
```

#### Parameters:

| Name | Type   | In   | Description     | Values |
|------|--------|------|-----------------|--------|
| id   | string | path | Contribution ID |        |

#### Response
```jsonc
// GET /v1/contribution/60f2210f83571
{
  "date": 1626480007382,
  "res": "32x",
  "texture": 1305,
  "contributors": ["369259215996583936"],
  "id": "60f2210f83571"
}
```

### 3. Firestorm Addons

Get basic information about a unique addon:

```get
GET /v1/addon/{id}/{attribute?}
```

#### Parameters:

| Name      | Type    | In   | Description     | Values         |
|-----------|---------|------|-----------------|----------------|
| id        | integer | path | Addon ID        | `>= 0`         |
| attribute | string  | path | Addon attribute | `all`, `files` |

#### Response
```jsonc
// GET /v1/addon/0
{
  "name": "2D Bed Icons",
  "description": "Replaces beds in the inventory with their Bedrock Edition counterpart.",
  "authors": ["285902386701271050"],
  "slug": "2d-bed-icons",
  "options": {
    "comments": true,
    "optifine": false,
    "tags": [
      "Java",
      "32x"
    ]
  },
  "approval": {
    "status": "approved",
    "author": null,
    "reason": null
  },
  "id": "0"
}
```
```jsonc
// GET /v1/addon/0/all
{
  "name": "2D Bed Icons",
  "description": "Replaces beds in the inventory with their Bedrock Edition counterpart.",
  "authors": ["285902386701271050"],
  "slug": "2d-bed-icons",
  "options": {
    "comments": true,
    "optifine": false,
    "tags": ["Java","32x"]
  },
  "approval": {
    "status": "approved",
    "author": null,
    "reason": null
  },
  "id": "0",
  "files": {...}
}
```
```jsonc
// GET /v1/addon/0/files
{
  "0": {
    "name": null,
    "use": "header",
    "type": "url",
    "parent": {
      "type": "addons",
      "id": 0
    },
    "source": "https://database.compliancepack.net/images/addons/2d-bed-icons/header"
  },
  "1": {
    "name": "GitHub",
    "use": "download",
    "type": "url",
    "parent": {
      "type": "addons",
      "id": 0
    },
    "source": "https://github.com/Compliance-Addons/Addons/raw/master/32x/2D%20Bed%20Icons/2D%20Bed%20Icons%2032x.zip"
  }
}
```
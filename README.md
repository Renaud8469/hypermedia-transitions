# State transitions

This repository contains a module helping you to add hypermedia support for you API. 

## Features 

This module consists of : 
- a fixed data structure to store your API state transitions (more details in the next section)
- parsers for many different hypermedia-compliant media types exploiting this data structure to build the response. 

## Data structure 

The state transitions you define should be objects defining the following properties : 
- **rel** : the name for your transition 
- **target** : the target state of your transition
- **accessibleFrom** : a list of states from which your transition can be triggered
- **href** : the URL to trigger your transition (relative from domain name)
- **isUrlTemplate** : whether the URL written in the previous field can be used "as is" or is a URL template that needs to be filled in 
- **method** : the HTTP method to trigger your transition
- **authRequired** : whether or not the client needs to be authenticated to be able to trigger that transition
- **template** : a template for what kind of data should be sent (POST or PUT methods for example) 

### Example 

```javascript
{
  "rel": "update-task",
  "target": "task",
  "accessibleFrom": ["home", "list task"],
  "href": "/tasks/{id}",
  "isUrlTemplate": true,
  "method": "post",
  "authRequired": false,
  "template": {
    "name": "string",
    "completed": "bool",
    "description": "string"
  }
}
```

## Featured media types

- HAL (<http://stateless.co/hal_specification.html>) [INCOMPLETE]
- ... more to come ! 


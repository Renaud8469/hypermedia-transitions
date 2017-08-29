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
- **accessibleFrom** : a list of objects with states from which your transition can be triggered and eventually, the data needed to fill the template.
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
  "accessibleFrom": [
    { "state": "home" }, 
    { "state": "list task" },
    { "state": "task", "fillTemplateWith": "task_id" }
  ],
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

// task_id here is a data element that is included in your API response when displaying a task resource
```

EXCEPTION : When your data is a list of resources instead of a single one, links will also be added to each element. 
Those links can be filled with each resource's own data if needed : for this you need to add "eachItem" in the object you include in "accessibleFrom". Example :

```javascript
{
// ...
  accessibleFrom: [{state: "list resources", fillTemplateWith: {id: "id"}, eachItem: true}]
// ...
}

// Will result in (HAL for example) : 

[
  { 
    // ...
    _links: {
      resource: {
        href: http://example.org/resources/1
      }
    }
  },
  { 
    // ...
    _links: {
      resource: {
        href: http://example.org/resources/2
      }
    }
  }
]
  
```

EXCEPTION (again) : You can specify if you want a link to be the "self" relationship, in embedded resources or not, with the "withSelfRel" attribute in the "accessibleFrom" object. Example : 

```javascript
{
// ...
  accessibleFrom: [{state: "list resources", fillTemplateWith: {id: "id"}, eachItem: true, withSelfRel: true}]
// ...
}

// Will result in (HAL for example) : 

[
  { 
    // ...
    _links: {
      self: {
        href: http://example.org/resources/1
      }
    }
  },
  { 
    // ...
    _links: {
      self: {
        href: http://example.org/resources/2
      }
    }
  }
]
  
```
## Authentication

To be able to display results that are only visible by authenticated users, you will have to add a req.isAuth property. If it is not set or false, the translators will consider that the user is not authenticated.


## Featured media types

- HAL (<http://stateless.co/hal_specification.html>) [INCOMPLETE]
- ... more to come ! 


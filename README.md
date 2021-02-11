# Mani is an HTTP manifold

What's that mean?

**Why?**

Graphql has become very popular, for its ability to speed up web requests
by taking a single request with information about multiple requests and

If this works and you don't need graphql types, then this is way simpler,
and doesn't require extra code to be written.

#### TODO

- [ ] Accept multiple request formats.
- [ ] Configure allowed origins.
- [x] Non base64 request body to make it human readable.
- [ ] Cookies support.

Mani example:

**Request**

POST http://localhost:9999/mani

```json
{
    "requests": [
        {
            "url": "https://jsonplaceholder.typicode.com/comments/1",
            "method": "GET",
            "body": "base64 string | null"
        },
        {
            "url": "https://jsonplaceholder.typicode.com/comments/2",
            "method": "GET",
            "body": "base64 string | null"
        }
    ]
}
```

**Response**

The response objects come in the same order that they were sent in the request.

```json
{
    "responses": [
        {
            "response": {
                "status": "200 OK",
                "headers": {
                    "Foo": "Bar"
                },
                "body": "{ some json from that site } base64 encoded."
            }
        },
        {
            "errors": [
                {
                    "description": "Maybe a DNS resolution error or something?"
                }
            ]
        }
    ]
}
```

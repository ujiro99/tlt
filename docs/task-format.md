# Format of task
The task has the following properties

- `Task title`
- `Status`
- `Work Time (estimated, actual)`
- `Tags, which includes quantity (estimated, actual)`


## example
    ```
    - [ ] Task title
    - [ ] Task title ~1h
    - [ ] Task title ~3h #sp:2
    - [ ] Task title ~3h #type #sp:1
      - [ ] Sub-task or description
    - [x] Task title ~3h/4h #type #sp:1/2

    ```

## Treat tags as properties
Tags are words that start with `#`.  
You can use any word. It can also be used as a keyvalue-style property by separating it with `:`.  
In addition, you can express estimate and actual values by separating `/`.

    ```
    #type      <- tag
    #sp:1      <- tag with value
    #sp:1/2    <- tag with estimate and actual values

    ```

# RemNote-Schedule

Visualize your daily schedule.

## Tips

Use <kbd>Alt</kbd> + <kbd>Up</kbd>/<kbd>Down</kbd> to swap tasks of the form `x,+30`.

## Usage / Development

Add this URL to your [RemNote plugins](https://www.remnote.io/plugins):

```
http://localhost:1234/public/index.html
```

Additionally configure:

- **Plugin Name:** `remnote-schedule`
- **CSS Height:** `600px`
- **CSS Width:** `400px`

Run the plugin locally:

```
yarn dev
```

## Deployment

- [ ] Make GitHub action to gh-pages

```sh
yarn build
```

## Roadmap

- [ ] Read events from RemNote
- [ ] Ignore non-event Rems
- [ ] Tags
- [ ] Multi-column
- [ ] Redraw on data change
- [ ] Nested blocks: Event Rems which are indented in a Event Rem get rendered as subblock
- [ ] Separate plugin settings page which has settings for colors, icons etc.
  - `- #RRGGBB: RemReference` colors events tagged with `#RemReference`
  - autohighlight on tag
- [ ] Interactivity (this would need write access)
  - Click on a block to open the rem
  - Delete block (gets hidden?)
  - Drag to reschedule

TODO:

- Maybe research other calendar views

## References

Other RemNote plugins:

- https://glitch.com/~remnote-pomodoro
  - https://github.com/sirvan3tr/RemNote-Pomodoro
- https://glitch.com/~remnote-wordcloud-plugin
- https://glitch.com/~remnotewordcount
- Graph
- https://glitch.com/edit/#!/abalone-pointy-ash?path=script.js%3A16%3A18 (Something with table formatting)

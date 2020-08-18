# RemNote-Schedule

Visualize your daily schedule.

## Tips

Use <kbd>Alt</kbd> + <kbd>Up</kbd>/<kbd>Down</kbd> to swap tasks of the form `x,+30`.

## Usage / Development

Add this URL to your [RemNote plugins](https://www.remnote.io/plugins):

```
http://localhost:5500/public/index.html
```

Additionally configure:

- **Plugin Name:** `remnote-schedule`
- **CSS Height:** `600px`
- **CSS Width:** `400px`

Serve the plugin, for example with [`live-server`](https://github.com/tapio/live-server) ([VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), [`npm install -g live-server`](https://github.com/tapio/live-server)).

```sh
live-server public --port=5500 --no-browser
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

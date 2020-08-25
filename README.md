# RemNote-Schedule

Visualize your daily schedule.

![Demo](demo.png)

## Usage

Add the plugin to a document and it renders all entries under a parent with the name `Schedule`.

The syntax was developed by [CrushEntropy](https://crushentropy.com/). It is designed to be typed fast and to easily reschedule if things change. See the original tool for a guide.

Basically you write Rems of the following form

```
HHMM,HHMM,description #tag
```

Each line represents a time block. It consists of a start time, an end time and a description for that time block.
You can also use tags to categorize and color blocks.

As a shortcut you can use

- `x` as start time to indicate that it should start right when the previous ended
- `+MM`/`+HMM` as a end time to indicate that the time block lasts `MM` minutes / `H` hours and `MM` minutes. **Note:** This parses `+120` as 1 hour 20 minutes, not 2 hours.

### Tips

- Use <kbd>Alt</kbd> + <kbd>Up</kbd>/<kbd>Down</kbd> to swap tasks of the form `x,+30`.
- To configure the color of a tag, go to `Custom CSS` and add a block like this:

```
rect.block.YOUR_TAG {
  fill: lime;
}
```

## Installation

Add this URL to your [RemNote plugins](https://www.remnote.io/plugins):

```
https://hannesfrank.github.io/remnote-schedule/index.html
```

Additionally configure:

- **Plugin Name:** `remnote-schedule`
- **CSS Height:** `600px`
- **CSS Width:** `400px`

Add the plugin to a Document with the `/remnote-schedule` command.

## Development

Add a plugin `remnote-schedule-dev` with the above settings.

```
http://localhost:1234/public/index.html
```

Run the plugin locally:

```
yarn dev
```

### Deployment

```sh
git checkout gh-pages
rm -r docs
yarn build
git add docs
git commit -m "Release"
git push origin gh-pages
```

- [ ] Make github action

## Known Issues

- The `children` list of a rem gets sorted wrong leading to wrong schedules using the `x` syntax. Try reloading the page.
- I have not implemented the multi column layout yet. The current single column might bug if you reschedule/overwrite things.

## Roadmap

- [x] Read events from RemNote
  - [ ] Proper error handling. What happens if you are zoomed into the schedule? Or the plugin is itself a child of schedule?
- [x] Ignore non-event Rems
- [x] Tags
- [ ] Handle intersecting events
  - [ ] Handle event inside another in Single-column
  - [ ] Support Multi-column
- [x] Ability to Reload
  - [ ] Watch Rem changes
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

### Engineering

- [ ] Add documentation to RemNoteAPI
  - [ ] Add docstrings.
  - [ ] Add type definitions.
  - [ ] Publish to npm?
- [ ] Locally test RemNoteAPI.
  - [ ] Make a separate RemNote account with a demo document. Export this to JSON.
  - [ ] Make the API connector work with the JSON file.

## References

Other RemNote plugins:

- https://glitch.com/~remnote-pomodoro
  - https://github.com/sirvan3tr/RemNote-Pomodoro
- https://glitch.com/~remnote-wordcloud-plugin
- https://glitch.com/~remnotewordcount
- GraphView
- https://glitch.com/edit/#!/abalone-pointy-ash?path=script.js%3A16%3A18 (Something with table formatting)
- Image Search :mag_right: Search and import images into any document with two clicks!
  1. Go to https://www.remnote.io/plugins
  2. Create a new plugin with this URL: https://remnoteimagesearch.glitch.me/
  3. Set plugin name to 'Image Search'
  4. Set plugin description to 'Image Search'
  5. Set width to 600px
  6. Allow permissions to Read, Create and Modify
  7. Set a custom shortcut (I use CTRL+SHIFT+G)
  8. Switch the plugin from Inline to Popup

Other RemNote code:

- https://observablehq.com/collection/@dmrd/remnote
  - GraphViz (tree and force layout)
  - Crawler to load rems

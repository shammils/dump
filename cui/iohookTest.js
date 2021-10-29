const ioHook = require('iohook');
ioHook.on('keydown', (event) => { console.log(event); });
ioHook.registerShortcut([42, 18], async (keys) => {
  console.log('SHIFT+e clicked, ')
});
ioHook.registerShortcut([42, 36], async (keys) => {
  console.log('SHIFT+j clicked, ')
});
ioHook.registerShortcut([46], async (keys) => {
  console.log('c clicked, cancelling current op')
});
ioHook.start(true);

/*
  retain the last drawn value
  on resize, redraw last value

  In order to draw a proper view for every occasion, a string with line breaks
  is no longer sufficient. We need an object with known properties for
  breadcrumbs, indicators, selectable items, etc
*/
let view

process.stdout.on('resize', () => {
  const dims = {
    width: process.stdout.columns,
    height: process.stdout.rows,
  }
  // redraw
  // draw(view)
})

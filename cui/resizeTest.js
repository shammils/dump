process.stdout.on('resize', () => {
  console.log(`screen size: ${process.stdout.columns}x${process.stdout.rows}`)
})

setInterval(() => {}, 1000)

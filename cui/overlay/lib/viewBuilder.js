class ViewBuilder {
  constructor(type) {
    // types: list, table
    this.type = type
    this.rows = []
    /*
    Future Table support
    this.table =
      [
        ['col0',     'col1',     'col2'     ]
        ['col0_row0','col0_row0','col2_row0']
        ['col0_row1','col0_row1','col2_row1']
      ]
    */
  }
  append(row) {
    this.rows.push(row)
  }
  prepend(row) {
    // insert at pos 0? would we ever even want this?
    console.log('prepend not implemented')
    process.exit()
  }
  build() {}
  // TODO: support grids/tables

  //get() {return this}
}
module.exports = ViewBuilder

import React from "react"
// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"
// normalize CSS across browsers
import "./src/normalize.css"
// custom CSS styles
import "./src/style.css"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

import Wrap from "./src/components/wrap"

export function wrapPageElement({ element, props }) {
  // console.log({ rest })
  return <Wrap {...props}>{element}</Wrap>
}

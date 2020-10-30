import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

function convert(input, distinct = new Set()) {
  if (input instanceof Map) {
    input = Object.fromEntries(input.entries())
  }

  const out = Object.entries(input).reduce((acc, [key, val]) => {
    let init = val
    if (key === `/dev-404-page`) {
      return acc
    }

    if (!val) {
      const tested = `_undefined_`
      acc[key] = tested

      distinct.add(tested)

      return acc
    }

    if (val.result) {
      val = val.result
    }

    if (val.payload && val.payload.result) {
      val = val.payload.result
    }

    if (val.payload && val.payload.json) {
      val = val.payload.json
    }

    if (!val || !val.data) {
      console.log({ val, init })
      return acc
    }

    const tested = val?.data?.markdownRemark?.frontmatter?.title ?? `_wat_`

    acc[key] = tested

    distinct.add(tested)

    return acc
  }, {})
  return out
}

function generate() {
  let distinct = new Set()

  const tmp = {
    pageQueryData: convert(window.getPageQueryData(), distinct),
    pageDb: convert(window.pageDb, distinct),
    pageDataDb: convert(window.pageDataDb, distinct),
    staticQueryData: convert(window.getStaticQueryData(), distinct),
    staticQueryDb: convert(window.staticQueryDb, distinct),
  }
  return {
    distinct: Array.from(distinct),
    numbers: Object.fromEntries(
      Object.entries(tmp).map(([key, value]) => [
        key,
        Object.keys(value).length,
      ])
    ),
    ...tmp,
  }
}

function RuntimeCaches() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setI(i => i + 1)
    }, 250)

    return () => {
      clearInterval(interval)
    }
  }, [])
  const result = generate()
  return (
    <div>
      {result.distinct.length > 1 ? (
        <p style={{ color: "red" }}>Something is wrong!</p>
      ) : (
        ``
      )}

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}

export default function Wrap({ children, pageContext, location }) {
  return (
    <>
      <div style={{ display: "flex" }}>
        <ul>
          {pageContext.links.map(link => (
            <li key={link}>
              <Link to={link}>{link}</Link>
              {location.pathname === link ? ` [c]` : ``}
            </li>
          ))}
        </ul>
        <RuntimeCaches />
      </div>
      {children}
    </>
  )
}

import React, { useState, useEffect } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

function convert(input, distinct = new Set()) {
  if (input instanceof Map) {
    input = Object.fromEntries(input.entries())
  }

  const out = Object.entries(input).reduce((acc, [key, val]) => {
    let init = val
    if (key === `/dev-404-page`) {
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

    const tested = val.data.markdownRemark.frontmatter.title

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

const BlogPostTemplate = ({ data, location, pageContext, path }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      {/* <pre>{JSON.stringify(prop)}</pre> */}
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
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`

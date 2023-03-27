import * as fs from 'node:fs/promises'
import glob from 'glob'
import path from 'path'
import { marked } from 'marked'
import ejs from 'ejs'
import githubMarkdownCss from 'generate-github-markdown-css'

const SOURCE_DIR = '../docs/'
const DIST_DIR = 'dist'

// EJS template
const TEMPLATE = await fs.readFile('template.ejs', 'utf8')

async function postBuild() {
  try {
    await fs.stat(DIST_DIR)
  } catch {
    await fs.mkdir(DIST_DIR)
  }
}

/**
 * main function.
 */
async function build() {
  await postBuild()

  const options = {
    ignore: 'node_modules/**/*.md',
  }

  conv('../README.md', 'index.html', 'TLT - ToDo List & Time Tracking')
  conv('./oauth.md')

  // files in docs folder
  glob(`${SOURCE_DIR}/**/*.md`, options, function (er, files) {
    for (const fileName of files) {
      conv(fileName)
    }
  })

  // images in docs folder
  await fs.rename(`${SOURCE_DIR}/img`, `${DIST_DIR}/img`)

  css()
}

/**
 * Converts markdown to html.
 * @param {string} srcFilePath
 * @param {string} distName?
 * @param {string} title?
 */
async function conv(srcFilePath, distName, title) {
  // generate file name
  const name = path.basename(srcFilePath).split('.').shift()
  if (title == null) {
    title = name
  }

  // MarkdownファイルをHTML文字列に変換する
  const content = await fs.readFile(srcFilePath, { encoding: 'utf8' })
  let html = marked.parse(content, { gfm: true })
  html = ejs.render(TEMPLATE, {
    title: title,
    content: html,
  })

  let outPath
  if (distName) {
    outPath = path.join(DIST_DIR, distName)
  } else {
    outPath = path.join(DIST_DIR, `${name}.html`)
  }
  await fs.writeFile(outPath, html)
  console.log(srcFilePath)
}

async function css() {
  const css = await githubMarkdownCss({ light: 'light' })
  const outPath = path.join(DIST_DIR, 'style.css')
  await fs.writeFile(outPath, css)
}

build()

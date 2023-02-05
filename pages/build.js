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
  const s = await fs.stat(DIST_DIR)
  if (!s.isDirectory()) {
    await fs.mkdir(DIST_DIR)
  }
}

/**
 * main function.
 */
async function build() {
  postBuild()

  const options = {
    ignore: 'node_modules/**/*.md',
  }

  conv('../README.md', 'index.html')

  // files in docs folder
  glob(`${SOURCE_DIR}/**/*.md`, options, function (er, files) {
    for (const fileName of files) {
      conv(fileName)
    }
  })

  css()
}

async function conv(fileName, outName) {
  // generate file name
  const name = path.basename(fileName).split('.').shift()

  // MarkdownファイルをHTML文字列に変換する
  const content = await fs.readFile(fileName, { encoding: 'utf8' })
  let html = marked.parse(content, { gfm: true })
  html = ejs.render(TEMPLATE, {
    title: name,
    content: html,
  })

  let outPath
  if (outName) {
    outPath = path.join(DIST_DIR, outName)
  } else {
    outPath = path.join(DIST_DIR, `${name}.html`)
  }
  await fs.writeFile(outPath, html)
  console.log(fileName)
}

async function css() {
  const css = await githubMarkdownCss({ light: 'light' })
  const outPath = path.join(DIST_DIR, 'style.css')
  await fs.writeFile(outPath, css)
}

build()

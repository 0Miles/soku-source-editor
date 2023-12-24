import { Renderer } from "marked"

const renderer = new Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
}

export default renderer
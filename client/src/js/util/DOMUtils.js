export const DOMUtils = {
    /**
     * @param {string} tag
     * @param {string} id
     * @param {Element} parent
     * @param {*} styleParams
     * @param {string} cssClass
     * @return {Element}
     */
    createElement: (tag, id, parent = null, styleParams = null, cssClass = null) => {
        const el = document.createElement(tag)
        el.id = id
        if (parent === null || parent === undefined) {
            document.body.appendChild(el)
        } else {
            parent.appendChild(el)
        }

        if (styleParams !== null && styleParams !== undefined) {
            for (const key in styleParams) {
                el.style[key] = styleParams[key]
            }
        }

        if (cssClass !== null && cssClass !== undefined) {
            el.className = cssClass
        }
        return el
    },

    createButton: (parent, width, text, onClick) => {
        const el = DOMUtils.createElement('button', '', parent, {width: width + 'px'})
        el.type = 'button'
        el.innerHTML = text

        el.addEventListener('click', _ => {
            onClick && onClick()
        })
        return el
    },

    makeLine: (parent, marginTop, children) => {
        const line = DOMUtils.createElement('div', '', parent, {'text-align': 'center', 'margin-top': marginTop + 'px'})
        children.forEach(ch => {
            line.appendChild(ch)
        })
        return line
    },

    makeLabel: (text, inline, parent) => {
        const p = DOMUtils.createElement('p', '', parent, {display: inline ? 'inline-block' : 'block'});
        p.innerHTML = text
        return p
    },

    makeDropdown: (options) => {
        const s = DOMUtils.createElement('select')
        const nodeOptions = options.map(v => {
            const o = document.createElement('option')
            o.setAttribute('value', v)
            o.innerHTML = v
            return o
        })
        nodeOptions.forEach(n => s.appendChild(n))
        return s
    }
}
/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function () {
    var undefined, key, $, classList, emptyArray = [],
        slice = emptyArray.slice,
        filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        isArray = Array.isArray || function (object) {
                return object instanceof Array
            }

    zepto.matches = function (element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent
        if (temp) (parent = tempParent).appendChild(element)
        match = ~zepto.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }

    function type(obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) {
        return type(value) == "function"
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject(obj) {
        return type(obj) == "object"
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray(obj) {
        return typeof obj.length == 'number'
    }

    function compact(array) {
        return filter.call(array, function (item) {
            return item != null
        })
    }

    function flatten(array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array
    }

    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : ''
        })
    }

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }

    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) == idx
        })
    }

    function classRE(name) {
        return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function children(element) {
        return 'children' in element ? slice.call(element.children) : $.map(element.childNodes, function (node) {
            if (node.nodeType == 1) return node
        })
    }

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function (html, name, properties) {
        var dom, nodes, container

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
            if (!(name in containers)) name = '*'

            container = containers[name]
            container.innerHTML = '' + html
            dom = $.each(slice.call(container.childNodes), function () {
                container.removeChild(this)
            })
        }

        if (isPlainObject(properties)) {
            nodes = $(dom)
            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom
    }

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. Note that `__proto__` is not supported on Internet
    // Explorer. This method can be overriden in plugins.
    zepto.Z = function (dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
    }

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function (object) {
        return object instanceof zepto.Z
    }

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function (selector, context) {
        var dom
        // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z()
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim()
            // If it's a html fragment, create nodes from it
            // Note: In both Chrome 21 and Firefox 15, DOM error 12
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector)) dom = zepto.fragment(selector, RegExp.$1, context), selector = null
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector)
            // If it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector)
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector)
        // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) return selector
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector)
            // Wrap DOM nodes.
            else if (isObject(selector)) dom = [selector], selector = null
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector)) dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector)
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector)
        }
        // create a new Zepto collection from the nodes found
        return zepto.Z(dom, selector)
    }

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function (selector, context) {
        return zepto.init(selector, context)
    }

    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) target[key] = {}
                if (isArray(source[key]) && !isArray(target[key])) target[key] = []
                extend(target[key], source[key], deep)
            } else if (source[key] !== undefined) target[key] = source[key]
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function (arg) {
            extend(target, arg, deep)
        })
        return target
    }

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly)
        return (isDocument(element) && isSimple && maybeID) ? ((found = element.getElementById(nameOnly)) ? [found] : []) : (element.nodeType !== 1 && element.nodeType !== 9) ? [] : slice.call(
            isSimple && !maybeID ? maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                element.getElementsByTagName(selector) : // Or a tag
                element.querySelectorAll(selector) // Or it's not simple, and we need to query all
        )
    }

    function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
    }

    $.contains = document.documentElement.contains ? function (parent, node) {
        return parent !== node && parent.contains(node)
    } : function (parent, node) {
        while (node && (node = node.parentNode))
            if (node === parent) return true
        return false
    }

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
            return value ? value == "true" || (value == "false" ? false : value == "null" ? null : +value + "" == value ? +value : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value
        } catch (e) {
            return value
        }
    }

    $.type = type
    $.isFunction = isFunction
    $.isWindow = isWindow
    $.isArray = isArray
    $.isPlainObject = isPlainObject

    $.isEmptyObject = function (obj) {
        var name
        for (name in obj) return false
        return true
    }

    $.inArray = function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
    }

    $.camelCase = camelize
    $.trim = function (str) {
        return str == null ? "" : String.prototype.trim.call(str)
    }

    // plugin compatibility
    $.uuid = 0
    $.support = {}
    $.expr = {}

    $.map = function (elements, callback) {
        var value, values = [],
            i, key
        if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
            value = callback(elements[i], i)
            if (value != null) values.push(value)
        } else for (key in elements) {
            value = callback(elements[key], key)
            if (value != null) values.push(value)
        }
        return flatten(values)
    }

    $.each = function (elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    }

    $.grep = function (elements, callback) {
        return filter.call(elements, callback)
    }

    if (window.JSON) $.parseJSON = JSON.parse

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    })

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el)
            }))
        },
        slice: function () {
            return $(slice.apply(this, arguments))
        },

        ready: function (callback) {
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) callback($)
            else document.addEventListener('DOMContentLoaded', function () {
                callback($)
            }, false)
            return this
        },
        get: function (idx) {
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray: function () {
            return this.get()
        },
        size: function () {
            return this.length
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode != null) this.parentNode.removeChild(this)
            })
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false
            })
            return this
        },
        filter: function (selector) {
            if (isFunction(selector)) return this.not(this.not(selector))
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector)
            }))
        },
        add: function (selector, context) {
            return $(uniq(this.concat($(selector, context))))
        },
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector)
        },
        not: function (selector) {
            var nodes = []
            if (isFunction(selector) && selector.call !== undefined) this.each(function (idx) {
                if (!selector.call(this, idx)) nodes.push(this)
            })
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) : (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                this.forEach(function (el) {
                    if (excludes.indexOf(el) < 0) nodes.push(el)
                })
            }
            return $(nodes)
        },
        has: function (selector) {
            return this.filter(function () {
                return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size()
            })
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
        },
        first: function () {
            var el = this[0]
            return el && !isObject(el) ? el : $(el)
        },
        last: function () {
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },
        find: function (selector) {
            var result, $this = this
            if (!selector) result = $()
            else if (typeof selector == 'object') result = $(selector).filter(function () {
                var node = this
                return emptyArray.some.call($this, function (parent) {
                    return $.contains(parent, node)
                })
            })
            else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
            else result = this.map(function () {
                    return zepto.qsa(this, selector)
                })
            return result
        },
        closest: function (selector, context) {
            var node = this[0],
                collection = false
            if (typeof selector == 'object') collection = $(selector)
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode
            return $(node)
        },
        parents: function (selector) {
            var ancestors = [],
                nodes = this
            while (nodes.length > 0)
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            return filtered(ancestors, selector)
        },
        parent: function (selector) {
            return filtered(uniq(this.pluck('parentNode')), selector)
        },
        children: function (selector) {
            return filtered(this.map(function () {
                return children(this)
            }), selector)
        },
        contents: function () {
            return this.map(function () {
                return slice.call(this.childNodes)
            })
        },
        siblings: function (selector) {
            return filtered(this.map(function (i, el) {
                return filter.call(children(el.parentNode), function (child) {
                    return child !== el
                })
            }), selector)
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = ''
            })
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function (property) {
            return $.map(this, function (el) {
                return el[property]
            })
        },
        show: function () {
            return this.each(function () {
                this.style.display == "none" && (this.style.display = '')
                if (getComputedStyle(this, '').getPropertyValue("display") == "none") this.style.display = defaultDisplay(this.nodeName)
            })
        },
        replaceWith: function (newContent) {
            return this.before(newContent).remove()
        },
        wrap: function (structure) {
            var func = isFunction(structure)
            if (this[0] && !func) var dom = $(structure).get(0),
                clone = dom.parentNode || this.length > 1

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom)
            })
        },
        wrapAll: function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first()
                $(structure).append(this)
            }
            return this
        },
        wrapInner: function (structure) {
            var func = isFunction(structure)
            return this.each(function (index) {
                var self = $(this),
                    contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom)
            })
        },
        unwrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children())
            })
            return this
        },
        clone: function () {
            return this.map(function () {
                return this.cloneNode(true)
            })
        },
        hide: function () {
            return this.css("display", "none")
        },
        toggle: function (setting) {
            return this.each(function () {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
            })
        },
        prev: function (selector) {
            return $(this.pluck('previousElementSibling')).filter(selector || '*')
        },
        next: function (selector) {
            return $(this.pluck('nextElementSibling')).filter(selector || '*')
        },
        html: function (html) {
            return 0 in arguments ? this.each(function (idx) {
                var originHtml = this.innerHTML
                $(this).empty().append(funcArg(this, html, idx, originHtml))
            }) : (0 in this ? this[0].innerHTML : null)
        },
        text: function (text) {
            return 0 in arguments ? this.each(function (idx) {
                var newText = funcArg(this, text, idx, this.textContent)
                this.textContent = newText == null ? '' : '' + newText
            }) : (0 in this ? this[0].textContent : null)
        },
        attr: function (name, value) {
            var result
            return (typeof name == 'string' && !(1 in arguments)) ? (!this.length || this[0].nodeType !== 1 ? undefined : (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result) : this.each(function (idx) {
                if (this.nodeType !== 1) return
                if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
                else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
            })
        },
        removeAttr: function (name) {
            return this.each(function () {
                this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                    setAttribute(this, attribute)
                }, this)
            })
        },
        prop: function (name, value) {
            name = propMap[name] || name
            return (1 in arguments) ? this.each(function (idx) {
                this[name] = funcArg(this, value, idx, this[name])
            }) : (this[0] && this[0][name])
        },
        data: function (name, value) {
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

            var data = (1 in arguments) ? this.attr(attrName, value) : this.attr(attrName)

            return data !== null ? deserializeValue(data) : undefined
        },
        val: function (value) {
            return 0 in arguments ? this.each(function (idx) {
                this.value = funcArg(this, value, idx, this.value)
            }) : (this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function () {
                return this.selected
            }).pluck('value') : this[0].value))
        },
        offset: function (coordinates) {
            if (coordinates) return this.each(function (index) {
                var $this = $(this),
                    coords = funcArg(this, coordinates, index, $this.offset()),
                    parentOffset = $this.offsetParent().offset(),
                    props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    }

                if ($this.css('position') == 'static') props['position'] = 'relative'
                $this.css(props)
            })
            if (!this.length) return null
            var obj = this[0].getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        },
        css: function (property, value) {
            if (arguments.length < 2) {
                var computedStyle, element = this[0]
                if (!element) return
                computedStyle = getComputedStyle(element, '')
                if (typeof property == 'string') return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
                else if (isArray(property)) {
                    var props = {}
                    $.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                    })
                    return props
                }
            }

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0) this.each(function () {
                    this.style.removeProperty(dasherize(property))
                })
                else css = dasherize(property) + ":" + maybeAddPx(property, value)
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0) this.each(function () {
                        this.style.removeProperty(dasherize(key))
                    })
                    else css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
            }

            return this.each(function () {
                this.style.cssText += ';' + css
            })
        },
        index: function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass: function (name) {
            if (!name) return false
            return emptyArray.some.call(this, function (el) {
                return this.test(className(el))
            }, classRE(name))
        },
        addClass: function (name) {
            if (!name) return this
            return this.each(function (idx) {
                if (!('className' in this)) return
                classList = []
                var cls = className(this),
                    newName = funcArg(this, name, idx, cls)
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass)
                }, this)
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
            })
        },
        removeClass: function (name) {
            return this.each(function (idx) {
                if (!('className' in this)) return
                if (name === undefined) return className(this, '')
                classList = className(this)
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            })
        },
        toggleClass: function (name, when) {
            if (!name) return this
            return this.each(function (idx) {
                var $this = $(this),
                    names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass)
                })
            })
        },
        scrollTop: function (value) {
            if (!this.length) return
            var hasScrollTop = 'scrollTop' in this[0]
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
            return this.each(hasScrollTop ? function () {
                this.scrollTop = value
            } : function () {
                this.scrollTo(this.scrollX, value)
            })
        },
        scrollLeft: function (value) {
            if (!this.length) return
            var hasScrollLeft = 'scrollLeft' in this[0]
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
            return this.each(hasScrollLeft ? function () {
                this.scrollLeft = value
            } : function () {
                this.scrollTo(value, this.scrollY)
            })
        },
        position: function () {
            if (!this.length) return

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : offsetParent.offset()

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0
            offset.left -= parseFloat($(elem).css('margin-left')) || 0

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent
                return parent
            })
        }
    }

    // for now
    $.fn.detach = $.fn.remove

        // Generate the `width` and `height` functions
    ;
    ['width', 'height'].forEach(function (dimension) {
        var dimensionProperty = dimension.replace(/./, function (m) {
            return m[0].toUpperCase()
        })

        $.fn[dimension] = function (value) {
            var offset, el = this[0]
            if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : (offset = this.offset()) && offset[dimension]
            else return this.each(function (idx) {
                el = $(this)
                el.css(dimension, funcArg(this, value, idx, el[dimension]()))
            })
        }
    })

    function traverseNode(node, fun) {
        fun(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function () {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function (arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg)
                }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function (_, target) {
                parent = inside ? target : target.parentNode

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null

                var parentInDocument = $.contains(document.documentElement, parent)

                nodes.forEach(function (node) {
                    if (copyByClone) node = node.cloneNode(true)
                    else if (!parent) return $(node).remove()

                    parent.insertBefore(node, target)
                    if (parentInDocument) traverseNode(node, function (el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) window['eval'].call(window, el.innerHTML)
                    })
                })
            })
        }

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this)
            return this
        }
    })

    zepto.Z.prototype = $.fn

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq
    zepto.deserializeValue = deserializeValue
    $.zepto = zepto

    return $
})()

window.Zepto = Zepto

;
(function ($) {
    var _zid = 1,
        undefined,
        slice = Array.prototype.slice,
        isFunction = $.isFunction,
        isString = function (obj) {
            return typeof obj == 'string'
        },
        handlers = {},
        specialEvents = {},
        focusinSupported = 'onfocusin' in window,
        focus = {
            focus: 'focusin',
            blur: 'focusout'
        },
        hover = {
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }

    function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function (handler) {
            return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector)
        })
    }

    function parse(event) {
        var parts = ('' + event).split('.')
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        }
    }

    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture(handler, captureSetting) {
        return handler.del && (!focusinSupported && (handler.e in focus)) || !!captureSetting
    }

    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add(element, events, fn, data, selector, delegator, capture) {
        var id = zid(element),
            set = (handlers[id] || (handlers[id] = []))
        events.split(/\s/).forEach(function (event) {
            if (event == 'ready') return $(document).ready(fn)
            var handler = parse(event)
            handler.fn = fn
            handler.sel = selector
            // emulate mouseenter, mouseleave
            if (handler.e in hover) fn = function (e) {
                var related = e.relatedTarget
                if (!related || (related !== this && !$.contains(this, related))) return handler.fn.apply(this, arguments)
            }
            handler.del = delegator
            var callback = delegator || fn
            handler.proxy = function (e) {
                e = compatible(e)
                if (e.isImmediatePropagationStopped()) return
                e.data = data
                var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
                if (result === false) e.preventDefault(),
                    e.stopPropagation()
                return result
            }
            handler.i = set.length
            set.push(handler)
            if ('addEventListener' in element) element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        })
    }

    function remove(element, events, fn, selector, capture) {
        var id = zid(element);
        (events || '').split(/\s/).forEach(function (event) {
            findHandlers(element, event, fn, selector).forEach(function (handler) {
                delete handlers[id][handler.i]
                if ('removeEventListener' in element) element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            })
        })
    }

    $.event = {
        add: add,
        remove: remove
    }

    $.proxy = function (fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function () {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments)
            }
            proxyFn._zid = zid(fn)
            return proxyFn
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return $.proxy.apply(null, args)
            } else {
                return $.proxy(fn[context], fn)
            }
        } else {
            throw new TypeError("expected function")
        }
    }

    $.fn.bind = function (event, data, callback) {
        return this.on(event, data, callback)
    }
    $.fn.unbind = function (event, callback) {
        return this.off(event, callback)
    }
    $.fn.one = function (event, selector, data, callback) {
        return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function () {
            return true
        },
        returnFalse = function () {
            return false
        },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        }

    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event)

            $.each(eventMethods, function (name, predicate) {
                var sourceMethod = source[name]
                event[name] = function () {
                    this[predicate] = returnTrue
                    return sourceMethod && sourceMethod.apply(source, arguments)
                }
                event[predicate] = returnFalse
            })

            if (source.defaultPrevented !== undefined ? source.defaultPrevented : 'returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault()) event.isDefaultPrevented = returnTrue
        }
        return event
    }

    function createProxy(event) {
        var key, proxy = {
            originalEvent: event
        }
        for (key in event)
            if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        return compatible(proxy, event)
    }

    $.fn.delegate = function (selector, event, callback) {
        return this.on(event, selector, callback)
    }
    $.fn.undelegate = function (selector, event, callback) {
        return this.off(event, selector, callback)
    }

    $.fn.live = function (event, callback) {
        $(document.body).delegate(this.selector, event, callback)
        return this
    }
    $.fn.die = function (event, callback) {
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    $.fn.on = function (event, selector, data, callback, one) {
        var autoRemove, delegator, $this = this
        if (event && !isString(event)) {
            $.each(event, function (type, fn) {
                $this.on(type, selector, data, fn, one)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false) callback = data, data = selector, selector = undefined
        if (isFunction(data) || data === false) callback = data, data = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function (_, element) {
            if (one) autoRemove = function (e) {
                remove(element, e.type, callback)
                return callback.apply(this, arguments)
            }

            if (selector) delegator = function (e) {
                var evt, match = $(e.target).closest(selector, element).get(0)
                if (match && match !== element) {
                    evt = $.extend(createProxy(e), {
                        currentTarget: match,
                        liveFired: element
                    })
                    return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                }
            }

            add(element, event, callback, data, selector, delegator || autoRemove)
        })
    }
    $.fn.off = function (event, selector, callback) {
        var $this = this
        if (event && !isString(event)) {
            $.each(event, function (type, fn) {
                $this.off(type, selector, fn)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false) callback = selector, selector = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function () {
            remove(this, event, callback, selector)
        })
    }

    $.fn.trigger = function (event, args) {
        event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
        event._args = args
        return this.each(function () {
            // handle focus(), blur() by calling them directly
            if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
            // items in the collection might not be DOM elements
            else if ('dispatchEvent' in this) this.dispatchEvent(event)
            else $(this).triggerHandler(event, args)
        })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function (event, args) {
        var e, result
        this.each(function (i, element) {
            e = createProxy(isString(event) ? $.Event(event) : event)
            e._args = args
            e.target = element
            $.each(findHandlers(element, event.type || event), function (i, handler) {
                result = handler.proxy(e)
                if (e.isImmediatePropagationStopped()) return false
            })
        })
        return result
    }

        // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout focus blur load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select keydown keypress keyup error').split(' ').forEach(function (event) {
        $.fn[event] = function (callback) {
            return (0 in arguments) ? this.bind(event, callback) : this.trigger(event)
        }
    })

    $.Event = function (type, props) {
        if (!isString(type)) props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = true
        if (props) for (var name in props)(name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true)
        return compatible(event)
    }

})(Zepto)

;
(function ($) {
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/,
        originAnchor = document.createElement('a')

    originAnchor.href = window.location.href

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        var event = $.Event(eventName)
        $(context).trigger(event, data)
        return !event.isDefaultPrevented()
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart(settings) {
        if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings, deferred) {
        var context = settings.context,
            status = 'success'
        settings.success.call(context, data, status, xhr)
        if (deferred) deferred.resolveWith(context, [data, status, xhr])
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }

    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings, deferred) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        if (deferred) deferred.rejectWith(context, [xhr, type, error])
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
        ajaxComplete(type, xhr, settings)
    }

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {
    }

    $.ajaxJSONP = function (options, deferred) {
        if (!('type' in options)) return $.ajax(options)

        var _callbackName = options.jsonpCallback,
            callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script'),
            originalCallback = window[callbackName],
            responseData,
            abort = function (errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
            },
            xhr = {
                abort: abort
            }, abortTimeout

        if (deferred) deferred.promise(xhr)

        $(script).on('load error', function (e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()

            if (e.type == 'error' || !responseData) {
                ajaxError(null, errorType || 'error', xhr, options, deferred)
            } else {
                ajaxSuccess(responseData[0], xhr, options, deferred)
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback)) originalCallback(responseData[0])

            originalCallback = responseData = undefined
        })

        if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return xhr
        }

        window[callbackName] = function () {
            responseData = arguments
        }

        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
        document.head.appendChild(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            abort('timeout')
        }, options.timeout)

        return xhr
    }

    $.ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        // IIS returns Javascript as "application/x-javascript"
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0]
        return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text'
    }

    function appendQuery(url, query) {
        if (query == '') return url
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (options.processData && options.data && $.type(options.data) != "string") options.data = $.param(options.data, options.traditional)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data), options.data = undefined
    }

    $.ajax = function (options) {
        var settings = $.extend({}, options || {}),
            deferred = $.Deferred && $.Deferred(),
            urlAnchor
        for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) {
            urlAnchor = document.createElement('a')
            urlAnchor.href = settings.url
            urlAnchor.href = urlAnchor.href
            settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
        }

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)

        var dataType = settings.dataType,
            hasPlaceholder = /\?.+=\?/.test(settings.url)
        if (hasPlaceholder) dataType = 'jsonp'

        if (settings.cache === false || (
            (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType))) settings.url = appendQuery(settings.url, '_=' + Date.now())

        if ('jsonp' == dataType) {
            if (!hasPlaceholder) settings.url = appendQuery(settings.url,
                settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
            return $.ajaxJSONP(settings, deferred)
        }

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value]
            },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = xhr.setRequestHeader,
            abortTimeout

        if (deferred) deferred.promise(xhr)

        if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
        setHeader('Accept', mime || '*/*')
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

        if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
        xhr.setRequestHeader = setHeader

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script')(1, eval)(result)
                        else if (dataType == 'xml') result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
                    else ajaxSuccess(result, xhr, settings, deferred)
                } else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                }
            }
        }

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            ajaxError(null, 'abort', xhr, settings, deferred)
            return xhr
        }

        if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async, settings.username, settings.password)

        for (name in headers) nativeSetHeader.apply(xhr, headers[name])

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings, deferred)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(data)) dataType = success, success = data, data = undefined
        if (!$.isFunction(success)) dataType = success, success = undefined
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        }
    }

    $.get = function (/* url, data, success, dataType */) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function (/* url, data, success, dataType */) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function (/* url, data, success */) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    $.fn.load = function (url, data, success) {
        if (!this.length) return this
        var self = this,
            parts = url.split(/\s/),
            selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.success = function (response) {
            self.html(selector ? $('<div>').html(response.replace(rscript, "")).find(selector) : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var type, array = $.isArray(obj),
            hash = $.isPlainObject(obj)
        $.each(obj, function (key, value) {
            type = $.type(value)
            if (scope) key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
            // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
            // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object")) serialize(params, value, traditional, key)
            else params.add(key, value)
        })
    }

    $.param = function (obj, traditional) {
        var params = []
        params.add = function (key, value) {
            if ($.isFunction(value)) value = value()
            if (value == null) value = ""
            this.push(escape(key) + '=' + escape(value))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }
})(Zepto)

;
(function ($) {
    $.fn.serializeArray = function () {
        var name, type, result = [],
            add = function (value) {
                if (value.forEach) return value.forEach(add)
                result.push({
                    name: name,
                    value: value
                })
            }
        if (this[0]) $.each(this[0].elements, function (_, field) {
            type = field.type, name = field.name
            if (name && field.nodeName.toLowerCase() != 'fieldset' && !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' && ((type != 'radio' && type != 'checkbox') || field.checked)) add($(field).val())
        })
        return result
    }

    $.fn.serialize = function () {
        var result = []
        this.serializeArray().forEach(function (elm) {
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    $.fn.submit = function (callback) {
        if (0 in arguments) this.bind('submit', callback)
        else if (this.length) {
            var event = $.Event('submit')
            this.eq(0).trigger(event)
            if (!event.isDefaultPrevented()) this.get(0).submit()
        }
        return this
    }

})(Zepto)

;
(function ($) {
    // __proto__ doesn't exist on IE<11, so redefine
    // the Z function to use object extension instead
    if (!('__proto__' in {})) {
        $.extend($.zepto, {
            Z: function (dom, selector) {
                dom = dom || []
                $.extend(dom, $.fn)
                dom.selector = selector || ''
                dom.__Z = true
                return dom
            },
            // this is a kludge but works
            isZ: function (object) {
                return $.type(object) === 'array' && '__Z' in object
            }
        })
    }

    // getComputedStyle shouldn't freak out when called
    // without a valid element as argument
    try {
        getComputedStyle(undefined)
    } catch (e) {
        var nativeGetComputedStyle = getComputedStyle;
        window.getComputedStyle = function (element) {
            try {
                return nativeGetComputedStyle(element)
            } catch (e) {
                return null
            }
        }
    }
})(Zepto);


var ja_jp_pd = {
    "SYSTEM_0": "CN",
    "SYSTEM_1": "EN",
    "PATH": "en-us",
    "POSTER": "../images/poster.jpg",
    "editorLang": "en",
    "lang_0": "UMU",
    "lang_1": "セッションに参加",
    "lang_1111": "言語",
    "lang_2": "UMU",
    "lang_3": "<p>スマホから参加できる討論や投票を、即座にプレゼンスクリーンへ反映。</p><p>講座や研修がよりインタラクティブで創造的な場へ生まれ変わります。",
    "lang_4": "新規登録",
    "lang_5": "ログイン",
    "lang_6": "",
    "lang_7": "1分でわかるUMU",
    "lang_8": "<h2>インターネットとセッションの高度な融合</h2> <p>UMUがその場にいるすべての人をつなぎ</p> <p>講演者と聴衆の壁を取り払います。</p>",
    "lang_9": "images/guide.png",
    "lang_10": "<li>たった3分で<br>イベントを作成</li> <li>アプリいらず<br>スマホ1つで直接参加</li> <li>リアルタイムで<br>フィードバックをグラフィック化</li> <li>データを蓄積<br>セッションの持続的な最適化を実現</li>",
    "lang_11": "実用的ですばらしい機能があなたを待っています",
    "lang_12": "動画でUMUを体験してみましょう",
    "lang_13": "images/guide/1.png",
    "lang_14": "1クリックでイベントの作成",
    "lang_15": "［加号图片］で多様なセッションを選べます",
    "lang_16": "images/guide/2.png",
    "lang_17": "イベントの集中管理",
    "lang_18": "講演者は現場の進行状況に基づいてセッションをいつでも起動し、クリックでセッション結果を大スクリーンに表示できます",
    "lang_19": "images/guide/3.png",
    "lang_20": "参加者の招待",
    "lang_21": "参加者はスマホブラウザからumu.coでセッション番号を入力するだけで、すべてのセッションに参加できます。",
    "lang_22": "images/guide/4.png",
    "lang_23": "セッション内容をすぐに表示",
    "lang_24": "セッション結果を即時にグラフィック化、その場でスクリーンに表示。相互交流をさらに美しくわかりやすい形で実現しましょう",
    "lang_25": "images/guide/5.png",
    "lang_26": "ビッグデータの提示",
    "lang_27": "セッション終了後はデータの出力が可能。データの中長期的な統計と分析ツールとしても活用できます。",
    "lang_28": "images/guide/6.png",
    "lang_29": "UMUアプリ",
    "lang_30": "UMUのスマホアプリから、いつでもどこでもイベントを作成、編集可能。またイベント現場で，様々なセッションをリアルタイムに把握や操作することができます。",
    "lang_31": " ATD人材育成国際会議2015～2017公式パートナー",
    "lang_32": "",
    "lang_33": "images/partner.png",
    "lang_34": "企業ユーザーのご利用にも迅速に対応させていただきます",
    "lang_35": "<p class=\"intro\">UMUはインターネット技術を通じて新たなインタラクティブ体験を提供すると同時に、企業研修や連続講義などのあり方を刷新します。もし企業ユーザーの方で技術サポートが必要な場合は、以下の資料を記入してください。</p>",
    "lang_36": "技術サポートの予約",
    "lang_37": "UMUへようこそ",
    "lang_38": "今すぐUMUでインターネットによる研修改革をリードしましょう",
    "lang_39": "アカウント作成",
    "lang_40": "<li><a href=\"/model/static#about-us\">UMAについて</a></li> <li><a href=\"/model/static#termcondition\">利用規約</a></li> <li><a href=\"mailto:support@umu.com\">ご連絡はこちら</a></li>",
    "lang_41": "Copyright (C) 2015 UMU CO.,LTD. All Rights Reserved.",
    "lang_42": "ユーザー名",
    "lang_43": "パスワード",
    "lang_44": "ログイン情報の保存",
    "lang_45": "パスワードをお忘れの場合は",
    "lang_46": "パスワードの回復",
    "lang_47": "ログイン",
    "lang_48": "アカウント作成",
    "lang_49": "閉じる",
    "lang_50": "メールアドレスの入力",
    "lang_51": "パスワードの作成",
    "lang_52": "6～16字のパスワードを設定してください。大文字・小文字を区別します",
    "lang_53": "パスワードをもう一度入力してください",
    "lang_54": "アカウント作成と同時にUMU利用規約に同意したことになります",
    "lang_55": "UMU利用規約",
    "lang_56": "新規登録",
    "lang_57": "ログイン",
    "lang_58": "技術サポートの予約",
    "lang_59": "イベントの種類",
    "lang_60": "およその参加人数",
    "lang_61": "毎月の平均開催数",
    "lang_62": "あなたのお名前",
    "lang_63": "スタッフからのご連絡のため、正しいお名前を記入してください",
    "lang_64": "電話番号",
    "lang_65": "電話番号を入力してください",
    "lang_66": "メールアドレス",
    "lang_67": "メールアドレスを入力してください",
    "lang_68": "",
    "lang_69": "イベントの予約",
    "lang_70": "アカウントに登録したメールアドレスを入力してください、パスワード再設定メールを送信します",
    "lang_71": "メールアドレスを入力してください",
    "lang_72": "パスワードの設定が完了しました",
    "lang_73": "正しいメールアドレスを入力してください",
    "lang_74": "パスワード再設定メールを送信しました",
    "lang_75": "パスワード再設定メールを送信",
    "lang_76": "安全性：弱",
    "lang_77": "安全性：中",
    "lang_78": "安全性：強",
    "lang_79": "つのセッション",
    "lang_80": "コントロールパネル",
    "lang_81": "今日のイベント",
    "lang_82": "今すぐセッションを作成",
    "lang_83": "images/guide.png",
    "lang_84": "<li>たった3分で<br>イベントを作成</li> <li>アプリいらず<br>スマホ1つで直接参加</li> <li>リアルタイムで<br>フィードバックをグラフィック化</li> <li>データを蓄積<br>セッションの持続的な最適化を実現</li>",
    "lang_85": "初めてのUMU",
    "lang_86": "人",
    "lang_8611": "人",
    "lang_87": "人",
    "lang_8711": "人",
    "lang_88": "日",
    "lang_89": "日",
    "lang_90": "今日のイベント",
    "lang_91": "もっと見る",
    "lang_92": "よりよい明日のために準備しましょう",
    "lang_93": "編集",
    "lang_94": "今後のイベント",
    "lang_95": "クリック",
    "lang_96": "イベントの新規作成",
    "lang_97": "過去のイベント",
    "lang_98": "過去のイベントが3回分表示されます",
    "lang_99": "レポートを見る",
    "lang_100": "回答人数",
    "lang_101": "全体人数",
    "lang_102": "参加率",
    "lang_103": "プロフィール",
    "lang_104": "完了したイベント",
    "lang_105": "訪れた場所",
    "lang_106": "参加人数",
    "lang_107": "イベントカレンダー",
    "lang_108": "トップ",
    "lang_109": "イベント管理",
    "lang_110": "フォーム管理",
    "lang_111": "アップグレード",
    "lang_112": "友達を招待",
    "lang_113": "アプリダウンロード",
    "lang_114": "ヘルプ",
    "lang_115": "あなたのセッション番号",
    "lang_116": "スマホブラウザからセッションに参加：",
    "lang_117": "講師ログイン：",
    "lang_118": "マイページ",
    "lang_119": "ログアウト",
    "lang_120": "今日の予定に戻る",
    "lang_121": "すでに使用されています",
    "lang_122": "更新",
    "lang_123": "コントロールパネル",
    "lang_124": "コラボレーション",
    "lang_125": "コピー",
    "lang_1251": "イベントレポート",
    "lang_126": "削除",
    "lang_127": "参加予定",
    "lang_128": "現参加",
    "lang_129": "アンケートを追加",
    "lang_130": "質問を追加",
    "lang_131": "討論を追加",
    "lang_132": "写真",
    "lang_133": "ミニゲームを追加",
    "lang_134": "出席シートを追加",
    "lang_135": "フォームを使用",
    "lang_136": "コントロールパネルのアドレス",
    "lang_137": "アドレスをコピー",
    "lang_138": "＊上記のアドレスはスタッフが使用します",
    "lang_139": "新しいイベントを作成",
    "lang_140": "イベントの編集",
    "lang_141": "完了",
    "lang_1411": "保存中...",
    "lang_142": "キャンセル",
    "lang_143": "イベントの種類",
    "lang_144": "イベントの性質",
    "lang_145": "場所",
    "lang_146": "備考",
    "lang_147": "担当者",
    "lang_148": "開催時間",
    "lang_149": "アンケート",
    "lang_150": "質問",
    "lang_151": "討論",
    "lang_152": "写真",
    "lang_153": "ミニゲーム",
    "lang_154": "出席シート",
    "lang_155": "フォーム",
    "lang_156": "さまざまな質問を設定し、参加者はモバイル端末からセッションに参加",
    "lang_157": "質問を設定し、学生の疑問をキャッチしましょう",
    "lang_158": "討論のトピックを設定し、学生の発言を促しましょう",
    "lang_159": "手書きメモをすぐにスクリーンでシェアできます",
    "lang_160": "4つのミニゲームで対戦、高スコア上位者をスクリーンで発表",
    "lang_161": "参加者の情報を把握できる多彩な質問を設定できます",
    "lang_162": "フォームから直接セッションを追加できます",
    "lang_163": "イベントをみんなでシェアしよう",
    "lang_164": "方法１",
    "lang_165": "このURLをメールやウェブでシェアすることで他の人を招待できます。",
    "lang_166": "方法２",
    "lang_167": "このQRコードをスキャンすることでSNSにシェアできます",
    "lang_168": "方法３",
    "lang_169": "１クリックでソーシャルメディアにシェアできます",
    "lang_170": "ここに移動する",
    "lang_171": "キャンセル",
    "lang_172": "ここにコピーする",
    "lang_173": "入力",
    "lang_174": "内容",
    "lang_175": "移動",
    "lang_176": "質問",
    "lang_177": "アンケートの結果を表示",
    "lang_178": "参加者がスマホブラウザで回答した後、統計結果が表示されます。",
    "lang_179": "このイベントのタイトル",
    "lang_180": "このイベントのタイトル",
    "lang_181": "シェア",
    "lang_182": "アクティベート",
    "lang_183": "アクティベート",
    "lang_184": "プレゼン",
    "lang_185": "データ",
    "lang_186": "削除",
    "lang_187": "フォーム",
    "lang_188": "次の一枚",
    "lang_189": "前の一枚",
    "lang_190": "写真のダウンロード",
    "lang_191": "このフォームにはまだ写真がありません",
    "lang_192": "すべての発言を見る",
    "lang_193": "このフォームにはまだ内容がありません",
    "lang_194": "すべての出席シートをダウンロードする",
    "lang_1941": "データ",
    "lang_195": "全て見る",
    "lang_196": "保存済フォーム",
    "lang_197": "フォーム",
    "lang_198": "確定",
    "lang_199": "質問内容を入力してください",
    "lang_200": "セッション名を入力してください",
    "lang_201": "つのセッション",
    "lang_202": "セッション",
    "lang_203": "システムは",
    "lang_204": "秒",
    "lang_205": "後にトップページへ戻ります",
    "lang_206": "トップページへ戻る",
    "lang_207": "研修",
    "lang_208": "講義",
    "lang_209": "講演",
    "lang_210": "会議",
    "lang_211": "活動",
    "lang_212": "その他",
    "lang_213": "内部研修",
    "lang_214": "公開研修",
    "lang_215": "内部講演",
    "lang_216": "公開講演",
    "lang_217": "内部会議",
    "lang_218": "公開会議",
    "lang_219": "内部活動",
    "lang_220": "公開活動",
    "lang_221": "保存されていないイベントがあります、設定ページにもどりますか？「キャンセル」を選んだ場合は元の操作を続けます。",
    "lang_222": "このイベントにはまだセッションが設定されていないので、コントロールパネルに入れません。",
    "lang_223": "単一回答",
    "lang_224": "複数回答",
    "lang_225": "自由回答",
    "lang_226": "移動できません",
    "lang_227": "メールアドレスを入力してください",
    "lang_228": "6～16字のパスワードを入力してください",
    "lang_229": "到",
    "lang_230": "之间的有效字符",
    "lang_231": "入力されたパスワードが一致していません",
    "lang_232": "アカウントに登録したメールアドレスを入力してください",
    "lang_233": "あなたの名前を入力してください",
    "lang_234": "電話番号を入力してください",
    "lang_235": "30人以下",
    "lang_236": "50～100人",
    "lang_237": "30～50人",
    "lang_238": "100人以上",
    "lang_239": "12回以下",
    "lang_240": "50～100回",
    "lang_241": "12～50回",
    "lang_242": "100回以上",
    "lang_243": "プロトレーナー",
    "lang_244": "内部講師",
    "lang_245": "人事コンサル",
    "lang_246": "大学教員",
    "lang_247": "研修機構スタッフ",
    "lang_248": "展覧機構スタッフ",
    "lang_249": "企業管理者",
    "lang_250": "会社員",
    "lang_251": "学生",
    "lang_2511": "講師",
    "lang_252": "教育",
    "lang_253": "少人数会議",
    "lang_254": "大人数会議",
    "lang_255": "グループ活動",
    "lang_256": "無料",
    "lang_257": "３か月版",
    "lang_258": "１年版",
    "lang_259": "３年版",
    "lang_260": "５年版",
    "lang_261": "保存済フォーム",
    "lang_262": "UMUフォーム",
    "lang_263": "概要",
    "lang_264": "招待方法",
    "lang_2641": "招待方法",
    "lang_265": "送信済みの招待",
    "lang_266": "シェアキャンペーン",
    "lang_267": "さらに多くの人とUMUセッション体験をシェアしましょう！あなたの紹介で新規ユーザーが有料版（３か月版を除く）または企業版を購入された場合、あなたに75日分の有料版使用期間が贈られます。",
    "lang_268": "<span>方法１</span>招待リンクをシェアする",
    "lang_269": "Facebookにシェアする",
    "lang_270": "Twitterにシェアする",
    "lang_271": "Lineにシェアする",
    "lang_272": "<span>方法２</span>招待コードをシェアする",
    "lang_273": "あなたの招待コード：",
    "lang_274": "招待された人は登録時に招待コードを入力する必要があります",
    "lang_275": "<span>方法３</span>招待メールを送る",
    "lang_276": "招待する人のアドレスを入力、複数のアドレスはスペースで区切ってください",
    "lang_277": "送信",
    "lang_278": "招待メールを以下のアドレスに送信しました：",
    "lang_279": "送信日時",
    "lang_280": "招待完了",
    "lang_281": "招待日時",
    "lang_282": "アカウントタイプ",
    "lang_283": "キャンペーン有料版試用日数",
    "lang_284": "招待リンクのコピー完了",
    "lang_285": "メールアドレスを入力してください",
    "lang_286": "スマホから参加できる討論や投票を、即座にプレゼンスクリーンへ反映　講座や研修がよりインタラクティブで創造的な場へ生まれ変わります。 沈黙のスパイラルを破り、意見をまとめよう　UMUの動画で全く新しい体験をみてみよう セッションをスピーディに作成　UMUがその場にいるすべての人をつなぎ、講演者と聴衆の壁を取り払います　たった3分でイベントを作成　アプリいらず、スマホ1つで直接参加　リアルタイムでフィードバックをグラフィック化　データの蓄積でセッションの持続的な最適化を実現…",
    "lang_287": "アカウント",
    "lang_288": "個人情報",
    "lang_289": "セキュリティ",
    "lang_290": "セッション番号",
    "lang_291": "アカウントタイプ",
    "lang_292": "UMU有料版へアップグレード",
    "lang_293": "使用期限",
    "lang_294": "このアカウントは",
    "lang_295": "まで有効です",
    "lang_296": "登録時間",
    "lang_297": "プロフィール",
    "lang_298": "私の職業",
    "lang_299": "使い方",
    "lang_300": "電話番号",
    "lang_301": "地域",
    "lang_302": "住所",
    "lang_303": "郵便番号",
    "lang_304": "自己紹介",
    "lang_305": "名前",
    "lang_306": "よりよい製品体験のため、正しい名前を入力してください",
    "lang_307": "電話番号",
    "lang_308": "携帯番号を入力してください",
    "lang_309": "郵便番号",
    "lang_310": "郵便番号を入力してください",
    "lang_311": "住所を入力してください",
    "lang_312": "プロフィールを書いて、もっとたくさんの人に知ってもらいましょう",
    "lang_313": "パスワード",
    "lang_314": "パスワード変更",
    "lang_315": "元のパスワードを入力してください",
    "lang_316": "新しいパスワードを入力してください",
    "lang_317": "新しいパスワードを再入力してください",
    "lang_318": "変更の確認",
    "lang_319": "UMU スマホアプリ",
    "lang_320": " App Store または Google Store で「UMU」を検索、最新版のUMUアプリをダウンロードしましょう",
    "lang_321": "iOS版ダウンロード",
    "lang_322": "スマホで左のQRコードをスキャンしてダウンロードも可能です",
    "lang_323": "コントロールパネル",
    "lang_324": "処理中...",
    "lang_325": "完了",
    "lang_326": "未完了",
    "lang_327": "アクティベート",
    "lang_328": "スクリーン表示",
    "lang_329": "再表示",
    "lang_330": "セッション",
    "lang_331": "写真数",
    "lang_3311": "写真数",
    "lang_332": "提出人数",
    "lang_3321": "提出人数",
    "lang_333": "全体人数",
    "lang_3331": "全体人数",
    "lang_334": "参加率",
    "lang_335": "チェック待ち",
    "lang_336": "承認済み",
    "lang_337": "却下済み",
    "lang_338": "却下",
    "lang_339": "承認",
    "lang_340": "却下の取り消し",
    "lang_341": "まとめて承認",
    "lang_342": "まとめて却下",
    "lang_343": "コメント",
    "lang_344": "コメント",
    "lang_345": "職業を選択してください",
    "lang_346": "使用場面を選択してください",
    "lang_347": "名前を入力してください",
    "lang_348": "電話番号を入力してください",
    "lang_349": "4～8桁の数字を入力してください",
    "lang_350": "問題について詳細に記入してください",
    "lang_351": "連絡先を記入してください",
    "lang_352": "送信が完了しました。ご協力に感謝いたします",
    "lang_353": "アクセス中にエラーが発生しました",
    "lang_354": "プランを選んでください",
    "lang_355": "決済方法を選んでください",
    "lang_356": "正しい認証番号を入力してください",
    "lang_357": "UMU利用規約をお読みの上、同意をお願いいたします。",
    "lang_358": "無料版",
    "lang_359": "有料版",
    "lang_3591": "体験版",
    "lang_360": "企業版",
    "lang_361": "入力されたパスワードが一致していません",
    "lang_362": "パスワードの変更が完了しました",
    "lang_363": "全画面表示",
    "lang_364": "全画面表示キャンセル",
    "lang_365": "lang_365",
    "lang_366": "lang_366",
    "lang_367": "このフォームを削除しますか？",
    "lang_368": "データのロード異常です。もう一度試してください",
    "lang_369": "移動できません",
    "lang_370": "３か月かそれ以上",
    "lang_371": "３年かそれ以上",
    "lang_372": "５年",
    "lang_373": "１月",
    "lang_374": "２月",
    "lang_375": "３月",
    "lang_376": "４月",
    "lang_377": "５月",
    "lang_378": "６月",
    "lang_379": "７月",
    "lang_380": "８月",
    "lang_381": "９月",
    "lang_382": "１０月",
    "lang_383": "１１月",
    "lang_384": "１２月",
    "lang_385": "サービス向上のご協力ありがとうございます",
    "lang_386": "あなたのご意見はUMUセッション体験のさらなる向上の鍵となります",
    "lang_387": "コメントやアドバイスをお願いいたします",
    "lang_388": "お名前と連絡先を記入してください",
    "lang_389": "電話連絡可",
    "lang_390": "フィードバックの送信",
    "lang_391": "日",
    "lang_392": "月",
    "lang_393": "火",
    "lang_394": "水",
    "lang_395": "木",
    "lang_396": "金",
    "lang_397": "土",
    "lang_398": "あと２ステップでUMUがご利用いただけます",
    "lang_399": "アカウント作成",
    "lang_400": "プロフィール作成",
    "lang_401": "セッション番号を選ぶ",
    "lang_402": "招待番号を入力してください",
    "lang_403": "次へ",
    "lang_404": "これで最後のステップです",
    "lang_405": "あなたのセッション番号の試用期間は３年です：",
    "lang_406": "使用説明：",
    "lang_407": "セッション番号は研修時に参加者がセッションに参加したときの番号です",
    "lang_408": "アカウント登録後、３年版セッション番号の試用期間（３１日間）が得られます。試用期間中にお支払いが完了すれば、正式に無期限使用が可能となります。",
    "lang_409": "もしも試用期間中にお支払いいただけなかった場合は、セッション番号は自動的に失効し、アカウントにはランダムの８桁番号が割り振られ、全機能を使用することはできません。",
    "lang_410": "いますぐ体験",
    "lang_411": "または",
    "lang_412": "お好みのセッション番号を選んでください",
    "lang_413": "４桁以上の数字を入力してください",
    "lang_414": "検索",
    "lang_415": "表示：",
    "lang_416": "限定せず",
    "lang_417": "３か月または１年",
    "lang_418": "今すぐ購入",
    "lang_419": "もう一度セッション番号を選んでください",
    "lang_420": "アカウントプラン",
    "lang_421": "３か月",
    "lang_422": "定価",
    "lang_423": "１年",
    "lang_424": "３年",
    "lang_425": "５年",
    "lang_426": "",
    "lang_427": "",
    "lang_428": "",
    "lang_429": "",
    "lang_430": "",
    "lang_431": "",
    "lang_432": "",
    "lang_433": "",
    "lang_434": "お支払い方法",
    "lang_435": "電子マネー",
    "lang_436": "クレジットカード",
    "lang_437": "認証コード",
    "lang_438": "右の認証コードを入力してください",
    "lang_439": "図を交換する",
    "lang_440": "利用規約",
    "lang_441": "同意",
    "lang_442": "UMU利用規約",
    "lang_443": "決済のキャンセル",
    "lang_444": "決済の確認",
    "lang_445": "いまのセッションは",
    "lang_446": "クリック",
    "lang_447": "で，スクリーン表示の色調を変更",
    "lang_448": "このページをプレゼンスクリーンにドラッグする",
    "lang_449": "プレゼンスクリーンにドラッグした後、右下の",
    "lang_450": "をクリックして全画面表示できます。またはUMUマークをクリックすることでも全画面表示できます。",
    "lang_451": "ページ右下の",
    "lang_452": "QRコードをクリックすることでQRコードがスクリーンにシェアされます。",
    "lang_453": "ペン型マウスでスクリーンにセッション結果を表示。左・右ダブルクリックで前・次のセッションが表示されます。キーボードのSPACEキーまたはページ上の「次へ」ボタンでもページ移動が可能です。",
    "lang_454": "次のページへ",
    "lang_455": "セッションを開始",
    "lang_456": "アドレスを入力",
    "lang_457": "セッション番号を入力",
    "lang_458": "イベントに参加",
    "lang_459": "イベントに参加",
    "lang_460": "参加人数",
    "lang_461": "<p>アンケートは終了しました</p><p>参加ありがとうございます</p> ",
    "lang_462": "使用時間",
    "lang_463": "参加人数",
    "lang_464": "<span class=\"logo\">UMU</span>",
    "lang_465": "すぐにアクセス",
    "lang_466": "さらに詳しく",
    "lang_467": "このセッションを終わる",
    "lang_468": "イベント名を入力してください",
    "lang_469": "内容を入力してください",
    "lang_470": "イベント名",
    "lang_471": "クライアント名",
    "lang_472": "参加人数",
    "lang_473": "開催場所",
    "lang_474": "プレゼンテーマ",
    "lang_475": "主催",
    "lang_476": "観客数",
    "lang_477": "開催場所",
    "lang_478": "会議テーマ",
    "lang_479": "参加人数",
    "lang_480": "会議の場所",
    "lang_481": "イベント名",
    "lang_482": "参加人数",
    "lang_483": "開催場所",
    "lang_484": "「確定」をクリック後、セッションが起動します。セッション起動後「プレゼン」をクリックすればスクリーンにセッション結果がグラフィック表示されます。",
    "lang_485": "このセッションをフォームとして保存する",
    "lang_486": "フォーム名",
    "lang_487": "フォームとして保存後、「フォーム管理」から編集可能",
    "lang_488": "フォーム名を入力してください",
    "lang_489": "フォーム追加完了",
    "lang_490": "本当にこのセッションデータを削除しますか？削除後はもとに戻せません",
    "lang_491": "非表示",
    "lang_492": "全表示",
    "lang_493": "オートチェック",
    "lang_494": "マニュアルチェック",
    "lang_495": "本当にこのセッションを削除しますか？",
    "lang_496": "本当にこの質問を削除しますか？",
    "lang_497": "質問を削除しました",
    "lang_498": "単一回答",
    "lang_499": "複数回答",
    "lang_500": "自由回答",
    "lang_501": "質問に関する説明を入力してください",
    "lang_5011": "内容を入力してください",
    "lang_502": "選択肢を入力してください。ENTERキーで次の選択肢へ",
    "lang_5021": "選択肢を入力してください。ENTERキーで次の選択肢へ",
    "lang_503": "コピー完了",
    "lang_504": "コピー完了",
    "lang_505": "全体人数",
    "lang_506": "回答人数",
    "lang_507": "ファインドザペア スコア",
    "lang_508": "ナンバースクランブル スコア",
    "lang_509": "スピードソート スコア",
    "lang_510": "メモリースルース スコア",
    "lang_511": "ランキング",
    "lang_512": "キーワードクラウド",
    "lang_513": "第",
    "lang_514": "招待コード",
    "lang_515": "トップへ戻る",
    "lang_516": "フィードバック",
    "lang_517": "本当にこのイベントを削除しますか？",
    "lang_518": "任意",
    "lang_519": "フォームを含む",
    "lang_520": "フォームを含む",
    "lang_521": "<p>UMUセッションの動作はGoogle Chromeに最適化されています。</p><p style=\"color:#999\">* IEで閲覧する場合、動作に不具合が発生する可能性があります。</p>",
    "lang_522": "http://dlsw.baidu.com/sw-search-sp/soft/9d/14744/ChromeStandalone_V42.0.2311.135_Setup.1430289688.exe",
    "lang_523": "参加者をUMUに招待し",
    "lang_524": "セッション番号を入力して",
    "lang_525": "、参加してもらおう",
    "lang_526": "基調色の切り替え",
    "lang_527": "QRコード",
    "lang_528": "前のページ",
    "lang_529": "次のページ",
    "lang_530": "前の問題",
    "lang_531": "次の問題",
    "lang_532": "スマホブラウザのアドレスバーに入力：",
    "lang_533": "このQRコードをスキャン",
    "lang_534": "http://umuvideo.qiniudn.com/UMU-1110-01.mp4",
    "lang_535": "１か月版(en专用)",
    "lang_536": "３か月版(en专用)",
    "lang_5366": "１年版(en专用)",
    "lang_5367": "３年版(en专用)",
    "lang_5368": "１か月または３か月版(en专用)",
    "lang_537": "名",
    "lang_538": "人",
    "lang_539": "../../view/help.dwt",
    "lang_540": "Google Chromeをダウンロード",
    "lang_541": "Android版アプリをダウンロード",
    "lang_542": "You have been redirected to ",
    "lang_5421": " for enhanced service in your area",
    "lang_543": "Go back ",
    "lang_544": "Stay here",
    "lang_545": "今月はまだイベント予定がありません。<br>左上の［加号图片］から新規作成できます。",
    "lang_546": "../../view/static/termcondition.html",
    "lang_547": "../../view/static/acceptable-use.html",
    "lang_548": "../../view/static/privacy-policy.html",
    "lang_549": "../../view/member.dwt",
    "lang_550": "パスワード変更",
    "lang_551": "images/logo_display_2.png",
    "lang_552": "../../view/static/about-us.dwt",
    "lang_553": "副本",
    "lang_554": "利用場面の選択",
    "lang_555": "すでに",
    "lang_556": "日間の使用期限があります",
    "lang_557": "使用期限",
    "lang_558": "UMU無料版では毎回のセッションにつき30人分までのデータが同時に利用可能です。もしセッション参加者数が30人を超えた場合は、超過部分データを閲覧、プレゼンまたはエクスポートすることができません。全てのデータ利用が必要な方は、UMU有料版または企業版へのアップグレードをお薦めします。<a href=\"/#/member\">アップグレード</a>",
    "lang_559": "参加人数を入力してください",
    "lang_560": "分",
    "lang_561": "匿名",
    "lang_562": "予約完了！スタッフが1日（週末、休日除）以内に連絡させていただきます。",
    "lang_563": "レポートのプレビュー",
    "lang_564": "レポート出力をしたいセッションデータを選択してください。",
    "lang_565": "今ご使用のUMUは無料版です。最多30人分のセッションデータが同時利用可能です。それ以上のデータ利用が必要な方は、UMU有料版または企業版へのアップグレードをお薦めします。",
    "lang_566": "スマホブラウザでアクセスし",
    "lang_567": "，セッション番号を入力",
    "lang_568": "，今すぐサインイン",
    "lang_569": "人がサインイン済",
    "lang_5691": "人がサインイン済",
    "lang_570": "データをPDF形式で出力する",
    "lang_571": "つの選択肢",
    "lang_572": "つの選択肢",
    "lang_573": "人が参加",
    "lang_574": "まだ保存済フォームがありません。「フォーム」からよく使うセッションを保存してください。",
    "lang_575": "images/23_52ab8d2.png",
    "lang_581": "",
    "lang_582": "../../view/static/spahelp.html",
    "lang_583": "../../view/static/spahelpandroid.html"
};


var zh_cn_pd = {
    "SYSTEM_0": "CN",
    "SYSTEM_1": "EN",
    "PATH": "zh-cn",
    "POSTER": "../images/poster.jpg",
    "editorLang": "zh-cn",
    "lang_0": "UMU互动平台",
    "lang_1": "加入现场互动",
    "lang_1111": "切换语言",
    "lang_2": "<span>UMU</span>创新互动平台",
    "lang_3": "<p>用手机随时组织投票与讨论，用大屏幕同步展示互动结果</p> <p>让移动互联网活跃培训课堂，让每个人融入、分享、收获</p>",
    "lang_4": "免费注册",
    "lang_5": "登录",
    "lang_6": "打破沉默的螺旋，汇聚观点的海洋",
    "lang_7": "UMU带您了解创意互动",
    "lang_8": "<h2>快速建立讲师与学员的互动</h2> <p>UMU助力培训现场移动互联化</p> <p>让每个学员融入课程，深度思考，充分表达</p>",
    "lang_9": "images/guide.png",
    "lang_10": "<li>仅3分钟<br>轻松创建一门课程</li> <li>无需app<br>拿起手机直接参与</li> <li>效果震撼<br>如幻灯片般流畅呈现</li> <li>数据留存<br>实现课程持续优化</li>",
    "lang_11": "精彩实用的功能期待您的体验",
    "lang_12": "观看视频，感受UMU带给您的视听新体验",
    "lang_13": "images/guide/1.png",
    "lang_14": "点击加号创建课程",
    "lang_15": "欢迎使用UMU，现在开始点击加号，<br>轻松创建一门课程",
    "lang_16": "images/guide/2.png",
    "lang_17": "激活互动环节",
    "lang_18": "控制现场互动的开关，激活后学员即可访问现场互动。<br>点击展示可以将结果在大屏幕展示",
    "lang_19": "images/guide/3.png",
    "lang_20": "通过手机浏览器参与互动",
    "lang_21": "邀请学员打开手机浏览器输入umu.cn，<br>输入互动号码即可",
    "lang_22": "images/guide/4.png",
    "lang_23": "大屏幕完美展现互动结果",
    "lang_24": "将大屏幕展示页拖动到投影仪屏幕，进入全屏模式，<br>等着大家说WOW吧",
    "lang_25": "images/guide/5.png",
    "lang_26": "大数据精彩呈现",
    "lang_27": "精彩课程结束后，数据报告即可导出，<br>课程有效数据实时展现",
    "lang_28": "images/guide/6.png",
    "lang_29": "UMU APP",
    "lang_30": "通过APP切换互动，查看实时进度和结果，<br>一切尽在掌握",
    "lang_31": "ATD2015年会全球十大合作伙伴",
    "lang_32": "<p>今天，UMU携手ATD，与AMA、DDI、肯·布兰特等全球顶级培训与发展公司一道，<br>成为全球最大的培训与发展学会ATD全球白金合作伙伴。</p>",
    "lang_33": "images/partner.png",
    "lang_34": "欢迎任何个人和企业预约演示",
    "lang_35": "<p class=\"intro\">UMU致力于通过移动互联网技术提升传统教育与培训的质量与体验，让讲师可以更好的与学员进行教学互动，让学员获得更好的学习体验和效率。填写相关资料即可预约产品演示</p>",
    "lang_36": "预约演示",
    "lang_37": "欢迎使用UMU",
    "lang_38": "现在就使用UMU，一起通过移动互联网引领培训行业的变革",
    "lang_39": "立即注册",
    "lang_40": "<li><a href=\"/model/static#about-us\">关于我们</a></li> <li><a href=\"/model/static#termcondition\">服务条款</a></li> <li><a href=\"mailto:support@umu.com\">联系我们</a></li>",
    "lang_41": "&copy;版权所有 2015 UMU Corporation. 保留一切权利.",
    "lang_42": "请输入用户名",
    "lang_43": "请输入密码",
    "lang_44": "一个月内自动登录",
    "lang_45": "忘记密码？",
    "lang_46": "立即找回",
    "lang_47": "立即登录",
    "lang_48": "没有账户，注册",
    "lang_49": "关闭",
    "lang_50": "请输入电子邮箱地址",
    "lang_51": "请设置密码",
    "lang_52": "请输入6-16位数字、字母或常用符号组成密码，字母区分大小写",
    "lang_53": "请再次输入密码",
    "lang_54": "点击注册即表明你同意",
    "lang_55": "本服务条款",
    "lang_56": "立即注册",
    "lang_57": "已有账户，登录",
    "lang_58": "欢迎您预约演示",
    "lang_59": "活动类型",
    "lang_60": "常见活动<br>人数",
    "lang_61": "每月场次",
    "lang_62": "您的称呼",
    "lang_63": "请填写您的真实姓名，方便我们的工作人员与您联系",
    "lang_64": "联系电话",
    "lang_65": "请填写您的电话号码",
    "lang_66": "电子邮箱",
    "lang_67": "请填写您的电子邮箱",
    "lang_68": "欢迎致电400-007-2121联络我们",
    "lang_69": "预约演示",
    "lang_70": "请输入您的用户名或注册电子邮箱。<br>您将收到一封确认邮件，可以重新设置密码。",
    "lang_71": "请输入您的用户名或电子邮箱",
    "lang_72": "密码设置成功",
    "lang_73": "邮箱格式不正确",
    "lang_74": "邮件已经发送到您的邮箱",
    "lang_75": "发送确认邮件",
    "lang_76": "弱",
    "lang_77": "中",
    "lang_78": "强",
    "lang_79": "个互动环节",
    "lang_80": "进入中控台",
    "lang_81": "今日课程",
    "lang_82": "快速建立讲师与学员之间的互动",
    "lang_83": "images/guide.png",
    "lang_84": "<li>仅3分钟<br>轻松创建一门课程</li> <li>无需app<br>拿起手机直接参与</li> <li>效果震撼<br>如幻灯片般流畅呈现</li> <li>数据留存<br>实现课程持续优化</li>",
    "lang_85": "新手指南",
    "lang_86": "人",
    "lang_8611": "人",
    "lang_87": "人",
    "lang_8711": "人",
    "lang_88": "天",
    "lang_89": "天",
    "lang_90": "今日的课程",
    "lang_91": "查看更多",
    "lang_92": "今天的充分准备是为了未来课程更加精彩",
    "lang_93": "编辑",
    "lang_94": "将来的课程",
    "lang_95": "请点击",
    "lang_96": "添加课程",
    "lang_97": "过去的课程",
    "lang_98": "最近完成的3门课程将会显示在这里",
    "lang_99": "查看报告",
    "lang_100": "提交人数",
    "lang_101": "全部人数",
    "lang_102": "参与百分比",
    "lang_103": "个人成就",
    "lang_104": "完成的课程",
    "lang_105": "去过的城市",
    "lang_106": "学员数量",
    "lang_107": "课程日历",
    "lang_108": "首页",
    "lang_109": "活动管理",
    "lang_110": "模板管理",
    "lang_111": "会员升级",
    "lang_112": "邀请",
    "lang_1121": "云盘",
    "lang_113": "APP下载",
    "lang_114": "帮助",
    "lang_115": "您的专属互动号码",
    "lang_116": "手机参与互动网址",
    "lang_117": "讲师后台访问网址",
    "lang_118": "个人中心",
    "lang_119": "退出账号",
    "lang_120": "回到今天",
    "lang_121": "已使用",
    "lang_122": "刷新",
    "lang_123": "中控台",
    "lang_124": "协作",
    "lang_125": "复制",
    "lang_1251": "报告",
    "lang_126": "删除",
    "lang_127": "预计",
    "lang_128": "最新统计",
    "lang_129": "添加问卷",
    "lang_130": "添加提问",
    "lang_131": "添加讨论",
    "lang_132": "拍照上墙",
    "lang_133": "添加游戏",
    "lang_134": "添加签到",
    "lang_135": "使用模板",
    "lang_136": "中控台地址",
    "lang_137": "复制链接",
    "lang_138": "注：以上网址供现场工作人员使用",
    "lang_139": "创建新活动",
    "lang_140": "编辑活动",
    "lang_141": "完成",
    "lang_1411": "课程保存中...",
    "lang_142": "放弃",
    "lang_143": "活动类型",
    "lang_144": "具体类型",
    "lang_145": "地区",
    "lang_146": "备注",
    "lang_147": "联系人",
    "lang_148": "起止时间",
    "lang_149": "问卷",
    "lang_150": "提问",
    "lang_151": "讨论",
    "lang_152": "拍照",
    "lang_153": "游戏",
    "lang_154": "签到",
    "lang_155": "模板",
    "lang_156": "可以创建各种单选题，多选题，开放式问题，听众可以通过移动端参与现场互动",
    "lang_157": "可以创建各种问题，方便您收集学生对您的提问",
    "lang_158": "可以创建各种讨论问题，让学生表达各自针对问题的观点",
    "lang_159": "用手机拍各小组的手写题板，并能够将图同步到现场大屏幕，分享给在场的每一位听众",
    "lang_160": "系统为您提供了四款游戏，听众现场游戏比拼，游戏分数前8名将公布于现场大屏幕",
    "lang_161": "可以创建选择题，问答题，方便统计到场的各位听众信息",
    "lang_162": "可以通过精选模板库来直接添加互动环节",
    "lang_163": "线上互动，翻转课堂",
    "lang_164": "方法一",
    "lang_165": "用URL邀请学员加入线上互动，收集信息，发起讨论；",
    "lang_166": "方法二",
    "lang_167": "打开微信扫描二维码，分享至微信群；",
    "lang_168": "方法三",
    "lang_169": "分享到微博、QQ空间等社交网站收集投票与反馈",
    "lang_170": "移动到此",
    "lang_171": "取消",
    "lang_172": "复制到此",
    "lang_173": "请输入",
    "lang_174": "内容",
    "lang_175": "移动",
    "lang_176": "问题",
    "lang_177": "展示问卷结果",
    "lang_178": "用户完成问卷后立即展示即时统计结果",
    "lang_179": "本环节的标题",
    "lang_180": "本环节的标题",
    "lang_181": "分享",
    "lang_182": "激活",
    "lang_183": "激活",
    "lang_184": "展示",
    "lang_185": "数据",
    "lang_186": "清空",
    "lang_187": "模版",
    "lang_188": "下一张",
    "lang_189": "上一张",
    "lang_190": "下载图片",
    "lang_191": "此互动环节尚未上传照片",
    "lang_192": "查看全部发言",
    "lang_193": "此互动环节尚未设置内容",
    "lang_194": "需要查看全部签到信息，可以通过下载",
    "lang_1941": "数据",
    "lang_195": "查看全部",
    "lang_196": "私有模板",
    "lang_197": "公用模板",
    "lang_198": "确定",
    "lang_199": "请输入问题",
    "lang_200": "请输入本环节的标题",
    "lang_201": "个互动环节",
    "lang_202": "互动环节",
    "lang_203": "系统将在",
    "lang_204": "秒",
    "lang_205": "后自动为您跳转到首页",
    "lang_206": "回到首页",
    "lang_207": "培训",
    "lang_208": "连续课程",
    "lang_209": "演讲",
    "lang_210": "会议",
    "lang_211": "活动",
    "lang_212": "其他",
    "lang_213": "内训",
    "lang_214": "公开课",
    "lang_215": "内部演讲",
    "lang_216": "公开演讲",
    "lang_217": "内部会议",
    "lang_218": "外部会议",
    "lang_219": "内部活动",
    "lang_220": "外部活动",
    "lang_221": "您之前尚有编辑的课程尚未完成，是否先回到未完成的课程？点击\"取消\"将继续您的操作",
    "lang_222": "您的课程尚未创建互动环节，无法进入中控台进行操作",
    "lang_223": "单选",
    "lang_224": "多选",
    "lang_225": "开放式",
    "lang_226": "不符合移动条件",
    "lang_227": "请填写邮箱格式的用户名",
    "lang_228": "密码长度为",
    "lang_229": "到",
    "lang_230": "之间的有效字符",
    "lang_231": "两次输入密码不一致",
    "lang_232": "请输入您注册时所用的邮箱",
    "lang_233": "姓名不能为空",
    "lang_234": "请输入正确格式的手机号码",
    "lang_235": "少于30人",
    "lang_236": "50人—100人",
    "lang_237": "30人—50人",
    "lang_238": "100人以上",
    "lang_239": "少于12场",
    "lang_240": "50场—100场",
    "lang_241": "12场—50场",
    "lang_242": "100场以上",
    "lang_243": "培训师",
    "lang_244": "内部培训师",
    "lang_245": "HR",
    "lang_246": "大学老师",
    "lang_247": "培训公司员工",
    "lang_248": "会展公司员工",
    "lang_249": "企业管理人员",
    "lang_250": "公司员工",
    "lang_251": "学生",
    "lang_2511": "演讲者",
    "lang_252": "教学",
    "lang_253": "小型会议",
    "lang_254": "大型会议",
    "lang_255": "团队活动",
    "lang_256": "免费",
    "lang_257": "季度版",
    "lang_2577": "¥",
    "lang_258": "一年版",
    "lang_259": "三年版",
    "lang_260": "五年版",
    "lang_261": "我的模板",
    "lang_262": "模板库",
    "lang_263": "邀请说明",
    "lang_264": "邀请方式",
    "lang_2641": "邀请方式",
    "lang_265": "我的邀请",
    "lang_266": "邀请好友成为高级版会员，你同样可以获得高级版的使用权限",
    "lang_267": "每成功邀请一位好友注册成为UMU一年版，三年版或者五年版会员，即可获得75天高级版使用权限 一年版、三年版和五年版统称为高级版",
    "lang_268": "<span>方法一</span>与朋友分享邀请链接",
    "lang_269": "分享到微博",
    "lang_270": "分享到微信",
    "lang_271": "分享到QQ",
    "lang_272": "<span>方法二</span>通过邀请码邀请",
    "lang_273": "您的邀请码是：",
    "lang_274": "被邀请用户在注册时填写您的邀请码，成功注册成为高级版会员后，您同样可以获得奖励",
    "lang_275": "方法三</span>通过发送电子邮件邀请好友",
    "lang_276": "收件人邮箱地址，并以逗号隔开",
    "lang_277": "发送邀请",
    "lang_278": "已发送的邮件",
    "lang_279": "已发送日期",
    "lang_280": "已邀请",
    "lang_281": "邀请时间",
    "lang_282": "产品套餐",
    "lang_283": "获得奖励",
    "lang_284": "邀请链接复制成功",
    "lang_285": "请输入邮箱地址",
    "lang_286": "用手机随时组织投票与讨论，用大屏幕同步展示互动结果 让移动互联网活跃培训课堂，让每个人融入，分享，收获 打破沉默的螺旋，汇聚观点的海洋 通过视频来了解UMU带给传统培训、教学的全新体验 快速建立讲师与学员的互动 UMU助力培训现场移动互联化 让每个学员融入课程，深度思考，充分表达  仅3分钟轻松创建一门课程   无需app拿起手机直接参与   效果震撼如幻灯片般流畅呈现   数据留存实现课程...",
    "lang_287": "账户信息",
    "lang_288": "个人资料",
    "lang_289": "账户安全",
    "lang_290": "互动号码",
    "lang_291": "套餐类型",
    "lang_292": "升级为高级版",
    "lang_293": "账户期限",
    "lang_294": "于",
    "lang_295": "结束",
    "lang_296": "注册时间",
    "lang_297": "个人资料",
    "lang_298": "我的身份",
    "lang_299": "使用场景",
    "lang_300": "联系电话",
    "lang_301": "地区",
    "lang_302": "地址",
    "lang_303": "邮编",
    "lang_304": "个人简介",
    "lang_305": "姓名",
    "lang_306": "请填写真实姓名，获得更好产品体验",
    "lang_307": "联系电话",
    "lang_308": "请填写手机号码，保护账号安全",
    "lang_309": "邮编",
    "lang_310": "选填",
    "lang_311": "请填写地址信息，方便我们为您寄送公司礼品和发票",
    "lang_312": "请填写您的最新个人简介，方便更多企业和学员选择您的课程",
    "lang_313": "密码",
    "lang_314": "修改密码",
    "lang_315": "请输入旧密码",
    "lang_316": "请输入新密码",
    "lang_317": "请重新输入新密码",
    "lang_318": "确认修改",
    "lang_319": "UMU互动平台・手机版",
    "lang_320": "您随身携带的创新互动平台",
    "lang_321": "iOS 版下载",
    "lang_322": "您也可以通过手机<br>扫描左侧二维码<br>免费下载并安装",
    "lang_323": "中央控制台",
    "lang_324": "正在进行中...",
    "lang_325": "已完成",
    "lang_326": "未完成",
    "lang_327": "激活",
    "lang_328": "展示",
    "lang_329": "刷新",
    "lang_330": "当前环节为",
    "lang_331": "照片数量",
    "lang_3311": "照片数量",
    "lang_332": "提交人数",
    "lang_3321": "提交人数",
    "lang_333": "全部人数",
    "lang_3331": "全部人数",
    "lang_334": "参与百分比",
    "lang_335": "待审核",
    "lang_336": "已通过",
    "lang_337": "已屏蔽",
    "lang_338": "屏蔽",
    "lang_339": "通过",
    "lang_340": "取消屏蔽",
    "lang_341": "批量通过以上",
    "lang_342": "批量屏蔽以上",
    "lang_343": "条",
    "lang_344": "条",
    "lang_345": "请选择您的身份",
    "lang_346": "请选择您的使用场景",
    "lang_347": "请输入您的姓名",
    "lang_348": "请输入您的联系电话",
    "lang_349": "请输入4至8位的数字",
    "lang_350": "请详细描述您的问题",
    "lang_351": "请提供您的联系方式",
    "lang_352": "反馈已提交成功,感谢您的支持",
    "lang_3521": "反馈已提交成功,感谢您的支持",
    "lang_353": "Opps，访问过程中出现异常错误。",
    "lang_354": "请选择套餐类型",
    "lang_355": "请选支付方式",
    "lang_356": "请输入有效验证码",
    "lang_357": "尚未同意服务协议",
    "lang_358": "免费版",
    "lang_359": "高级版",
    "lang_3591": "体验版",
    "lang_360": "企业版",
    "lang_361": "两次新密码输入不一致",
    "lang_362": "密码修改成功",
    "lang_363": "全屏",
    "lang_364": "取消全屏",
    "lang_365": "已有",
    "lang_366": "共有",
    "lang_367": "确定要删除该模版吗？",
    "lang_368": "数据加载异常，请再次刷新重试",
    "lang_369": "不满足移动条件",
    "lang_370": "需季度版及以上",
    "lang_371": "需三年版及以上",
    "lang_372": "需五年版",
    "lang_373": "一月",
    "lang_374": "二月",
    "lang_375": "三月",
    "lang_376": "四月",
    "lang_377": "五月",
    "lang_378": "六月",
    "lang_379": "七月",
    "lang_380": "八月",
    "lang_381": "九月",
    "lang_382": "十月",
    "lang_383": "十一月",
    "lang_384": "十二月",
    "lang_385": "感谢您帮助我们做的更好！",
    "lang_386": "您的意见和反馈将给我们提供最宝贵的发展机会，我们非常愿意听取您的任何建议和意见。",
    "lang_387": "请详细描述您遇到的问题，以便我们更准确地为您解决问题",
    "lang_388": "请告诉我们如何称呼您以及如何与您取得联系",
    "lang_389": "我愿意就这个问题通过电话进行沟通",
    "lang_3891": "或请致电400-007-2121联络我们",
    "lang_390": "提交反馈",
    "lang_391": "日",
    "lang_392": "一",
    "lang_393": "二",
    "lang_394": "三",
    "lang_395": "四",
    "lang_396": "五",
    "lang_397": "六",
    "lang_398": "还只需要两步，你立即就能体验UMU了！",
    "lang_399": "注册账号",
    "lang_400": "完善资料",
    "lang_401": "选择互动号码",
    "lang_402": "如果您被邀请注册，请填写邀请码",
    "lang_403": "下一步",
    "lang_404": "还只需要一步，你立即就能体验UMU了！",
    "lang_405": "恭喜您获得三年版互动号码的试用权：",
    "lang_406": "说明：",
    "lang_407": "互动号码是您在培训现场时听众参与互动时候的号码",
    "lang_408": "您可试用该号码31天，在这31天内您可试用UMU产品的所有功能，试用期间成功付款后即可获得此号码",
    "lang_409": "试用31天后，如果您未付费，该号码将失效，你将获得系统为您推荐的体验版的互动号码（仅能试用产品部分功能）",
    "lang_410": "立即体验",
    "lang_411": "或者",
    "lang_412": "选择您更喜欢的号码，先到先得，与众不同的吉祥号码等您挑选。",
    "lang_413": "请至少输入四位数来搜索",
    "lang_414": "搜索",
    "lang_415": "筛选：",
    "lang_416": "不限",
    "lang_417": "季度版或一年版",
    "lang_418": "立即抢购选中号码",
    "lang_419": "重新选择互动号码",
    "lang_420": "年费方案",
    "lang_421": "1季度",
    "lang_422": "原价",
    "lang_423": "1年",
    "lang_424": "3年",
    "lang_425": "5年",
    "lang_426": "",
    "lang_427": "",
    "lang_428": "",
    "lang_429": "",
    "lang_430": "",
    "lang_431": "",
    "lang_432": "",
    "lang_433": "",
    "lang_434": "支付方式",
    "lang_435": "支付宝支付",
    "lang_436": "银行转账",
    "lang_437": "验证码",
    "lang_438": "请输入右验证码",
    "lang_439": "看不清，换一张",
    "lang_440": "选号规则",
    "lang_441": "本人同意并接受UMU号码规则，",
    "lang_442": "阅读选号规则",
    "lang_443": "放弃订单并返回",
    "lang_444": "确认订单",
    "lang_445": "当前环节为",
    "lang_446": "点击屏幕下方",
    "lang_447": "，切换大屏幕展示深浅色效果",
    "lang_448": "拖动此页面到投影仪大屏幕",
    "lang_449": "移动到大屏幕后请点击",
    "lang_450": "，实现全屏展示",
    "lang_451": "点击屏幕下方",
    "lang_452": "二维码图标，方便学员通过扫描加入现场互动",
    "lang_453": "使用手中的翻页器，或空格键，或屏幕下方",
    "lang_454": "进行翻页",
    "lang_455": "立即开始互动",
    "lang_456": "输入网址",
    "lang_457": "互动号码",
    "lang_458": "参与互动",
    "lang_459": "进入现场互动",
    "lang_460": "人已经提交",
    "lang_461": "<p>感谢你的参与,</p> <p>现场问卷环节已结束</p>",
    "lang_462": "已用时间",
    "lang_463": "人已经提交",
    "lang_464": "<span class=\"logo\">UMU</span>创新互动平台",
    "lang_465": "你可通过",
    "lang_466": "来了解更多",
    "lang_467": "结束此环节",
    "lang_468": "请填写课程标题",
    "lang_469": "请输入内容",
    "lang_470": "课程名称",
    "lang_471": "客户名称",
    "lang_472": "参与人数",
    "lang_473": "举办地点",
    "lang_474": "演讲主题",
    "lang_475": "主办方",
    "lang_476": "听众人数",
    "lang_477": "演讲地点",
    "lang_478": "会议主题",
    "lang_479": "参会人数",
    "lang_480": "会议地点",
    "lang_481": "活动名称",
    "lang_482": "活动人数",
    "lang_483": "活动地点",
    "lang_484": "互动环节在点击确定按钮后将被激活。",
    "lang_485": "添加此环节到我的模板",
    "lang_486": "模板名称",
    "lang_487": "注：添加到我的模板后可以在模板管理页面进行管理",
    "lang_488": "请填写模版名称",
    "lang_489": "模版添加成功!",
    "lang_490": "是否清空此互动环节内所有数据，清除数据后不能恢复",
    "lang_491": "收起",
    "lang_492": "更多",
    "lang_493": "自动审核",
    "lang_494": "手动审核",
    "lang_495": "确定要删除此互动环节吗？",
    "lang_496": "确定要删除此问题吗？",
    "lang_497": "问题删除成功",
    "lang_498": "单选题",
    "lang_499": "多选题",
    "lang_500": "开放式",
    "lang_501": "请输入提示内容",
    "lang_5011": "请输入内容",
    "lang_502": "请输入选项内容，回车自动创建下一个选项",
    "lang_5021": "请输入选项内容，回车自动创建下一个选项",
    "lang_503": "URL地址复制成功",
    "lang_504": "分享链接复制成功",
    "lang_505": "参与人数",
    "lang_506": "提交人数",
    "lang_507": "连连看 排行榜",
    "lang_508": "从小到大 排行榜",
    "lang_509": "分门别类 排行榜",
    "lang_510": "找不同 排行榜",
    "lang_511": "总排行榜",
    "lang_512": "关键词云",
    "lang_513": "第",
    "lang_514": "邀请码",
    "lang_515": "回顶部",
    "lang_516": "意见反馈",
    "lang_517": "确定要删除此课程吗?",
    "lang_518": "选填",
    "lang_519": "模版",
    "lang_520": "模版",
    "lang_521": "<p>UMU大屏幕在Chrome上表现最好！现在就下载安装Chrome浏览器。</p><p style=\"color:#999\">*继续使用IE浏览器可能会无法完美展示</p>",
    "lang_522": "http://dlsw.baidu.com/sw-search-sp/soft/9d/14744/ChromeStandalone_V42.0.2311.135_Setup.1430289688.exe",
    "lang_523": "您可以邀请学员通过手机浏览器访问",
    "lang_524": "，输入您的专属互动号码",
    "lang_525": "来参与互动。您可以通过 “展示” 功能使用大屏幕结果展示页来展示互动进度和结果",
    "lang_526": "切换颜色",
    "lang_527": "二维码",
    "lang_528": "上一页",
    "lang_529": "下一页",
    "lang_530": "上一题",
    "lang_531": "下一题",
    "lang_532": "请在手机浏览器地址栏中输入：",
    "lang_533": "请使用微信、QQ中的扫一扫功能，或者使用二维码工具扫描此二维码加入互动",
    "lang_534": "http://umuvideo.qiniudn.com/UMU-1110-01.mp4",
    "lang_535": "月版(en专用)",
    "lang_536": "季度版(en专用)",
    "lang_5366": "年版(en专用)",
    "lang_5367": "三年版(en专用)",
    "lang_5368": "月版或季度版(en专用)",
    "lang_537": "姓(en专用)",
    "lang_538": "人",
    "lang_539": "../../view/help.dwt",
    "lang_540": "下载谷歌浏览器",
    "lang_541": "Android 版下载",
    "lang_542": "我们为您切换到了 ",
    "lang_5421": " 由本地服务器提供更加优质的服务",
    "lang_543": "返回",
    "lang_544": "留在这里",
    "lang_545": "这个月暂时还没有活动，<br>点击左上方的“+”随时创建活动。",
    "lang_546": "../../view/static/termcondition.html",
    "lang_547": "../../view/static/acceptable-use.html",
    "lang_548": "../../view/static/privacy-policy.html",
    "lang_549": "../../view/member.dwt",
    "lang_550": "重设密码",
    "lang_551": "images/logo_display_2.png",
    "lang_552": "../../view/static/about-us.dwt",
    "lang_553": "副本",
    "lang_554": "请选择使用场景",
    "lang_555": "您已获得",
    "lang_556": "天 的使用权",
    "lang_557": "使用权限至",
    "lang_558": "亲爱的用户：在每一互动环节，UMU免费版可提供最多30个互动数据，供您浏览、展示和导出，敬请留意。如需使用全部互动数据，请升级至高级版或企业版。<a href=\"/#/member\">立即升级</a>",
    "lang_559": "请输入有效的参与人数",
    "lang_560": "分",
    "lang_561": "匿名",
    "lang_562": "预约成功！我们的客服人员会在1个工作日内与您联系",
    "lang_563": "预览报告",
    "lang_564": "请选择要导出的数据 <span style=\"font-size:12px\">(点击下方鹿头,可选择或取消要生成报告的互动环节)</span>",
    "lang_565": "您现在使用的是UMU体验版 — 诚邀您升级至UMU高级版，解锁全部数据并获得更好体验",
    "lang_566": "请访问",
    "lang_567": ",输入互动号码",
    "lang_568": ",立即签到",
    "lang_569": "人已签到",
    "lang_5691": "人已签到",
    "lang_570": "生成PDF",
    "lang_571": "个选项",
    "lang_572": "个选项",
    "lang_573": "人参与",
    "lang_574": "暂时没有个人模版。点击“模版”，将您常用的互动环节保存为“我的模版”",
    "lang_575": "images/23_52ab8d2.png",
    "lang_576": "扫描下载iOS版",
    "lang_577": "扫描下载Android版",
    "lang_578": "https://itunes.apple.com/cn/app/umu/id949828272",
    "lang_579": "http://7u2qmc.com2.z0.glb.qiniucdn.com/umu1.1.apk",
    "lang_580": "images/QR/iOS.png",
    "lang_581": "images/QR/Android.png",
    "lang_582": "../../view/static/spahelp.html",
    "lang_583": "../../view/static/spahelpandroid.html"
};


/*-------------------------------------------------------------------------------*/


function languageHelper() {
    var currentBtnStyle = "cursor: pointer; width: 80px;height: 30px;display: block;background: #cacaca;line-height: 30px;text-align: center;color: #333333;border-bottom:1px solid #aaaaaa";
    var btnStyle = "cursor: pointer; width: 80px;height: 30px;display: block;background: #aaa;line-height: 30px;text-align: center;color: #333333;border-bottom:1px solid #aaaaaa";

    var currentlang = getCookie('_SYSTEM');


    var html = '<div class="chrome-ext-umu" style="width:80px;height:100px;z-index:99999; position:fixed; bottom:50px; left:20px;">'
        + '<a class="chrome-ext-umu-lang-close" style="display: inline-block;position: relative;top: 0;left: 70px;cursor: pointer;">X</a>'
        + '<a class="chrome-ext-umu-lang" style="' + (currentlang === 'TW' ? currentBtnStyle : btnStyle) + '" data-index="1">台湾</a>'
        + '<a class="chrome-ext-umu-lang" style="' + (currentlang === 'CN' ? currentBtnStyle : btnStyle) + '" data-index="2">大陆</a>'
        + '<a class="chrome-ext-umu-lang" style="' + (currentlang === 'EN' ? currentBtnStyle : btnStyle) + '" data-index="3">国际</a>'
        + '<a class="chrome-ext-umu-lang" style="' + (currentlang === 'JP' ? currentBtnStyle : btnStyle) + '" data-index="4">日本语</a>'
        + '</div>';


    var panel = document.createElement("div");

    panel.innerHTML = html;
    var body = document.querySelector('body');
    body.appendChild(panel);
    var btns = document.querySelectorAll('.chrome-ext-umu-lang');

    for (var i = 0; i < btns.length; i++) {

        btns[i].addEventListener('click', function (e) {
            var target = e.target;
            var index = target.getAttribute('data-index');

            var systemMap = {
                '1': 'TW',
                '2': 'CN',
                '3': 'EN',
                '4': 'JP'
            };
            var langMap = {
                '1': 'ch-tw',
                '2': 'ch-cn',
                '3': 'en-us',
                '4': 'ja-jp'
            };
            setCookie(systemMap[index], langMap[index]);
            location.reload();
        });
    }

    var close = document.querySelector('.chrome-ext-umu-lang-close');
    close.addEventListener('click', function (e) {
        body.removeChild(panel);
        enableTranslate = false;

    });

}

function getCookie(name) {
    var arr = '';
    var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}


function setCookie(system, lang) {
    document.cookie = "_SYSTEM=" + system + ";path=/";
    document.cookie = "_lang=" + lang + ";path=/";
}


// languageHelper();


/*-------------------------------------------------------------------------------*/


var currentVersion = 'pd';
var ja_jp, zh_cn;
var enableTranslate = true;

var version = {
    w: '学员wap',
    m: '讲师wap',
    pd: '讲师pc端'
};

// 判断版本
function getVersion() {
    var url = window.location.href;
    if (url.indexOf('w.') >= 0) {
        return 'w';
    }
    if (url.indexOf('m.') >= 0) {
        return 'm';
    }

    if (url.indexOf('pd.') >= 0) {
        return 'pd';
    }

}

function findCnWord(word) {

    if (!word) {
        return '';
    }

    var langKey = '';


    for (var key in ja_jp) {
        if (ja_jp[key].indexOf(word) >= 0) {
            langKey = key;
            break;

        }
    }

    if (!langKey) {
        return word;
    }

    return zh_cn[langKey];
}

// 如果子元素没有文本则显示
function haveOtherText(node) {

    var hasTextNode = false;

    if (node && node.hasChildNodes()) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeType === 1 && !!node.childNodes[i].textContent) {
                hasTextNode = true;
                break;
            }
        }
    }

    return hasTextNode;
}

// 如果子节点没有文本,取改元素的部分文字
function getElmPartText(node) {
    var word = '';
    if (node && node.hasChildNodes()) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeType === 3) {
                word = node.childNodes[i].textContent;
                break;
            }
        }
    }

    if (!word) {
        word = node.innerText;
    }

    return word;
}



// 翻译日文
function translateJp(elm) {

    if (elm.id == 'manage') {
        return;
    }


    var text = '';
    var color = '#000';
    var bgcolor = '#fff';

    if (elm.innerText == elm.textContent) {

        var word = elm.innerText;

        if (!word && (elm.tagName == 'INPUT' || elm.tagName == "TEXTAREA")) {
            word = $(elm).attr('placeholder');
        }


        text = findCnWord(word);


    } else {

        var isChildText = haveOtherText(elm);
        if (!isChildText) {
            var word = getElmPartText(elm);
            text = findCnWord(word);
        }

    }


    if (!!text) {
        var style = document.defaultView.getComputedStyle(elm, null);
        if (style) {
            color = style.color;
            bgcolor = style.backgroundColor;

            if ( color == 'rgb(255, 255, 255)') {
                color = '#34485b';

            }
        }

        console.log('%c' + text, 'color:' + color + ';background-color:' + bgcolor + ';');


    }


}


Zepto('document').ready(function () {

    var $ = Zepto;

    languageHelper();

    var currentlang = getCookie('_SYSTEM');


    currentVersion = getVersion();
    ja_jp = window['ja_jp_' + currentVersion];
    zh_cn = window['zh_cn_' + currentVersion];


    $('body').on('mouseover', function (e) {

        e.stopPropagation();
        // console.log(e);

        if (enableTranslate && currentlang == 'JP') {
            var elm = e.target;
            translateJp(elm);
        }

    });


});

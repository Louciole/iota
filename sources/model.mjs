class Node {
    constructor(key, props, proto = null) {
        this.key = key
        this.props = props
        this.proto = proto
        this.alive = true
    }

    instanciate(key, props = {}) {
        return new Node(key, props, this.key)
    }
}


export function snippet(xml) {
    return (g, loc) => {
        const dom = new DOMParser().parseFromString(xml, 'text/xml')

        function build(xnode, target) {
            const nodeKey = makeKey()
            const props = {}
            for (let attr of xnode.attributes) {
                props[attr.name] = attr.value
            }
            props['tag'] = xnode.tagName.toLowerCase()
            g.add(props, target)
            for (let child of xnode.childNodes) {
                build(child, new Target(nodeKey, Target.INSIDE))
            }
            return nodeKey
        }

        return build(dom.documentElement, loc)
    }
}

export class Target {
    static INSIDE = 'INSIDE'
    static BEFORE = 'BEFORE'
    static AFTER = 'AFTER'

    constructor(rel, loc) {
        this.rel = rel
        this.loc = loc
    }
}

class Graph {
    constructor() {
        this.nodes = {}
        this._childrenOf = {}
        this._parentOf = {}
    }

    _insert(target, node) {
        this.nodes[node.key] = node
        this._childrenOf[node.key] = []

        if (!target)
            return node.key

        switch (target.loc) {
            case Target.INSIDE: {
                if (!this._childrenOf[target.rel])
                    this._childrenOf[target.rel] = []
                this._childrenOf[target.rel].push(node.key)
                this._parentOf[node.key] = target.rel
                break
            }

            case Target.BEFORE: {
                const parentKey = this._parentOf[target.rel]
                if (!parent)
                    throw new Error('No parent')

                const index = this._childrenOf[parentKey].indexOf(target.rel)
                this._childrenOf[parentKey].splice(index, 0, node)
                this._parentOf[node.key] = parentKey
                break
            }

            case Target.AFTER: {
                const parentKey = this._parentOf[target.rel]
                if (!parent)
                    throw new Error('No parent')

                const index = this._childrenOf[parentKey].indexOf(target.rel)
                this._childrenOf[parentKey].splice(index + 1, 0, node)
                this._parentOf[node.key] = parentKey
                break
            }

            default:
                throw new Error('Unknown target location')
        }
        return node.key
    }

    add(target, props = {}, proto = null, key = null) {
        while (!key || this.nodes[key]) {
            key = Math.random().toString(36).substring(7)
        }

        if (!proto)
            return this._insert(target, new Node(key, props, null))

        console.group()
        this._insert(target, this.nodes[proto].instanciate(key, props))

        for (const child of this._childrenOf[proto]) {
            this.add(new Target(key, Target.INSIDE), {}, child)
        }
        console.groupEnd()

        return key
    }

    unlink(key) {
        this.nodes[key].alive = false
    }

    relink(key) {
        this.nodes[key].alive = true
    }

    update(key, prop, value) {
        const props = this.nodes[key].props
        const old = props[prop]
        if (value === undefined)
            delete props[prop]
        else
            props[prop] = value
        return old
    }

    parentOf(key) {
        return this._parentOf[key]
    }

    childrenOf(key) {
        return this._childrenOf[key]
    }

    siblingsOf(key) {
        const parent = this.parentOf(key)
        if (!parent)
            return []
        return this.childrenOf(parent.key)
    }

    dir(key) {
        if (!key) return {}
        parentKey = this.parentOf(key)
        props = this.dir(parentKey)

        for (let [_, v] of Object.entries(props)) {
            v.default = v.value
        }

        for (let [k, v] of Object.entries(this.nodes[key].props)) {
            if (props[k]) {
                props[k].value = v
                props[k].from = key
            } else {
                props[k] = { value: v, from: v }
            }
        }

        return props
    }

    dump(key, indent = 0) {
        const node = this.nodes[key]
        console.log(`${' '.repeat(indent * 4)}${node.key}`)
        for (let child of this._childrenOf[key]) {
            this.dump(child, indent + 1)
        }
    }

    dumpAll() {
        for (let [k, v] of Object.entries(this.nodes)) {
            if (!this.parentOf(k))
                this.dump(k)
        }
    }
}

class Transaction {
    constructor(model) {
        this.model = model
        this._applies = []
        this._reverts = []
        this._commited = false
    }

    _dispatch(action) {
        if (this._commited)
            throw new Error('Transaction already commited')
        this._applies.push(action)
        return this
    }

    insert = (target, props = {}, proto = null, key = null) =>
        this._dispatch((g) => {
            key = g.add(target, props, proto, key)
            return (g) => {
                g.unlink(key)
            }
        })

    remove = (key) =>
        this._dispatch((g) => {
            g.unlink(key)
            return (g) => {
                g.relink(key)
            }
        })

    update = (key, prop, value) =>
        this._dispatch((g) => {
            const old = g.update(key, prop, value)
            return (g) => {
                g.update(key, prop, old)
            }
        })

    dump = (key) =>
        this._dispatch((g) => {
            g.dump(key)
            return () => { }
        })

    commit() {
        if (this._commited)
            throw new Error('Transaction already commited')
        for (const a of this._applies)
            this._reverts.unshift(a(this.model._graph))
        this._commited = true
    }

    rollback() {
        if (!this._commited)
            throw new Error('Cannot rollback uncommited transaction')
        for (const r of this._reverts)
            r(this.model._graph)
        this._reverts = []
        this._commited = false
    }
}

export class Model {
    constructor() {
        this._graph = new Graph()
        this._transactions = []
        this._transactionsIndex = 0
    }

    /**
     * @returns {Transaction}
     */
    begin() {
        if (this._transactionsIndex !== this._transactions.length)
            this._transactions.splice(this._transactionsIndex)
        let transaction = new Transaction(this)
        this._transactions.push(transaction)
        return transaction
    }

    undo() {
        if (this._transactionsIndex === 0)
            throw new Error('Cannot undo')
        this._transactions[--this._transactionsIndex].rollback()
    }

    canUndo() {
        return this._transactionsIndex > 0
    }

    redo() {
        if (this._transactionsIndex === this._transactions.length)
            throw new Error('Cannot redo')
        this._transactions[this._transactionsIndex++].commit()
    }

    canRedo() {
        return this._transactionsIndex < this._transactions.length
    }
}

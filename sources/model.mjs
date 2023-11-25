class Node {
    constructor(key, props, proto = null, root = false) {
        this.key = key
        this.props = props
        this.proto = proto
        this.root = root
        this.alive = true
    }
}


export function snippet(xml) {
    /**
     * @param {Graph} graph
    */
    return (g, loc) => {
        const dom = new DOMParser().parseFromString(xml, 'text/xml')

        function build(xmlNode, parentKey) {
            const nodeKey = makeKey()
            const node = new Node(nodeKey, xmlNode.tagName, {})
            graph.add(node, parent)
            for (let child of xmlNode.childNodes) {
                build(child, nodeKey)
            }

            return nodeKey
        }

        return build(dom.documentElement, parent)
    }
}

class Target {
    INSIDE = Symbol('INSIDE')
    BEFORE = Symbol('BEFORE')
    AFTER = Symbol('AFTER')

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

    _insert(node, target) {
        this.nodes[node.key] = node
        if (target) {
            switch (target.loc) {
                case Target.INSIDE: {
                    if (!this._childrenOf[loc.rel])
                        this._childrenOf[loc.rel] = []
                    this._childrenOf[loc.rel].push(node)
                    this._parentOf[node.key] = loc.rel
                    break
                }

                case Target.BEFORE: {
                    const parentKey = this._parentOf[loc.rel]
                    if (!parent)
                        throw new Error('No parent')

                    const index = this._childrenOf[parentKey].indexOf(loc.rel)
                    this._childrenOf[parentKey].splice(index, 0, node)
                    this._parentOf[node.key] = parentKey
                    break
                }

                case Target.AFTER: {
                    const parentKey = this._parentOf[loc.rel]
                    if (!parent)
                        throw new Error('No parent')

                    const index = this._childrenOf[parentKey].indexOf(loc.rel)
                    this._childrenOf[parentKey].splice(index + 1, 0, node)
                    this._parentOf[node.key] = parentKey
                    break
                }
            }
        }
        this._parentOf[node.key] = parent
        return node.key
    }

    add(props, loc, proto = null) {
        let key = ""
        do {
            key = Math.random().toString(36).substring(7)
        } while (this.nodes[key])
        const node = new Node(key, props, proto)
        return this._insert(node, loc)
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
                props[k].from = v
            } else {
                props[k] = { value: v, from: v }
            }
        }

        return { ...this.dir(this.parentOf(key)), ...this.nodes[key].props }
    }

    dump(key, indent = 0) {
        const node = this.nodes[key]
        console.log(`${' '.repeat(indent * 4)}${node.key}`)
        for (let child of this._childrenOf[key]) {
            this.dump(child, indent + 1)
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

    insert = (proto, target, loc) =>
        this._dispatch((g) => {
            const key = g.add(proto, target, loc)
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

    dump = () =>
        this._dispatch((g) => {
            g.dump()
            return () => { }
        })

    commit() {
        if (this._commited)
            throw new Error('Transaction already commited')
        for (const a of this._applies)
            this._reverts.insert(0, a(this.model._graph))
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
    constructor(_target) {
        this._graph = new Graph()
        this._transactions = []
        this._transactionsIndex = 0
    }

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

    hasUndo() {
        return this._transactionsIndex > 0
    }

    redo() {
        if (this._transactionsIndex === this._transactions.length)
            throw new Error('Cannot redo')
        this._transactions[this._transactionsIndex++].commit()
    }

    hasRedo() {
        return this._transactionsIndex < this._transactions.length
    }
}

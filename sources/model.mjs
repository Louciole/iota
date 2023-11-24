class Node {
    constructor(key, type, props, proto = null) {
        this.key = key
        this.type = type
        this.props = props
        this.proto = proto
    }
}

class Action {
    apply(graph) { }
    revert(graph) { }
}

class Drop extends Action {
    INSIDE = 0
    BEFORE = 1
    AFTER = 2

    constructor(node, target, location) {
        super()
        this.node = node
        this.target = target
        this.location = location
    }
}

class Graph {
    constructor() {
        this.nodes = {}
        this.edges = {}
    }
}


class Model {
    constructor() {
        this.graph = new Graph()
        this.actions = []
    }
}
